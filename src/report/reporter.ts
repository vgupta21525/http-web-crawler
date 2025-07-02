import { Crawler } from "../crawler/crawler";
import { Link } from "../crawler/link";

export function printReport(crawler: Crawler): void {
    console.log('===============');
    console.log('REPORT');
    console.log('===============');

    const internal = [...crawler.linkMap.values()]
        .filter(link => link.isInternal)
        .sort((a, b) => b.timesLinked - a.timesLinked);
    const internalStatus: Record<string, Link[]> = {
        OK: [],
        Redirect: [],
        Broken: [],
        Failed: []
    };
    internal.forEach(link => internalStatus[link.statusCategory]?.push(link));
    console.log(`\nInternal Links Summary: ${internal.length} links`);
    for (const [category, links] of Object.entries(internalStatus)) {
        console.log(`\n${category}: ${links.length} links`)
        links.forEach(link => {
            console.log(`Found ${link.timesLinked} links to URL: ${link.urlString} with status: ${link.status} (${link.statusText})`);
            if (link.statusCategory === 'Redirect') {
                console.log(`${link.urlString} -> ${link.redirectsTo}`);
            }
        });
    }

    const external = [...crawler.linkMap.values()]
        .filter(link => !link.isInternal)
        .sort((a, b) => b.timesLinked - a.timesLinked);
    const externalStatus: Record<string, Link[]> = {
        OK: [],
        Redirect: [],
        Broken: [],
        Failed: []
    };
    external.forEach(link => externalStatus[link.statusCategory]?.push(link));
    console.log(`\nExternal Links Summary: ${external.length} links`);
    for (const [category, links] of Object.entries(externalStatus)) {
        console.log(`\n${category}: ${links.length} links`)
        links.forEach(link => {
            console.log(`Found ${link.timesLinked} links to URL: ${link.urlString} with status: ${link.status} (${link.statusText})`);
            if (link.statusCategory === 'Redirect') {
                console.log(`${link.urlString} -> ${link.redirectsTo}`);
            }
        });
    }

    console.log('===============');
    console.log('END REPORT');
    console.log('===============');
}