import { crawlPage } from "./crawl";

function main(): void {
    if (process.argv.length < 3) {
        console.log('No website provided.');
        process.exit(1);
    } else if (process.argv.length > 3) {
        console.log('Too many command line arguments.');
        process.exit(1);
    }

    const baseURL: string = process.argv[2];
    console.log(`Starting web crawler for ${baseURL}`);
    crawlPage(baseURL);
}

main();