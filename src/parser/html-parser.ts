import { JSDOM } from 'jsdom'
import { Link } from "../crawler/link";
import { logError } from '../util/log-utils';

export function getURLsFromHTML(htmlBody: string, baseURL: Link): string[] {
    const urls: string[] = [];
    const dom: JSDOM = new JSDOM(htmlBody);
    const anchorTags = dom.window.document.querySelectorAll('a[href]');

    anchorTags.forEach(tag => {
        try {
            const url = new URL(tag.getAttribute('href') || '', baseURL.url);
            urls.push(url.toString());
        } catch (error) {
            logError(error, `parsing URL: ${tag.getAttribute('href')} with baseURL: ${baseURL.url}`);
        }
    })

    return urls;
}