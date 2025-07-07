import minimist from "minimist";
import { Crawler } from "./crawler/crawler";
import { printReport } from "./report/reporter";

async function main(): Promise<void> {
    const args = minimist(process.argv.slice(2));
    validateCLIArguments(args);
    const baseURL: string = args._[0];
    const retries: number = args.retries ?? 3;
    const crawler: Crawler = new Crawler(baseURL, retries);
    console.log(`Starting web crawler for ${baseURL}`);
    await crawler.start();
    printReport(crawler);
}

function validateCLIArguments(args: minimist.ParsedArgs): void {
    if (!args._ || args._.length === 0) {
        console.log('No website provided.');
        process.exit(1);
    }
    if (args.retries) {
        if (typeof args.retries !== 'number') {
            console.log('Please provide a numerical value for the number of retries.');
            process.exit(1);
        } else if (args.retries < 0 || args.retries > 10) {
            console.log('Please provide a number between 0 and 10 for the retries flag.');
            process.exit(1);
        }
    }
}

main();