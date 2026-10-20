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
