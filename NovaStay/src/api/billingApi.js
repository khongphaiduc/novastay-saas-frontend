const root = import.meta.env.VITE_API_URL || '';

export async function billingRequest(path, options = {}) {
    let account = {};
    try { account = JSON.parse(localStorage.getItem('ns_account') || '{}'); } catch { /* require login below */ }
    const headers = { Authorization: `Bearer ${account.accessToken || ''}`, ...options.headers };
    if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${root}/api/billing/${path}`, { ...options, headers });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const defaultMessage = response.status === 401
            ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
            : response.status === 403
                ? (data.message || 'Bạn không có quyền thực hiện thao tác này.')
                : (data.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.');
        const error = new Error(defaultMessage);
        error.code = data.code || (response.status === 401 ? 'UNAUTHORIZED' : response.status === 403 ? 'FORBIDDEN' : 'UNKNOWN_ERROR');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return response;
}

export async function billingJson(path, options) {
    const response = await billingRequest(path, options);
    return response.status === 204 ? null : response.json();
}

/**
 * Lấy quyền tính năng thanh toán của chủ trọ (BusinessOwner)
 * GET /api/billing/payment-capabilities
 */
export async function getPaymentCapabilities() {
    return billingJson('payment-capabilities');
}

/**
 * Lấy trạng thái thanh toán của hóa đơn
 * GET /api/billing/invoices/{invoiceId}/payment-status
 */
export async function getInvoicePaymentStatus(invoiceId) {
    return billingJson(`invoices/${invoiceId}/payment-status`);
}

/**
 * Tạo hoặc lấy lại link/QR thanh toán PayOS
 * POST /api/billing/invoices/{invoiceId}/payment-link
 */
export async function createPaymentLink(invoiceId) {
    return billingJson(`invoices/${invoiceId}/payment-link`, {
        method: 'POST'
    });
}

/**
 * Đối soát hóa đơn PayOS (chỉ dành cho BusinessOwner sở hữu)
 * POST /api/billing/invoices/{invoiceId}/reconcile
 */
export async function reconcilePayment(invoiceId) {
    return billingJson(`invoices/${invoiceId}/reconcile`, {
        method: 'POST'
    });
}

export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

export function billStatus(bill) {
    if (bill.status === 'Paid') {
        if (bill.paymentSource === 'PayOS') return 'Đã thanh toán (PayOS)';
        if (bill.paymentSource === 'Manual') return 'Đã thanh toán (Chuyển khoản)';
        return 'Đã thanh toán';
    }
    if (bill.status === 'AwaitingConfirmation') return 'Chờ chủ trọ xác nhận';
    if (bill.dueDate && bill.dueDate < new Date().toLocaleDateString('sv-SE')) return 'Quá hạn';
    return 'Chưa thanh toán';
}
