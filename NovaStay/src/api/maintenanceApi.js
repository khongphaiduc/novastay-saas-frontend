// maintenanceApi.js – TASK-021 và TASK-022
const API_URL = import.meta.env.VITE_API_URL;
const ASSET_URL = import.meta.env.VITE_ASSET_URL;

function getAuthHeaders() {
    let token = '';
    try {
        const accountStr = localStorage.getItem('ns_account');
        if (accountStr) token = JSON.parse(accountStr).accessToken || '';
    } catch (e) { console.error('Error parsing ns_account', e); }
    return {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
}

async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

/**
 * TASK-021: Xem lịch sử bảo trì của phòng
 */
export async function getMaintenanceByRoom(roomId, pageIndex = 1, pageSize = 10) {
    const res = await fetch(`${API_URL}/api/maintenance/rooms/${roomId}?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

/**
 * TASK-022: Đánh dấu phòng đang bảo trì / trống
 */
export async function markRoomStatus(roomId, { status, organizationId, residentId, description = '' }) {
    const res = await fetch(`${API_URL}/api/maintenance/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, organizationId, residentId, description }),
    });
    return handleResponse(res);
}

/**
 * TASK-021: Tạo phiếu bảo trì thủ công
 */
export async function createMaintenanceTicket(data) {
    const res = await fetch(`${API_URL}/api/maintenance/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}
