// contractApi.js – TASK-031 đến TASK-039
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

function getUploadHeaders() {
    let token = '';
    try {
        const accountStr = localStorage.getItem('ns_account');
        if (accountStr) token = JSON.parse(accountStr).accessToken || '';
    } catch (e) { console.error('Error parsing ns_account', e); }
    return { Authorization: token ? `Bearer ${token}` : '' };
}

function getAccountInfo() {
    try {
        const accountStr = localStorage.getItem('ns_account');
        if (accountStr) return JSON.parse(accountStr);
    } catch (e) {}
    return {};
}

async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let errMsg = err.message;
        if (err.errors) {
            // ASP.NET Core Validation Errors
            const firstKey = Object.keys(err.errors)[0];
            if (firstKey) {
                errMsg = err.errors[firstKey][0];
            }
        }
        throw new Error(errMsg || `Lỗi ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

/**
 * TASK-036: Xem danh sách hợp đồng
 * TASK-037: Tìm kiếm hợp đồng
 */
export async function getContracts({ organizationId, search = '', status = '', pageIndex = 1, pageSize = 12 } = {}) {
    const params = new URLSearchParams({ organizationId });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    params.append('pageIndex', pageIndex);
    params.append('pageSize', pageSize);

    const res = await fetch(`${API_URL}/api/contracts?${params}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

/**
 * TASK-031: Tạo hợp đồng thuê
 */
export async function createContract(data) {
    const res = await fetch(`${API_URL}/api/contracts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

/**
 * TASK-032: Cập nhật hợp đồng
 */
export async function updateContract(contractId, data) {
    const res = await fetch(`${API_URL}/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

/**
 * TASK-033: Gia hạn hợp đồng
 */
export async function renewContract(contractId, data) {
    const res = await fetch(`${API_URL}/api/contracts/${contractId}/renew`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

/**
 * TASK-034: Thanh lý hợp đồng
 */
export async function terminateContract(contractId, data = {}) {
    const res = await fetch(`${API_URL}/api/contracts/${contractId}/terminate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}

/**
 * TASK-035: Upload file hợp đồng PDF
 */
export async function uploadContractPdf(contractId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/contracts/${contractId}/upload-pdf`, {
        method: 'POST',
        headers: getUploadHeaders(),
        body: formData,
    });
    return handleResponse(res);
}

/**
 * TASK-038: Theo dõi hợp đồng sắp hết hạn
 */
export async function getExpiringSoonContracts(organizationId, days = 30) {
    const params = new URLSearchParams({ organizationId, days: String(days) });
    const res = await fetch(`${API_URL}/api/contracts/expiring-soon?${params}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

/**
 * TASK-NEW: Gửi thông báo nhắc nhở gia hạn thủ công
 */
export async function sendRenewalNotice(contractId) {
    const res = await fetch(`${API_URL}/api/contracts/${contractId}/send-renewal-notice`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

/**
 * TASK-039: Gửi thông báo gia hạn (Frontend-only: có thể gọi email endpoint hoặc hiển thị UI)
 * Hiện tại trả về thông tin liên lạc của hợp đồng để UI xử lý
 */
export async function getContractRenewalInfo(organizationId) {
    return getExpiringSoonContracts(organizationId, 30);
}
