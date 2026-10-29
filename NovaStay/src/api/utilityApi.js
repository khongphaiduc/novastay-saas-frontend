const API_URL = import.meta.env.VITE_API_URL || '';

async function apiError(response, fallback) {
    const body = await response.json().catch(() => ({}));
    const validation = body.errors ? Object.values(body.errors).flat().join(' ') : '';
    return new Error(body.message || validation || body.detail || `${fallback}: ${response.status}`);
}

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
 * Lấy danh sách đồng hồ dịch vụ của một phòng (kèm chỉ số mới nhất)
 */
export async function getMetersByRoom(roomId) {
    const res = await fetch(`${API_URL}/api/utility-meters/by-room/${roomId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw await apiError(res, 'Lỗi lấy đồng hồ phòng');
    return res.json();
}

/**
 * Lấy danh sách đồng hồ dịch vụ theo property (lấy tất cả phòng trong property)
 */
export async function getMetersByProperty(propertyId) {
    const res = await fetch(`${API_URL}/api/utility-meters/by-property/${propertyId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw await apiError(res, 'Lỗi lấy đồng hồ cơ sở');
    return res.json();
}

/**
 * Tạo mới đồng hồ dịch vụ cho phòng
 * @param {{ roomId, propertyServiceId, meterCode, meterType, unit, initialReading }} data
 */
export async function createMeter(data) {
    const res = await fetch(`${API_URL}/api/utility-meters`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await apiError(res, 'Lỗi tạo đồng hồ');
    }
    return res.json();
}

/**
 * Ghi chỉ số mới cho một đồng hồ
 * @param {string} meterId
 * @param {{ billingPeriod: string, currentReading: number, note?: string }} data
 */
export async function recordReading(meterId, data) {
    const res = await fetch(`${API_URL}/api/utility-meters/${meterId}/readings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw await apiError(res, 'Lỗi ghi số');
    }
    return res.json();
}

/**
 * Lấy lịch sử ghi số của một đồng hồ
 */
export async function getReadingsByMeter(meterId) {
    const res = await fetch(`${API_URL}/api/utility-meters/${meterId}/readings`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi lấy lịch sử ghi số: ${res.status}`);
    return res.json();
}

/**
 * Backend Pagination: Lấy danh sách đồng hồ của một cơ sở
 * GET /api/utility-meters/by-property/{propertyId}/paged?pageIndex=...&pageSize=...&search=...
 */
export async function getMetersByPropertyPaged(propertyId, { pageIndex = 1, pageSize = 10, search = '' } = {}) {
    const params = new URLSearchParams();
    params.append('pageIndex', pageIndex);
    params.append('pageSize', pageSize);
    if (search) params.append('search', search.trim());

    const res = await fetch(`${API_URL}/api/utility-meters/by-property/${propertyId}/paged?${params}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw await apiError(res, 'Lỗi tải đồng hồ cơ sở phân trang');
    return res.json();
}

/**
 * Backend Pagination: Lấy danh sách đồng hồ của một phòng
 * GET /api/utility-meters/by-room/{roomId}/paged?pageIndex=...&pageSize=...&search=...
 */
export async function getMetersByRoomPaged(roomId, { pageIndex = 1, pageSize = 10, search = '' } = {}) {
    const params = new URLSearchParams();
    params.append('pageIndex', pageIndex);
    params.append('pageSize', pageSize);
    if (search) params.append('search', search.trim());

    const res = await fetch(`${API_URL}/api/utility-meters/by-room/${roomId}/paged?${params}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw await apiError(res, 'Lỗi tải đồng hồ phòng phân trang');
    return res.json();
}

/**
 * Backend Pagination: Lấy lịch sử chỉ số của một đồng hồ
 * GET /api/utility-meters/{meterId}/readings/paged?pageIndex=...&pageSize=...&billingPeriod=...
 */
export async function getReadingsByMeterPaged(meterId, { pageIndex = 1, pageSize = 10, billingPeriod = '' } = {}) {
    const params = new URLSearchParams();
    params.append('pageIndex', pageIndex);
    params.append('pageSize', pageSize);
    if (billingPeriod) params.append('billingPeriod', billingPeriod.trim());

    const res = await fetch(`${API_URL}/api/utility-meters/${meterId}/readings/paged?${params}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw await apiError(res, 'Lỗi tải lịch sử chỉ số phân trang');
    return res.json();
}

