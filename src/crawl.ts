import { JSDOM } from 'jsdom';
import { logError } from './util/log';

async function crawlPage(
    baseURL: string,
    currentURL: string,
    pages: Record<string, number>
): Promise<Record<string, number>> {
    const baseURLObj: URL = new URL(baseURL);
    const currentURLObj: URL = new URL(currentURL);

    const normalizedCurrentURL = normalizeURL(currentURL);
    if (pages[normalizedCurrentURL] > 0) {
        pages[normalizedCurrentURL]++;
        return pages;
    }
    pages[normalizedCurrentURL] = 1;
    
    if (baseURLObj.hostname !== currentURLObj.hostname) {
        return pages;
    }
    
    console.log(`Actively crawling: ${currentURL}`);
    try {
        const response = await fetch(currentURL);
        if (response.status > 399) {
            console.log(`Error in fetch with status code: ${response.status} on page: ${currentURL}`);
            return pages;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('text/html')) {
            console.log(`Non-HTML response, content-type: ${contentType} on page: ${currentURL}`);
            return pages;
        }

        const htmlBody = await response.text();
        const nextURLs = getURLsFromHTML(htmlBody, baseURL);
        for (const nextURL of nextURLs) {
            pages = await crawlPage(baseURL, nextURL, pages);
        }
    } catch (err) {
        logError(err, `fetching ${currentURL}`);
    }

    return pages;
}

async function isValidURL(urlString: string): Promise<number> {
    try {
        const response = await fetch(urlString, {
            'method': 'HEAD',
            'redirect': 'manual'
        });
        return response.status;
    } catch (err) {
        logError(err, `requesting headers for ${urlString}`);
        return 0;
    }
}

function getURLsFromHTML(htmlBody: string, baseURL: string): string[] {
    const urls: string[] = [];
    const dom: JSDOM = new JSDOM(htmlBody);
    const linkElements: NodeListOf<HTMLAnchorElement> = dom.window.document.querySelectorAll('a');
    for (const linkElement of linkElements) {
        if (linkElement.href.slice(0, 1) === '/') {
            // relative URL
            try {
                const urlObj: URL = new URL(`${baseURL}${linkElement.href}`);
                urls.push(urlObj.href);
            } catch (err) {
                logError(err, `parsing relative URL: ${linkElement.href} and base URL: ${baseURL}`);
            }
        } else {
            // absolute URL
            try {
                const urlObj: URL = new URL(linkElement.href);
                urls.push(linkElement.href);
            }
            catch (err) {
                logError(err, `parsing URL: ${linkElement.href}`);
            }
        }
    }
    return urls;
}

function normalizeURL(urlString: string): string {
    const urlObj: URL = new URL(urlString);
    const hostPath: string = `${urlObj.hostname}${urlObj.pathname}`;
    if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0, -1);
    }
    return hostPath;
}

export { normalizeURL, getURLsFromHTML, crawlPage };