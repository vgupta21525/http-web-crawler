import { Crawler } from "../crawler/crawler";

export function printReport(crawler: Crawler): void {
    console.log('===============');
    console.log('REPORT');
    console.log('===============');

    const internal = [...crawler.linkMap.values()]
        .filter(link => link.isInternal)
        .sort((a, b) => b.timesLinked - a.timesLinked);
    console.log('\nInternal Links');
    internal.forEach(link => console.log(`Found ${link.timesLinked} links to URL: ${link.urlString}`));

    const external = [...crawler.linkMap.values()]
        .filter(link => !link.isInternal)
        .sort((a, b) => b.timesLinked - a.timesLinked);
    console.log('\nExternal Links');
    external.forEach(link => console.log(`Found ${link.timesLinked} links to URL: ${link.urlString}`));

    const broken = [...crawler.linkMap.values()]
        .filter(link => link.status === null || link.status >= 400)
        .sort((a, b) => b.timesLinked - a.timesLinked);
    console.log('\nBroken Links');
    broken.forEach(link => console.log(`Found ${link.timesLinked} links to URL: ${link.urlString}`));

    console.log('===============');
    console.log('END REPORT');
    console.log('===============');
}