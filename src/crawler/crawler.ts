import { getURLsFromHTML } from "../parser/html-parser";
import { logError } from "../util/log-utils";
import { Link } from "./link";

export class Crawler {
    private baseLink: Link;
    private visitedLinks: Set<Link>;
    public linkMap: Map<string, Link>;

    constructor (baseURL: string) {
        this.baseLink = new Link(baseURL);
        this.visitedLinks = new Set();
        this.linkMap = new Map();
        this.linkMap.set(this.baseLink.urlString, this.baseLink);
    }

    async start(): Promise<void> {
        await this.crawlPage(this.baseLink);
    }

    private async crawlPage(currentLink: Link, sourceLink?: Link): Promise<void> {
        if (this.visitedLinks.has(currentLink)) {
            return;
        }
        this.visitedLinks.add(currentLink);

        await currentLink.checkStatus();
        if (!currentLink.isParseable()) {
            return;
        }

        console.log(`Actively crawling ${currentLink.urlString}`);
        try {
            const response = await fetch(currentLink.url);
            const htmlBody = await response.text();
            const urls = getURLsFromHTML(htmlBody, this.baseLink);

            for (const url of urls) {
                const childLink = this.getLinkforURL(url, sourceLink);
                if (childLink.isInternal) {
                    this.crawlPage(childLink, currentLink);
                }
            }
        }
        catch (error) {
            currentLink.status = null;
            logError(error, `fetching HTML response for URL: ${currentLink.url}`);
        }
    }

    private getLinkforURL(url: string, sourceLink?: Link): Link {
        let link = this.linkMap.get(url);
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