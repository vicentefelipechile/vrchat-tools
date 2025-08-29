function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const actualBytes = Math.round(bytes * (3 / 4));
    const i = Math.floor(Math.log(actualBytes) / Math.log(k));
    return parseFloat((actualBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Optional: Show a success message to the user
        console.log('Copied to clipboard');
    }).catch(err => {
        // Optional: Show an error message to the user
        console.error('Failed to copy: ', err);
    });
}
