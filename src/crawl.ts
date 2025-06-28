import { JSDOM } from 'jsdom';

async function crawlPage(baseURL: string, currentURL: string, pages: Record<string, number>) {
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
        if (err instanceof Error) {
            console.log(`Error while fetching ${currentURL}: ${err.message}`);
        }
        else {
            console.log(`Unexpected error while fetching ${currentURL}: ${err}`);
        }
    }

    return pages;
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
                if (err instanceof Error) {
                    console.log(`Error with relative URL: ${linkElement.href} and base URL: ${baseURL} with message: ${err.message}`);
                } else {
                    console.log(`Unknown error with relative URL: ${linkElement.href} and base URL: ${baseURL} Error: ${err}`);
                }
            }
        } else {
            // absolute URL
            try {
                const urlObj: URL = new URL(linkElement.href);
                urls.push(linkElement.href);
            }
            catch (err) {
                if (err instanceof Error) {
                    console.log(`Error with absolute URL: ${linkElement.href} with message: ${err.message}`);
                } else {
                    console.log(`Unknown error with absolute URL: ${linkElement.href} Error: ${err}`);
                }
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