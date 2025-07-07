function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const actualBytes = Math.round(bytes * (3 / 4));
    const i = Math.floor(Math.log(actualBytes) / Math.log(k));
    return parseFloat((actualBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
