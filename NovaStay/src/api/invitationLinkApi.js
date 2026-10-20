const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ns_account') || '{}');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${parsed.accessToken || ''}`,
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

/** Chủ trọ: Tạo link mời */
export async function createInvitationLink(organizationId, data) {
  const res = await fetch(`${API_URL}/api/organizations/${organizationId}/invitation-links`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tạo link mời');
  }
  return res.json();
}

/** Chủ trọ: Lấy danh sách link mời */
export async function getInvitationLinks(organizationId) {
  const res = await fetch(`${API_URL}/api/organizations/${organizationId}/invitation-links`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Không thể lấy danh sách link mời');
  return res.json();
}

/** Chủ trọ: Vô hiệu hoá link mời */
export async function deactivateInvitationLink(organizationId, linkId) {
  const res = await fetch(`${API_URL}/api/organizations/${organizationId}/invitation-links/${linkId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể vô hiệu hoá link mời');
  }
}

/** Người thuê: Preview link trước khi chấp nhận (không cần auth) */
export async function previewInvitationLink(token) {
  const res = await fetch(`${API_URL}/api/invitation/${token}`);
  if (!res.ok) throw new Error('Không tìm thấy link mời');
  return res.json();
}

/** Người thuê: Chấp nhận link mời (cần đăng nhập) */
export async function acceptInvitationLink(token) {
  const res = await fetch(`${API_URL}/api/invitation/${token}/accept`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể chấp nhận lời mời');
  }
  return res.json();
}
