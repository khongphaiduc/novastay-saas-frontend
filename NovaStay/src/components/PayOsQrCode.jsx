/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
    ArrowDownToLine,
    ExternalLink,
    Copy,
    Clock,
    AlertCircle,
    RefreshCw,
    ShieldAlert,
    CreditCard
} from 'lucide-react';
import { money } from '../api/billingApi';

const REVIEW_REASONS = {
    AmountMismatch: 'Số tiền chuyển không khớp số tiền hóa đơn',
    WebhookIdentityMismatch: 'Sai danh tính kênh webhook liên kết',
    ProviderLinkMismatch: 'Kênh nhận tiền PayOS không khớp cấu hình server',
    InvoiceAlreadyPaid: 'Hóa đơn đã được thanh toán trước đó',
    InvoiceNotPayable: 'Hóa đơn không còn ở trạng thái cho phép thanh toán'
};

export default function PayOsQrCode({
    payment,
    amount,
    invoiceNumber,
    isDarkMode = true,
    onRequestNewLink,
    isBusy = false
}) {
    const canvasRef = useRef(null);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [qrError, setQrError] = useState('');
    const [copied, setCopied] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(() => {
        if (!payment?.expiresAt) return 0;
        return Math.max(0, Math.floor((new Date(payment.expiresAt).getTime() - Date.now()) / 1000));
    });

    // Render EMV QR string onto Canvas
    useEffect(() => {
        setQrError('');
        setQrDataUrl('');
        if (!payment?.qrCode) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        QRCode.toCanvas(canvas, payment.qrCode, {
            width: 200,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'M'
        })
            .then(() => {
                setQrDataUrl(canvas.toDataURL('image/png'));
            })
            .catch(err => {
                console.error('Lỗi tạo QR code:', err);
                setQrError('Không thể tạo hình ảnh QR từ chuỗi dữ liệu.');
            });
    }, [payment?.qrCode]);

    // Countdown Timer based on expiresAt
    useEffect(() => {
        if (!payment?.expiresAt) {
            setSecondsLeft(0);
            return;
        }

        const tick = () => {
            const left = Math.max(0, Math.floor((new Date(payment.expiresAt).getTime() - Date.now()) / 1000));
            setSecondsLeft(left);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [payment?.expiresAt]);

    const copy = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label || 'Đã sao chép');
            setTimeout(() => setCopied(''), 2500);
        } catch {
            setCopied('Không thể sao chép');
        }
    };

    const isExpired = secondsLeft <= 0;
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const theme = isDarkMode
        ? {
            box: 'bg-[#12121B] border-[#2A2518]',
            subBox: 'bg-[#181824] border-[#2A2518]',
            title: 'text-white',
            muted: 'text-gray-400',
            mutedSoft: 'text-gray-500',
            highlight: 'text-[#D4AF37]'
        }
        : {
            box: 'bg-[#FFFDF9] border-[#E5D4AD]',
            subBox: 'bg-[#FAF6EC] border-[#E5D4AD]',
            title: 'text-slate-900',
            muted: 'text-slate-600',
            mutedSoft: 'text-slate-400',
            highlight: 'text-[#AA7C11]'
        };

    // Case 1: Status is NeedsReview
    if (payment?.status === 'NeedsReview') {
        const reasonText = REVIEW_REASONS[payment.reviewReason] || payment.reviewReason || 'Cần kiểm tra giao dịch';
        return (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                    <div>
                        <strong className="block font-bold text-amber-200">Giao dịch cần chủ trọ đối soát</strong>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-amber-300/90">
                            Lý do: <strong>{reasonText}</strong>.
                        </p>
                        <p className="mt-1 text-[11px] text-amber-400/80 italic">
                            * Vui lòng không thực hiện chuyển khoản thêm. Chủ trọ sẽ đối soát trực tiếp để xử lý hóa đơn này.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Case 2: Status is CancellationPending
    if (payment?.status === 'CancellationPending') {
        return (
            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <span>Liên kết thanh toán đang được thu hồi do hóa đơn đã được hoàn tất bởi giao dịch khác.</span>
            </div>
        );
    }

    // Case 3: Status is Creating
    if (payment?.status === 'Creating') {
        return (
            <div className="p-5 text-center rounded-xl border border-dashed border-[#D4AF37]/40 space-y-2">
                <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin mx-auto" />
                <p className={`text-xs font-semibold ${theme.title}`}>Đang khởi tạo liên kết thanh toán PayOS...</p>
                <p className={`text-[11px] ${theme.muted}`}>Hệ thống đang kết nối với cổng thanh toán. Vui lòng đợi trong giây lát.</p>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border p-4 text-xs space-y-3.5 ${theme.box}`}>
            {/* Header / Thanh toán tự động PayOS */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-inherit/40">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black tracking-wider text-[#D4AF37] uppercase block">
                            Cổng Thanh Toán Tự Động PayOS
                        </span>
                        <span className={`text-xs font-bold ${theme.title}`}>Quét mã QR để thanh toán tự động</span>
                    </div>
                </div>

                {copied && <span className="text-emerald-400 font-bold text-[11px]">{copied}</span>}
            </div>

            {/* Trạng thái đếm lùi thời gian hạn mã QR */}
            {payment?.expiresAt && (
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isExpired ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'}`}>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {isExpired ? 'Mã thanh toán đã hết hạn' : 'Thời gian hiệu lực mã QR:'}
                    </span>
                    <span className="font-mono font-black text-xs">
                        {isExpired ? '00:00' : formatTime(secondsLeft)}
                    </span>
                </div>
            )}

            {/* Khối hiển thị mã QR nếu còn hiệu lực */}
            {!isExpired && (
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    {payment?.qrCode ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-md inline-block">
                                <canvas ref={canvasRef} className="block rounded" />
                            </div>
                            {qrDataUrl && (
                                <a
                                    href={qrDataUrl}
                                    download={`PayOS-HD-${payment.orderCode || invoiceNumber || 'NovaStay'}.png`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline"
                                >
                                    <ArrowDownToLine className="w-3.5 h-3.5" /> Tải ảnh QR PayOS (.PNG)
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border border-dashed border-[#D4AF37]/40 text-center space-y-2 flex-1">
                            <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
                            <p className="text-xs text-amber-300 font-medium">
                                Mã QR trực tiếp đang được đồng bộ lại. Bạn có thể mở trực tiếp cổng thanh toán PayOS bên dưới.
                            </p>
                        </div>
                    )}

                    {/* Chi tiết tài khoản nhận tiền PayOS */}
                    <div className="flex-1 w-full space-y-2 text-xs">
                        <div className={`p-3 rounded-lg border space-y-1.5 ${theme.subBox}`}>
                            <div className="flex justify-between items-center">
                                <span className={theme.muted}>Ngân hàng nhận:</span>
                                <strong className={`font-semibold ${theme.title}`}>{payment.bankBin ? `BIN: ${payment.bankBin}` : 'PayOS'}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={theme.muted}>Chủ tài khoản:</span>
                                <strong className={`font-bold uppercase ${theme.title}`}>{payment.accountName || 'PAYOS GATEWAY'}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={theme.muted}>Số tài khoản:</span>
                                <div className="flex items-center gap-1.5">
                                    <strong className={`font-mono font-bold ${theme.title}`}>{payment.accountNumber}</strong>
                                    <button
                                        type="button"
                                        onClick={() => copy(payment.accountNumber, 'Đã sao chép STK')}
                                        className="text-[#D4AF37] hover:opacity-80 p-0.5"
                                        title="Sao chép số tài khoản"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={theme.muted}>Số tiền thanh toán:</span>
                                <div className="flex items-center gap-1.5">
                                    <strong className="font-mono font-black text-emerald-400 text-sm">{money(amount)}</strong>
                                    <button
                                        type="button"
                                        onClick={() => copy(String(amount), 'Đã sao chép số tiền')}
                                        className="text-[#D4AF37] hover:opacity-80 p-0.5"
                                        title="Sao chép số tiền"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            {payment.orderCode && (
                                <div className="flex justify-between items-center">
                                    <span className={theme.muted}>Mã đơn (Order Code):</span>
                                    <div className="flex items-center gap-1.5">
                                        <strong className="font-mono text-xs text-[#D4AF37]">{payment.orderCode}</strong>
                                        <button
                                            type="button"
                                            onClick={() => copy(String(payment.orderCode), 'Đã sao chép mã đơn')}
                                            className="text-[#D4AF37] hover:opacity-80 p-0.5"
                                            title="Sao chép mã đơn"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nút mở trang PayOS trực tiếp */}
                        {payment.checkoutUrl && (
                            <a
                                href={payment.checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:opacity-95 text-black font-black uppercase text-xs tracking-wider shadow-md flex items-center justify-center gap-2 transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                                Mở cổng thanh toán PayOS
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Trạng thái hết hạn & Yêu cầu link mới */}
            {isExpired && (
                <div className="space-y-2.5 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center">
                    <p className="text-xs text-rose-300">
                        Liên kết và mã QR này đã hết hiệu lực. Bạn cần tạo lại mã thanh toán mới để tiếp tục.
                    </p>
                    {onRequestNewLink && (
                        <button
                            type="button"
                            disabled={isBusy}
                            onClick={onRequestNewLink}
                            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                            {isBusy ? 'Đang tạo mã mới...' : 'Lấy mã thanh toán mới'}
                        </button>
                    )}
                </div>
            )}

            {qrError && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{qrError}</span>
                </div>
            )}

            <p className={`text-[11px] italic leading-tight ${theme.mutedSoft}`}>
                * Khoản thanh toán sẽ được hệ thống đối soát tự động qua Webhook PayOS ngay khi chuyển khoản thành công. Không cần gửi ảnh xác nhận.
            </p>
        </div>
    );
}
