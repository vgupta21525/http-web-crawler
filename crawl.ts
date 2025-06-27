import { JSDOM } from 'jsdom';

function getURLsFromHTML(htmlBody: string, baseURL: string): string[] {
    const urls: string[] = [];
    const dom: JSDOM = new JSDOM(htmlBody);
    const linkElements: NodeListOf<HTMLAnchorElement> = dom.window.document.querySelectorAll('a');
    for (const linkElement of linkElements) {
        if (linkElement.href.slice(0, 1) === '/') {
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

export { normalizeURL, getURLsFromHTML };