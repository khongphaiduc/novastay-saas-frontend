/* eslint-disable react-hooks/set-state-in-effect -- Effects synchronize authenticated API resources and revoke object URLs. */
import { useCallback, useEffect, useState } from 'react';
import {
    billingJson,
    billingRequest,
    billStatus,
    money,
    createPaymentLink,
    getInvoicePaymentStatus,
    reconcilePayment
} from '../api/billingApi';
import PayOsQrCode from './PayOsQrCode';
import { onInvoicePaymentUpdated } from '../services/paymentSignalR';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    Building,
    Copy,
    Check,
    ArrowDownToLine,
    Receipt,
    User,
    Zap,
    ExternalLink,
    RefreshCw,
    ShieldAlert,
    CreditCard
} from 'lucide-react';

export function BankQr({ bank }) {
    const [src, setSrc] = useState('');
    const [error, setError] = useState('');
    const [extension, setExtension] = useState('png');
    useEffect(() => {
        let disposed = false;
        let url;
        setSrc(''); setError('');
        if (bank?.hasQr) billingRequest(`bank-accounts/${bank.id}/qr`)
            .then(r => r.blob()).then(blob => {
                if (!disposed) { url = URL.createObjectURL(blob); setSrc(url); setExtension(blob.type === 'image/jpeg' ? 'jpg' : 'png'); }
            }).catch(e => { if (!disposed) setError(e.message); });
        return () => { disposed = true; if (url) URL.revokeObjectURL(url); };
    }, [bank?.id, bank?.hasQr]);
    if (!bank?.hasQr) return null;
    return <div className="mt-3 space-y-2">
        {src ? (
            <div className="flex flex-col items-start gap-2">
                <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm inline-block">
                    <img src={src} alt="QR chuyển khoản thủ công" className="w-44 h-44 object-contain rounded-lg" />
                </div>
                <a
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline"
                    href={src}
                    download={`QR-${bank.accountNumber}.${extension}`}
                >
                    <ArrowDownToLine className="w-3.5 h-3.5" /> Tải ảnh QR chuyển khoản
                </a>
            </div>
        ) : (
            <p className="text-xs text-gray-400">{error || 'Đang tải mã QR...'}</p>
        )}
    </div>;
}

