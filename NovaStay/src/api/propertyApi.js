const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
    let token = '';
    try {
        const accountStr = localStorage.getItem('ns_account');
        if (accountStr) {
            token = JSON.parse(accountStr).accessToken || '';
        }
    } catch (e) {
        console.error('Error parsing ns_account', e);
    }
    
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
}

/**
 * Lấy danh sách Properties của Organization để chọn property hiện tại
 */
export async function getProperties(organizationId) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error(`Lỗi tải danh sách property: ${res.status}`);
    return res.json();
}
