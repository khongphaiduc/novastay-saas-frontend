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
 * Lấy danh sách đồng hồ dịch vụ của một phòng (kèm chỉ số mới nhất)
 */
export async function getMetersByRoom(roomId) {
    const res = await fetch(`${API_URL}/api/utility-meters/by-room/${roomId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi lấy đồng hồ phòng: ${res.status}`);
    return res.json();
}

/**
 * Lấy danh sách đồng hồ dịch vụ theo property (lấy tất cả phòng trong property)
 */
export async function getMetersByProperty(propertyId) {
    const res = await fetch(`${API_URL}/api/utility-meters/by-property/${propertyId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi lấy đồng hồ property: ${res.status}`);
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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi tạo đồng hồ: ${res.status}`);
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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi ghi số: ${res.status}`);
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
