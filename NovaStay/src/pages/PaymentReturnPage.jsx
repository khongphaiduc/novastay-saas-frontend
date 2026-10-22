/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getInvoicePaymentStatus, money } from '../api/billingApi';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    ShieldAlert
} from 'lucide-react';

export default function PaymentReturnPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const invoiceId = searchParams.get('invoiceId');
    const isCancelPath = location.pathname.includes('cancel');

    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!invoiceId) {
            setLoading(false);
            setError('Không tìm thấy mã hóa đơn (invoiceId) trong đường dẫn.');
            return;
        }

        let disposed = false;
        setLoading(true);
        setError('');

        // Never trust query params from URL (e.g. status, cancel, code).
        // Always query server directly via GET /api/billing/invoices/{invoiceId}/payment-status
        getInvoicePaymentStatus(invoiceId)
            .then(data => {
                if (!disposed) setStatusData(data);
            })
            .catch(err => {
                if (!disposed) {
                    setError(err.message || 'Không thể xác thực trạng thái thanh toán từ máy chủ.');
                }
            })
            .finally(() => {
                if (!disposed) setLoading(false);
            });

        return () => { disposed = true; };
    }, [invoiceId]);

    const getDashboardPath = () => {
        try {
            const account = JSON.parse(localStorage.getItem('ns_account') || '{}');
            if (account.accountType === 'Resident') return '/resident';
            return '/nhatro';
        } catch {
            return '/';
        }
    };

    const isPaid = statusData?.invoiceStatus === 'Paid';
    const isNeedsReview = statusData?.payment?.status === 'NeedsReview';

    return (
        <div className="min-h-screen bg-[#0A0A10] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-lg bg-[#11111A] border border-[#2A2518] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
                {/* Header Icon */}
                {loading ? (
                    <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37]">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>
                ) : isPaid ? (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle2 className="w-9 h-9" />
                    </div>
                ) : isNeedsReview ? (
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                        <ShieldAlert className="w-9 h-9" />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                        <XCircle className="w-9 h-9" />
                    </div>
                )}

                {/* Status Message */}
                <div className="space-y-2">
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase">
                        KẾT QUẢ ĐỐI SOÁT CỔNG PAYOS
                    </span>
                    <h2 className="text-xl font-black tracking-tight text-white">
                        {loading ? 'Đang xác thực giao dịch từ máy chủ...' :
                            isPaid ? 'Thanh Toán Thành Công!' :
                                isNeedsReview ? 'Giao Dịch Cần Đối Soát' :
                                    isCancelPath ? 'Giao Dịch Đã Bị Hủy' : 'Chưa Hoàn Tất Thanh Toán'}
                    </h2>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                        {loading ? 'Hệ thống đang đối chiếu dữ liệu thanh toán với ngân hàng. Vui lòng chờ...' :
                            isPaid ? 'Giao dịch qua PayOS đã được ghi nhận tự động vào hệ thống. Hóa đơn của bạn đã được quyết toán.' :
                                isNeedsReview ? 'Hệ thống ghi nhận giao dịch cần chủ trọ đối soát trực tiếp. Vui lòng không thanh toán thêm.' :
                                    'Bạn đã hủy thao tác hoặc chưa hoàn tất chuyển khoản trên cổng PayOS. Hóa đơn vẫn ở trạng thái Chưa thanh toán.'}
                    </p>
                </div>

                {/* Details Box */}
                {statusData && (
                    <div className="bg-[#161622] border border-[#2A2518] rounded-2xl p-4 text-xs space-y-2.5 text-left">
                        <div className="flex justify-between items-center border-b border-[#2A2518] pb-2">
                            <span className="text-gray-400">Số tiền hóa đơn:</span>
                            <strong className="text-emerald-400 font-black text-sm">{money(statusData.amount)}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Trạng thái hóa đơn:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        </div>
                        {statusData.payment?.orderCode && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Mã đơn PayOS (Order Code):</span>
                                <span className="font-mono text-gray-200">{statusData.payment.orderCode}</span>
                            </div>
                        )}
                        {statusData.paidAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Thời gian thanh toán:</span>
                                <span className="text-gray-200">{new Date(statusData.paidAt).toLocaleString('vi-VN')}</span>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 text-left">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(getDashboardPath())}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-[#D4AF37]/10 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Về trang quản lý hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
}
