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

export async function createProperty(organizationId, data) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Lỗi tạo property: ${res.status}`);
    return res.json();
}

export async function updateProperty(organizationId, propertyId, data) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Lỗi cập nhật property: ${res.status}`);
    return res.json();
}

export async function deleteProperty(organizationId, propertyId) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        if (res.status === 400) {
            const error = await res.json();
            throw new Error(error.message || 'Lỗi xóa property');
        }
        throw new Error(`Lỗi xóa property: ${res.status}`);
    }
}

/**
 * Lấy danh sách Services của Property thuộc Organization
 */
export async function getPropertyServices(organizationId, propertyId, search = '') {
    let url = `${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/services`;
    if (search) {
        url += `?search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error(`Lỗi tải danh sách dịch vụ: ${res.status}`);
    return res.json();
}

/**
 * Tạo mới Service của Property
 */
export async function createPropertyService(organizationId, propertyId, payload) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/services`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Lỗi tạo mới dịch vụ: ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
}

/**
 * Cập nhật Service của Property
 */
export async function updatePropertyService(organizationId, propertyId, serviceId, payload) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/services/${serviceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Lỗi cập nhật dịch vụ: ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
}
