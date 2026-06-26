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
 * TASK-055: Lấy danh sách tài sản của Organization
 */
export async function getAssets({ organizationId, search = '', category = '', status = '' } = {}) {
    const params = new URLSearchParams({ organizationId });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);

    const res = await fetch(`${API_URL}/api/assets?${params}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi tải danh sách tài sản: ${res.status}`);
    return res.json();
}

/**
 * Task phát sinh: Lấy tài sản đang trong một phòng
 */
export async function getAssetsByRoom(roomId) {
    const res = await fetch(`${API_URL}/api/assets/by-room?roomId=${roomId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi tải tài sản phòng: ${res.status}`);
    return res.json();
}

/**
 * Task phát sinh: Thống kê tài sản theo trạng thái
 */
export async function getAssetStatistics(organizationId) {
    const res = await fetch(`${API_URL}/api/assets/statistics?organizationId=${organizationId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi tải thống kê tài sản: ${res.status}`);
    return res.json();
}

/**
 * TASK-056: Thêm tài sản mới
 */
export async function createAsset(data) {
    const res = await fetch(`${API_URL}/api/assets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi tạo tài sản: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-057: Cập nhật thông tin tài sản
 */
export async function updateAsset(assetId, data) {
    const res = await fetch(`${API_URL}/api/assets/${assetId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi cập nhật tài sản: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-056: Xóa mềm tài sản
 */
export async function deleteAsset(assetId) {
    const res = await fetch(`${API_URL}/api/assets/${assetId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi xóa tài sản: ${res.status}`);
    }
}

/**
 * TASK-058: Gán tài sản vào phòng
 */
export async function assignAsset(assetId, roomId, note = '') {
    const res = await fetch(`${API_URL}/api/assets/${assetId}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roomId, note }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi gán tài sản: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-059: Thu hồi tài sản khỏi phòng
 */
export async function revokeAsset(assetId, note = '') {
    const res = await fetch(`${API_URL}/api/assets/${assetId}/revoke`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi thu hồi tài sản: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-060 / TASK-061: Cập nhật trạng thái / Ghi nhận hư hỏng
 */
export async function updateAssetStatus(assetId, status, note = '') {
    const res = await fetch(`${API_URL}/api/assets/${assetId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, note }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi cập nhật trạng thái: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-062: Xem lịch sử tài sản
 */
export async function getAssetHistory(assetId) {
    const res = await fetch(`${API_URL}/api/assets/${assetId}/history`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi tải lịch sử tài sản: ${res.status}`);
    return res.json();
}
