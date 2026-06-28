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

function getUploadHeaders() {
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
        // Do NOT set Content-Type for FormData, fetch will set it automatically with the boundary
    };
}

export async function createResident(data) {
    const res = await fetch(`${API_URL}/api/residents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        let msg = 'Failed to create resident';
        try {
            const errData = await res.json();
            msg = errData.message || msg;
        } catch {}
        throw new Error(msg);
    }
    
    return res.json();
}

export async function updateResident(id, data) {
    const res = await fetch(`${API_URL}/api/residents/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        let msg = 'Failed to update resident';
        try {
            const errData = await res.json();
            msg = errData.message || msg;
        } catch {}
        throw new Error(msg);
    }
    
    return res.json();
}

export async function uploadResidentImage(id, imageType, file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/residents/${id}/images/${imageType}`, {
        method: 'POST',
        headers: getUploadHeaders(),
        body: formData
    });
    
    if (!res.ok) {
        let msg = 'Failed to upload image';
        try {
            const errData = await res.json();
            msg = errData.message || msg;
        } catch {}
        throw new Error(msg);
    }
    
    return res.json();
}

export async function getOrganizationResidents(organizationId, status = null, pageIndex = 1, pageSize = 12) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', Number(pageIndex) || 1);
    params.append('pageSize', Number(pageSize) || 12);

    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/residents?${params}`, {
        headers: getAuthHeaders()
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch residents');
    }
    return res.json();
}
