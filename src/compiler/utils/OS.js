export function isUnixFileSystem() {
    return process.platform !== "win32"
}
