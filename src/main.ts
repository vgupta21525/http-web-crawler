import { Crawler } from "./crawler/crawler";
import { printReport } from "./report/reporter";

async function main(): Promise<void> {
    validateCLIArguments();
    const baseURL: string = process.argv[2];
    const crawler: Crawler = new Crawler(baseURL);
    console.log(`Starting web crawler for ${baseURL}`);
    await crawler.start();
    printReport(crawler);
}

function validateCLIArguments(): void {
    if (process.argv.length < 3) {
        console.log('No website provided.');
        process.exit(1);
    } else if (process.argv.length > 3) {
        console.log('Too many command line arguments.');
        process.exit(1);
    }
}

main();