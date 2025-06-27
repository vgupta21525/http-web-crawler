import { JSDOM } from 'jsdom';

async function crawlPage(currentURL: string) {
    console.log(`Actively crawling: ${currentURL}`);
    
    try {
        const response = await fetch(currentURL);
        if (response.status > 399) {
            console.log(`Error in fetch with status code: ${response.status} on page: ${currentURL}`);
            return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('text/html')) {
            console.log(`Non-HTML response, content-type: ${contentType} on page: ${currentURL}`);
            return;
        }


        console.log(await response.text());
    } catch (err) {
        if (err instanceof Error) {
            console.log(`Error while fetching ${currentURL}: ${err.message}`);
        }
        else {
            console.log(`Unexpected error while fetching ${currentURL}: ${err}`);
        }
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
                if (err instanceof Error) {
                    console.log(`Error with relative URL: ${err.message}`);
                } else {
                    console.log(`Unknown error with relative URL: ${err}`);
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
                    console.log(`Error with absolute URL: ${err}`);
                } else {
                    console.log(`Unknown error with absolute URL: ${err}`);
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