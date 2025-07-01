export function logError(error: any, action: string): void {
    if (error instanceof Error) {
        console.log(`Error while ${action}: ${error.message}`);
    }
    else {
        console.log(`Unexpected error while ${action}: ${error}`);
    }
};