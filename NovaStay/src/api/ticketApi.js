const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
    let token = '';
    try {
        const accountStr = localStorage.getItem('ns_account');
        if (accountStr) token = JSON.parse(accountStr).accessToken || '';
    } catch (e) {
        console.error('Error parsing ns_account', e);
    }
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
}

/**
 * Chủ nhà: danh sách phiếu sự cố / bảo trì của cơ sở, có thể lọc theo trạng thái
 */
export async function getOrganizationTickets(organizationId, status = '') {
    const params = new URLSearchParams({ organizationId });
    if (status) params.append('status', status);
    const res = await fetch(`${API_URL}/api/maintenance/tickets?${params}`, { headers: getAuthHeaders() });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi tải phiếu sự cố: ${res.status}`);
    }
    return res.json();
}

/**
 * Chủ nhà: đổi trạng thái phiếu (Pending, InProgress, Resolved)
 */
export async function updateTicketStatus(ticketId, status) {
    const res = await fetch(`${API_URL}/api/maintenance/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi cập nhật phiếu: ${res.status}`);
    }
    return res.json();
}
