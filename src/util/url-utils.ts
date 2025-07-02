export function normalizeURL(url: URL | string, baseURL?: URL | string): string {
    if (typeof(url) === "string") {
        url = new URL(url, baseURL);
    }

    const hostPath: string = `${url.protocol}//${url.hostname}${url.pathname}`;
    return hostPath;
}