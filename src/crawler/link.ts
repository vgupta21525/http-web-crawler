import { logError } from "../util/log-utils";
import { normalizeURL } from "../util/url-utils";

export class Link {
    url: URL;
    urlString: string;
    status: number | null;
    statusText?: string;
    contentType?: string | null;
    sources: Set<Link>;
    timesLinked: number;
    isInternal: boolean;
    redirectsTo?: string;

    constructor (url: string, baseURL?: Link, origin?: Link) {
        const normalizedURL = normalizeURL(url, origin?.url);
        try {
            this.url = new URL(url, origin?.url);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Invalid URL: ${url}: ${error.message}`);
            }
            else {
                throw new Error(`Could not parse URL: ${url} because ${error}`);
            }
        }
        this.urlString = normalizedURL;
        this.status = null;
        this.sources = new Set();
        this.timesLinked = 0;
        if (origin) {
            this.sources.add(origin);
        }
        this.isInternal = baseURL ? baseURL.domainName === this.domainName : true;
    }

    async checkStatus(retries: number): Promise<void> {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const abortTimeout: NodeJS.Timeout = setTimeout(() => controller.abort(), 5000);
                const response = await fetch(this.url, {
                    'method': 'HEAD',
                    'redirect': 'manual',
                    'signal': controller.signal
                });
                clearTimeout(abortTimeout);

                this.status = response.status;
                this.statusText = response.statusText;
                this.contentType = response.headers?.get('content-type');
                if (this.status >= 300 && this.status < 400) {
                    const location = response.headers?.get('location');
                    if (location) {
                        this.redirectsTo = location;
                    }
                }

                return;
            } catch (err) {
                if (attempt === retries) {
                    logError(err, `while fetching headers for URL: ${this.urlString}`);
                    this.status = null;
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 300));
                console.log(`Retrying fetch headers for ${this.urlString}: Attempt ${attempt + 1} of ${retries}`);
            }
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

    isRedirectLink(): boolean {
        return (
            this.status !== null
            && this.status >= 300
            && this.status < 400
            && typeof this.redirectsTo === 'string'
        );
    }

    get statusCategory(): string {
        if (this.status === null) return 'Failed';
        else if (this.status >= 200 && this.status < 300) return 'OK';
        else if (this.status >= 300 && this.status < 400) return 'Redirect';
        else if (this.status >= 400 && this.status < 600) return 'Broken';
        else return `Unknown status: ${this.status}`;
    }

    get domainName(): string {
        return this.url.hostname.replace(/^www\./, '');
    }
}