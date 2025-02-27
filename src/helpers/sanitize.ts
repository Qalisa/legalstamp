export function sanitizePath(path: string) {
    return '/' + (path
        .split('/')
        .filter(Boolean)
        .join('/'));
}