export function BillCard({ bill, owner = false, onChanged, isDarkMode = true }) {
    const [confirming, setConfirming] = useState(false);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState('');

    // PayOS State
    const isPayOs = bill.paymentMode === 'PayOS';
    const [payOsData, setPayOsData] = useState(null);
    const [payOsLoading, setPayOsLoading] = useState(false);
    const [payOsOpen, setPayOsOpen] = useState(false);
    const [reconcileSuccess, setReconcileSuccess] = useState('');

    const paid = bill.status === 'Paid';
    const isAwaiting = bill.status === 'AwaitingConfirmation';
    const isOverdue = bill.dueDate && bill.dueDate < new Date().toLocaleDateString('sv-SE') && !paid;

    // Load initial PayOS status if unpaid and PayOS
    const loadPayOsStatus = useCallback(async () => {
        if (!isPayOs || paid) return;
        setPayOsLoading(true);
        setError('');
        try {
            const data = await getInvoicePaymentStatus(bill.id);
            setPayOsData(data);
            if (data.invoiceStatus === 'Paid') {
                await onChanged();
            }
        } catch (e) {
            console.warn('Lỗi đọc trạng thái PayOS:', e);
        } finally {
            setPayOsLoading(false);
        }
    }, [bill.id, isPayOs, paid, onChanged]);

    // Handle Manual confirm / report
    const runManual = async () => {
        setBusy(true); setError('');
        try {
            await billingJson(owner ? `invoices/${bill.id}/confirm` : `me/invoices/${bill.id}/report-transfer`, {
                method: 'POST', body: JSON.stringify(owner ? { note } : {})
            });
            setConfirming(false);
            await onChanged();
        } catch (e) { setError(e.message); } finally { setBusy(false); }
    };

    // Resident generates / requests PayOS Payment Link
    const handleRequestPayOsLink = async () => {
        setBusy(true); setError(''); setPayOsOpen(true);
        try {
            const res = await createPaymentLink(bill.id);
            setPayOsData(res);
            if (res.invoiceStatus === 'Paid') {
                await onChanged();
            }
        } catch (e) {
            if (e.code === 'INVOICE_ALREADY_PAID') {
                await onChanged();
            }
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    // Owner triggers Reconcile against PayOS
    const handleReconcile = async () => {
        setBusy(true); setError(''); setReconcileSuccess('');
        try {
            const res = await reconcilePayment(bill.id);
            setPayOsData(res);
            if (res.invoiceStatus === 'Paid') {
                setReconcileSuccess('Hệ thống đã xác nhận thanh toán thành công từ PayOS!');
                await onChanged();
            } else if (res.payment?.status === 'NeedsReview') {
                setError(`Giao dịch cần đối soát: ${res.payment.reviewReason || 'Cần kiểm tra'}`);
            } else {
                setReconcileSuccess(`Đã kiểm tra PayOS: Trạng thái hiện tại là ${res.payment?.status || 'Chưa ghi nhận tiền'}.`);
                setTimeout(() => setReconcileSuccess(''), 4000);
            }
        } catch (e) {
            if (e.code === 'INVOICE_ALREADY_PAID') {
                await onChanged();
            } else {
                setError(e.message || 'Chưa thể đối soát với PayOS.');
            }
        } finally {
            setBusy(false);
        }
    };

    const copy = async (value, label) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(label || 'Đã sao chép');
            setTimeout(() => setCopied(''), 2500);
        } catch {
            setCopied('Không thể sao chép');
        }
    };

    const theme = isDarkMode
        ? {
            card: 'bg-[#161622] border-[#2A2518] hover:border-[#D4AF37]/50 text-white',
            subBox: 'bg-[#11111A] border-[#2A2518]',
            textTitle: 'text-white',
            textMuted: 'text-gray-400',
            textMutedSoft: 'text-gray-500',
            input: 'bg-[#11111A] border-[#2A2518] text-white focus:border-[#D4AF37] placeholder-gray-500',
            badgePaid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            badgeAwaiting: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            badgeOverdue: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
            badgeUnpaid: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
            badgePayOs: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
            badgeManual: 'bg-zinc-800 text-zinc-300 border border-zinc-700'
        }
        : {
            card: 'bg-white border-[#E5D4AD] hover:border-[#D4AF37]/60 text-slate-900 shadow-sm',
            subBox: 'bg-[#FFF9EC] border-[#E5D4AD]',
            textTitle: 'text-slate-950',
            textMuted: 'text-slate-500',
            textMutedSoft: 'text-slate-400',
            input: 'bg-white border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
            badgePaid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            badgeAwaiting: 'bg-amber-50 text-amber-700 border border-amber-200',
            badgeOverdue: 'bg-rose-50 text-rose-700 border border-rose-200',
            badgeUnpaid: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
            badgePayOs: 'bg-blue-50 text-blue-700 border border-blue-200',
            badgeManual: 'bg-slate-100 text-slate-700 border border-slate-300'
        };

    const statusBadge = () => {
        if (paid) return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${theme.badgePaid}`}><CheckCircle2 className="w-3.5 h-3.5" /> Đã quyết toán</span>;
        if (isAwaiting) return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${theme.badgeAwaiting}`}><Clock className="w-3.5 h-3.5" /> Chờ xác nhận</span>;
        if (isOverdue) return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${theme.badgeOverdue}`}><AlertCircle className="w-3.5 h-3.5" /> Quá hạn nợ</span>;
        return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold ${theme.badgeUnpaid}`}><Clock className="w-3.5 h-3.5" /> Chưa thanh toán</span>;
    };

    const modeBadge = () => {
        if (isPayOs) {
            return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${theme.badgePayOs}`}>
                    <Zap className="w-3 h-3 fill-current" /> PayOS Tự Động
                </span>
            );
        }
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${theme.badgeManual}`}>
                <CreditCard className="w-3 h-3" /> Chuyển khoản thủ công
            </span>
        );
    };

    return (
        <article className={`rounded-2xl border p-5 space-y-4 transition-all duration-200 ${theme.card}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-inherit/40">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                        <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-[#D4AF37] text-xs">{bill.number}</span>
                            {modeBadge()}
                        </div>
                        <span className={`text-sm font-black block mt-0.5 ${theme.textTitle}`}>Phòng {bill.roomNumber}</span>
                    </div>
                </div>
                {statusBadge()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${theme.textMuted}`}>
                    <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="truncate">{bill.propertyName}</span>
                    <span>·</span>
                    <span className="font-semibold">Kỳ {bill.period}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${theme.textMuted}`}>
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="truncate">{bill.payerName || 'Chưa cập nhật'}</span>
                </div>
                <div className={`flex items-center gap-1.5 sm:col-span-2 ${theme.textMutedSoft}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Hạn thanh toán:</span>
                    <strong className={isOverdue ? 'text-rose-500' : theme.textTitle}>
                        {bill.dueDate ? new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString('vi-VN') : '—'}
                    </strong>
                </div>
            </div>

            {/* Chi tiết từng khoản */}
            <div className={`rounded-xl border p-3 space-y-2 ${theme.subBox}`}>
                <span className={`text-[10px] font-black uppercase tracking-wider block ${theme.textMutedSoft}`}>Khoản thu chi tiết</span>
                <ul className="space-y-1.5 divide-y divide-inherit/20 text-xs">
                    {(bill.lines || []).map((line, i) => (
                        <li key={i} className="flex justify-between items-center pt-1.5 first:pt-0">
                            <div>
                                <span className={`font-semibold ${theme.textTitle}`}>{line.description}</span>
                                <small className={`block text-[10px] ${theme.textMutedSoft}`}>
                                    {line.quantity} × {money(line.unitPrice)}
                                </small>
                            </div>
                            <span className="font-bold text-[#D4AF37]">{money(line.amount)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-between items-center pt-1">
                <span className={`text-xs uppercase font-bold tracking-wider ${theme.textMuted}`}>Tổng hóa đơn</span>
                <span className="text-xl font-black text-[#D4AF37]">{money(bill.totalAmount)}</span>
            </div>

            {/* Khi hóa đơn ĐÃ THANH TOÁN (Paid) */}
            {paid && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <div>
                        <span className="font-bold">
                            {bill.paymentSource === 'PayOS'
                                ? 'Đã thanh toán tự động qua PayOS'
                                : bill.paymentSource === 'Manual'
                                    ? 'Đã xác nhận thanh toán chuyển khoản'
                                    : 'Đã hoàn tất thanh toán'}
                        </span>
                        {bill.paidAt && (
                            <span className="block text-[11px] text-emerald-300/80 mt-0.5">
                                Thời gian: {new Date(bill.paidAt).toLocaleString('vi-VN')}
                            </span>
                        )}
                        {bill.confirmationNote && (
                            <span className="block text-[11px] text-emerald-300/70 italic mt-0.5">
                                Ghi chú: {bill.confirmationNote}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* LUỒNG PAYOS: HIỂN THỊ MÃ QR PAYOS CHO RESIDENT / ĐỐI SOÁT OWNER */}
            {/* ============================================================== */}
            {!paid && isPayOs && (
                <div className="space-y-3 pt-1">
                    {/* Resident view of PayOS QR & Link */}
                    {!owner && (
                        <div>
                            {payOsData?.payment ? (
                                <PayOsQrCode
                                    payment={payOsData.payment}
                                    amount={bill.totalAmount}
                                    invoiceNumber={bill.number}
                                    isDarkMode={isDarkMode}
                                    onRequestNewLink={handleRequestPayOsLink}
                                    isBusy={busy}
                                />
                            ) : (
                                <div className={`p-4 rounded-xl border text-center space-y-3 ${theme.subBox}`}>
                                    <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
                                        <Zap className="w-5 h-5 fill-current" />
                                        <span className={`text-xs font-black uppercase tracking-wider ${theme.textTitle}`}>
                                            Thanh toán tự động qua cổng PayOS
                                        </span>
                                    </div>
                                    <p className={`text-xs ${theme.textMuted}`}>
                                        Bấm nút bên dưới để tạo mã VietQR động tự động điền sẵn số tiền và nội dung chuyển khoản.
                                    </p>
                                    <button
                                        type="button"
                                        disabled={busy || payOsLoading}
                                        onClick={handleRequestPayOsLink}
                                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:opacity-95 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {busy || payOsLoading ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" /> Đang lấy mã thanh toán...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 fill-black stroke-black" /> Lấy mã QR thanh toán PayOS
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Owner view of PayOS: Reconcile action & attempt status */}
                    {owner && (
                        <div className="space-y-2.5 pt-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className={`text-xs font-semibold ${theme.textMuted}`}>
                                    Phương thức: <strong>PayOS Tự Động (Chờ cư dân quét mã)</strong>
                                </span>
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={handleReconcile}
                                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
                                    {busy ? 'Đang kiểm tra...' : 'Kiểm tra giao dịch PayOS'}
                                </button>
                            </div>

                            {reconcileSuccess && (
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span>{reconcileSuccess}</span>
                                </div>
                            )}

                            {payOsData?.payment && payOsData.payment.status === 'NeedsReview' && (
                                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block">Cần đối soát giao dịch PayOS</strong>
                                        <p className="mt-0.5 text-[11px]">Lý do: {payOsData.payment.reviewReason || 'Chênh lệch giao dịch'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================== */}
            {/* LUỒNG MANUAL: THÔNG TIN TÀI KHOẢN, QR ẢNH TẢI LÊN, NÚT XÁC NHẬN */}
            {/* ============================================================== */}
            {!paid && !isPayOs && (
                <>
                    {/* Người thuê xem thông tin tài khoản chuyển khoản thủ công */}
                    {!owner && bill.bankAccount && (
                        <div className={`rounded-xl border p-3.5 text-xs space-y-2.5 ${theme.subBox}`}>
                            <div className="flex justify-between items-center font-bold">
                                <span className="text-[#D4AF37]">Thông tin thanh toán chuyển khoản:</span>
                                {copied && <span className="text-emerald-400 font-bold text-[11px]">{copied}</span>}
                            </div>
                            <div className="space-y-1 text-xs">
                                <p className={theme.textMuted}>Ngân hàng: <strong className={theme.textTitle}>{bill.bankAccount.bankName}</strong></p>
                                <p className={theme.textMuted}>Chủ tài khoản: <strong className={theme.textTitle}>{bill.bankAccount.accountName}</strong></p>
                                <div className="flex items-center justify-between">
                                    <span className={theme.textMuted}>Số tài khoản: <strong className={`font-mono ${theme.textTitle}`}>{bill.bankAccount.accountNumber}</strong></span>
                                    <button
                                        type="button"
                                        onClick={() => copy(bill.bankAccount.accountNumber, 'Đã chép số tài khoản')}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline"
                                    >
                                        <Copy className="w-3 h-3" /> Chép
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={theme.textMuted}>Nội dung: <strong className="font-mono text-[#D4AF37]">{bill.number}</strong></span>
                                    <button
                                        type="button"
                                        onClick={() => copy(bill.number, 'Đã chép nội dung')}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline"
                                    >
                                        <Copy className="w-3 h-3" /> Chép
                                    </button>
                                </div>
                            </div>
                            <BankQr bank={bill.bankAccount} />
                            <p className={`text-[11px] italic ${theme.textMutedSoft}`}>
                                * Vui lòng chuyển đúng số tiền và nội dung chuyển khoản để chủ trọ đối chiếu và xác nhận.
                            </p>
                        </div>
                    )}

                    {/* Hành động chủ trọ / người thuê cho hóa đơn Manual */}
                    <div className="pt-2">
                        {owner ? (
                            <div>
                                {bill.reportedAt && (
                                    <p className="text-xs text-amber-400 mb-2.5 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Người thuê đã thông báo chuyển khoản lúc {new Date(bill.reportedAt).toLocaleString('vi-VN')}
                                    </p>
                                )}
                                {confirming ? (
                                    <div className="space-y-2.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                                        <p className="text-xs font-bold text-emerald-400">
                                            Xác nhận đã nhận đủ {money(bill.totalAmount)} vào tài khoản?
                                        </p>
                                        <input
                                            aria-label="Ghi chú xác nhận"
                                            maxLength={500}
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                            placeholder="Mã giao dịch hoặc ghi chú (tùy chọn)"
                                            className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-all ${theme.input}`}
                                        />
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                disabled={busy}
                                                onClick={runManual}
                                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                {busy ? 'Đang xác nhận...' : 'Đã nhận đủ tiền'}
                                            </button>
                                            <button
                                                disabled={busy}
                                                onClick={() => setConfirming(false)}
                                                className={`px-3 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all ${theme.textMuted}`}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirming(true)}
                                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4 stroke-[2.5]" /> Xác nhận đã nhận tiền
                                    </button>
                                )}
                            </div>
                        ) : (
                            bill.status === 'Unpaid' ? (
                                <button
                                    disabled={busy}
                                    onClick={runManual}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                                >
                                    {busy ? 'Đang gửi...' : 'Tôi đã hoàn tất chuyển khoản'}
                                </button>
                            ) : (
                                <p className={`text-xs italic ${theme.textMutedSoft}`}>
                                    Chủ trọ sẽ kiểm tra tài khoản và xác nhận hóa đơn.
                                </p>
                            )
                        )}
                    </div>
                </>
            )}

            {error && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </article>
    );
}

export default function ResidentBills() {
    const [bills, setBills] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try { setBills(await billingJson('me/invoices')); }
        catch (e) { setError(e.message); } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        load();
        const refresh = () => { if (document.visibilityState === 'visible') load(); };
        document.addEventListener('visibilitychange', refresh);

        // SignalR real-time auto reload for resident bills
        const unsubscribe = onInvoicePaymentUpdated(async () => {
            await load();
        });

        return () => {
            document.removeEventListener('visibilitychange', refresh);
            unsubscribe();
        };
    }, [load]);

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight text-[#D4AF37]">Hóa đơn cần thanh toán</h3>
                    <span className="text-[11px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                        {bills.length} hóa đơn
                    </span>
                </div>
                <button
                    disabled={loading}
                    onClick={load}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-all underline"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                    <span>Tải lại</span>
                </button>
            </div>
            {error && <p role="alert" className="text-rose-500 text-xs font-semibold">{error}</p>}
            {loading && <p className="text-xs text-gray-400">Đang tải danh sách hóa đơn...</p>}
            {!loading && !error && bills.length === 0 && <p className="text-xs text-gray-500 italic">Chưa có hóa đơn nào được phát hành.</p>}
            <div className="grid gap-4 lg:grid-cols-2">
                {bills.map(bill => (
                    <BillCard
                        key={bill.id}
                        bill={bill}
                        onChanged={load}
                        isDarkMode={true}
                    />
                ))}
            </div>
        </section>
    );
}
