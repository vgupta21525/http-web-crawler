export function normalizeURL(url: URL): string {
    const hostPath: string = `${url.hostname}${url.pathname}`;
    if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0, -1);
    }
    return hostPath;
}