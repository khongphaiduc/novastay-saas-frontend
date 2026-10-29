const API_URL = import.meta.env.VITE_API_URL || '';

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
 * Backend Pagination: Lấy danh sách giao dịch tài chính (Thu & Chi) theo cơ sở
 * GET /api/organizations/{organizationId}/properties/{propertyId}/financial-transactions?pageIndex=...&pageSize=...
 */
export async function getFinancialTransactionsPaged(organizationId, propertyId, {
    pageIndex = 1,
    pageSize = 10,
    transactionType = null,
    search = null,
    status = null,
    paymentMethod = null,
    fromDate = null,
    toDate = null
} = {}) {
    const params = new URLSearchParams({ pageIndex, pageSize });
    if (transactionType && transactionType !== 'All') params.append('transactionType', transactionType);
    if (search && search.trim()) params.append('search', search.trim());
    if (status && status !== 'All') params.append('status', status);
    if (paymentMethod && paymentMethod !== 'All') params.append('paymentMethod', paymentMethod);
    if (fromDate) params.append('fromDate', fromDate.includes('T') ? fromDate : fromDate + 'T00:00:00');
    if (toDate) params.append('toDate', toDate.includes('T') ? toDate : toDate + 'T23:59:59');

    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/financial-transactions?${params}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi tải giao dịch tài chính: ${res.status}`);
    return res.json();
}

/**
 * Backend Pagination: Lấy danh sách phiếu thu phân trang
 * GET /api/organizations/{organizationId}/properties/{propertyId}/income-receipts/paged?pageIndex=...&pageSize=...
 */
export async function getIncomeReceiptsPaged(organizationId, propertyId, {
    pageIndex = 1,
    pageSize = 10,
    status = null,
    paymentMethod = null,
    search = null
} = {}) {
    const params = new URLSearchParams({ pageIndex, pageSize });
    if (status && status !== 'All') params.append('status', status);
    if (paymentMethod && paymentMethod !== 'All') params.append('paymentMethod', paymentMethod);
    if (search && search.trim()) params.append('search', search.trim());

    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/income-receipts/paged?${params}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi tải phiếu thu phân trang: ${res.status}`);
    return res.json();
}

/**
 * Backend Pagination: Lấy danh sách phiếu chi phân trang
 * GET /api/organizations/{organizationId}/properties/{propertyId}/expenses/paged?pageIndex=...&pageSize=...
 */
export async function getExpensesPaged(organizationId, propertyId, {
    pageIndex = 1,
    pageSize = 10,
    status = null,
    paymentMethod = null,
    search = null
} = {}) {
    const params = new URLSearchParams({ pageIndex, pageSize });
    if (status && status !== 'All') params.append('status', status);
    if (paymentMethod && paymentMethod !== 'All') params.append('paymentMethod', paymentMethod);
    if (search && search.trim()) params.append('search', search.trim());

    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/expenses/paged?${params}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi tải phiếu chi phân trang: ${res.status}`);
    return res.json();
}

/**
 * Tạo mới phiếu chi (Expense)
 * POST /api/organizations/{organizationId}/properties/{propertyId}/expenses
 */
export async function createExpense(organizationId, propertyId, data) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi tạo phiếu chi: ${res.status}`);
    }
    return res.json();
}

/**
 * Tạo mới phiếu thu (Income Receipt)
 * POST /api/organizations/{organizationId}/properties/{propertyId}/income-receipts
 */
export async function createIncomeReceipt(organizationId, propertyId, data) {
    const res = await fetch(`${API_URL}/api/organizations/${organizationId}/properties/${propertyId}/income-receipts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Lỗi tạo phiếu thu: ${res.status}`);
    }
    return res.json();
}
