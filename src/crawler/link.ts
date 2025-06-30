import { logError } from "../util/log-utils";
import { normalizeURL } from "../util/url-utils";

export class Link {
    url: URL;
    urlString: string;
    status: number | null;
    contentType?: string | null;
    sources: Set<Link>;
    isInternal: boolean;

    constructor (url: string, baseURL?: Link, origin?: Link) {
        try {
            this.url = new URL(url);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Invalid URL: ${error.message}`);
            }
            else {
                throw new Error(`Could not parse URL because ${error}`);
            }
        }
        this.urlString = normalizeURL(this.url);
        this.status = null;
        this.sources = new Set();
        if (origin) {
            this.sources.add(origin);
        }
        this.isInternal = baseURL ? baseURL.url.hostname === this.url.hostname : true;
    }

    async checkStatus(): Promise<void> {
        try {
            const response = await fetch(this.url, {
                'method': 'HEAD',
                'redirect': 'manual'
            });
            this.status = response.status;
            this.contentType = response.headers?.get('content-type');
        } catch (err) {
            logError(err, `while fetching headers for URL: ${this.urlString}`);
        }
    }

    isParseable(): boolean {
        return (
            this.status !== null
            && this.status < 400
            && (this.contentType?.includes('text/html') ?? false)
            && this.isInternal
        );
    }
}