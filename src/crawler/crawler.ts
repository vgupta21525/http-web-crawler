import { getURLsFromHTML } from "../parser/html-parser";
import { logError } from "../util/log-utils";
import { normalizeURL } from "../util/url-utils";
import { Link } from "./link";

export class Crawler {
    private baseLink: Link;
    private retries: number;
    private visitedLinks: Set<Link>;
    public linkMap: Map<string, Link>;

    constructor (baseURL: string, retries: number) {
        this.baseLink = new Link(baseURL);
        this.visitedLinks = new Set();
        this.linkMap = new Map();
        this.linkMap.set(this.baseLink.urlString, this.baseLink);
        this.retries = retries;
    }

    async start(): Promise<void> {
        await this.crawlPage(this.baseLink);
    }

    private async crawlPage(currentLink: Link): Promise<void> {
        if (this.visitedLinks.has(currentLink)) {
            return;
        }
        this.visitedLinks.add(currentLink);

        await currentLink.checkStatus(this.retries);
        if (currentLink.isRedirectLink()) {
            await this.handleRedirects(currentLink);
            return;
        }
        if (!currentLink.isParseable()) {
            return;
        }

        console.log(`Actively crawling ${currentLink.urlString}`);
        let urls: string[] = [];
        try {
            const response = await fetch(currentLink.url);
            const htmlBody = await response.text();
            urls = getURLsFromHTML(htmlBody, this.baseLink);
        }
        catch (error) {
            currentLink.status = null;
            logError(error, `fetching HTML response for URL: ${currentLink.url}`);
        }

        for (const url of urls) {
            let childLink: Link;
            try {
                childLink = this.getLinkforURL(url, currentLink);
            }
            catch (error) {
                logError(error, `parsing child link: ${url} for URL: ${currentLink.urlString}`);
                continue;
            }

            childLink.timesLinked += 1;
            if (childLink.redirectsTo) {
                const redirectLink: Link = this.getLinkforURL(childLink.redirectsTo);
                redirectLink.timesLinked += 1;
            }
            await this.crawlPage(childLink);
        }
    }

    private async handleRedirects(currentLink: Link): Promise<void> {
        if (!currentLink.redirectsTo) {
            console.log(`The URL: ${currentLink.urlString} does not redirect to any location.`);
            return;
        }

        let redirectLink: Link;
        try {
            redirectLink = this.getLinkforURL(currentLink.redirectsTo, currentLink);
            redirectLink.timesLinked += 1;
            currentLink.redirectsTo = redirectLink.urlString;
        }
        catch (error) {
            logError(error, `parsing redirect target: ${currentLink.redirectsTo} for URL: ${currentLink.urlString}`);
            return;
        }

        console.log(`URL ${currentLink.urlString} redirects to URL ${redirectLink.urlString}`);
        await this.crawlPage(redirectLink);
    }

    private getLinkforURL(url: string, sourceLink?: Link): Link {
        let link = this.linkMap.get(normalizeURL(url, sourceLink?.url));
        if (!link) {
            link = new Link(url, this.baseLink, sourceLink);
            this.linkMap.set(link.urlString, link);
        }

        if (sourceLink) {
            link.sources.add(sourceLink);
        }
        return link;
    }
}