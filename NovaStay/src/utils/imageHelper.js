export const formatImageUrl = (url) => {
    if (!url) return '';
    
    // Nếu web chạy HTTPS mà ảnh lại là HTTP, trình duyệt sẽ báo Mixed Content 
    // hoặc lỗi SSL (nếu ép lên https://...:9000). Giải pháp an toàn nhất là qua proxy của Backend.
    if (window.location.protocol === 'https:' && url.startsWith('http://')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.novastay.io.vn';
        // Gọi qua endpoint proxy ở Backend
        return `${apiUrl}/api/rooms/proxy-image?url=${encodeURIComponent(url)}`;
    }
    
    return url;
};
