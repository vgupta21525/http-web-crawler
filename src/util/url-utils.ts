export function normalizeURL(url: URL | string): string {
    if (typeof(url) === "string") {
        url = new URL(url);
    }

    const hostPath: string = `${url.protocol}//${url.hostname}${url.pathname}`;
    if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0, -1);
    }
    return hostPath;
}