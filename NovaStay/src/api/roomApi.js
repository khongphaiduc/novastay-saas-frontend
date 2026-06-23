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

function getAuthHeadersFormData() {
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
        // Không set Content-Type để browser tự thêm boundary cho multipart
    };
}

/**
 * TASK-011, 012, 013: Lấy danh sách phòng (có tìm kiếm và lọc)
 */
export async function getRooms({ propertyId, search = '', status = '' } = {}) {
    const params = new URLSearchParams({ propertyId });
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);

    const res = await fetch(`${API_URL}/api/rooms?${params}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error(`Lỗi tải danh sách phòng: ${res.status}`);
    return res.json();
}

/**
 * TASK-014: Thêm phòng mới
 */
export async function createRoom(data) {
    const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let errMsg = err.message;
        if (err.errors) {
            const firstKey = Object.keys(err.errors)[0];
            errMsg = err.errors[firstKey][0];
        }
        throw new Error(errMsg || `Lỗi tạo phòng: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-015: Cập nhật thông tin phòng
 */
export async function updateRoom(roomId, data) {
    const res = await fetch(`${API_URL}/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let errMsg = err.message;
        if (err.errors) {
            const firstKey = Object.keys(err.errors)[0];
            errMsg = err.errors[firstKey][0];
        }
        throw new Error(errMsg || `Lỗi cập nhật phòng: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-016: Xóa phòng
 */
export async function deleteRoom(roomId) {
    const res = await fetch(`${API_URL}/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!res.ok && res.status !== 404) {
        throw new Error(`Lỗi xóa phòng: ${res.status}`);
    }
}

/**
 * TASK-017: Upload ảnh phòng (multipart/form-data)
 */
export async function uploadRoomImage(roomId, file, isCover = false) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('isCover', String(isCover));

    const res = await fetch(`${API_URL}/api/rooms/${roomId}/images`, {
        method: 'POST',
        headers: getAuthHeadersFormData(),
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi upload ảnh: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-018: Cập nhật giá thuê phòng
 */
export async function updateRoomPrice(roomId, basePrice, rowVersion) {
    const res = await fetch(`${API_URL}/api/rooms/${roomId}/price`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ basePrice, rowVersion }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi cập nhật giá: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-019: Cập nhật sức chứa phòng
 */
export async function updateRoomOccupants(roomId, maxOccupants, rowVersion) {
    const res = await fetch(`${API_URL}/api/rooms/${roomId}/occupants`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ maxOccupants, rowVersion }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi cập nhật sức chứa: ${res.status}`);
    }
    return res.json();
}

/**
 * TASK-020: Cập nhật tiện ích phòng
 */
export async function updateRoomAmenities(roomId, amenitiesJson, rowVersion) {
    const res = await fetch(`${API_URL}/api/rooms/${roomId}/amenities`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amenitiesJson, rowVersion }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi cập nhật tiện ích: ${res.status}`);
    }
    return res.json();
}
