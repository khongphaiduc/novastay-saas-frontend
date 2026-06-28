export const formatImageUrl = (url) => {
    if (!url) return '';
    if (window.location.protocol === 'https:') {
        if (url.includes('http://157.66.219.130:9000')) {
            return url.replace('http://157.66.219.130:9000', 'https://novastay.io.vn:9000');
        }
        const ipRegex = /http:\/\/([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]+)?/;
        if (ipRegex.test(url)) {
            return url.replace(ipRegex, (match) => {
                const parts = match.split(':');
                const port = parts[2] ? `:${parts[2]}` : '';
                return `https://${window.location.hostname}${port}`;
            });
        }
        return url.replace('http://', 'https://');
    }
    return url;
};
