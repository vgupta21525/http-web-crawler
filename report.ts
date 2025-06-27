function printReport(pages: Record<string, number>) {
    console.log('=============');
    console.log('REPORT');
    console.log('=============');
    
    const sortedPages = sortPages(pages);
    for (const sortedPage of sortedPages) {
        const url = sortedPage[0];
        const frequency = sortedPage[1];
        console.log(`Found ${frequency} links to page: ${url}`);
    }

    console.log('=============');
    console.log('END REPORT');
    console.log('=============');
}

function sortPages(pages: Record<string, number>): [string, number][] {
    const pagesArray = Object.entries(pages);
    pagesArray.sort((page1, page2) => {
        return page2[1] - page1[1];
    });
    
    return pagesArray;
}

export { sortPages, printReport };