/* eslint-disable react-hooks/set-state-in-effect -- Effects synchronize authenticated API resources and revoke object URLs. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { billingJson, getPaymentCapabilities, money } from '../api/billingApi';
import { BankQr, BillCard } from '../components/BillingCards';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { onInvoicePaymentUpdated, onPaymentConnectionStatus, startPaymentConnection } from '../services/paymentSignalR';
import { normalizeBankAccount, validateBankAccount } from '../utils/bankAccount';
import {
    Receipt,
    Plus,
    X,
    Building,
    Calendar,
    Clock,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Filter,
    ChevronDown,
    UploadCloud,
    RefreshCw,
    FileText,
    Check,
    Sparkles,
    User,
    DollarSign,
    Layers,
    ShieldCheck,
    Zap,
    Wifi,
    WifiOff
} from 'lucide-react';

function BankSettings({ bank, onSaved, isDarkMode = true }) {
    const [form, setForm] = useState({
        bankName: bank?.bankName || '',
        accountNumber: bank?.accountNumber || '',
        accountName: bank?.accountName || ''
    });
    const [file, setFile] = useState(null);
    const [removeQr, setRemoveQr] = useState(false);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!file) { setPreview(''); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const submit = async e => {
        e.preventDefault();
        setError('');
        const normalized = normalizeBankAccount(form);
        const validationError = validateBankAccount(normalized);
        if (validationError) { setError(validationError); return; }
        if (file && (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024)) {
            setError('Vui lòng chọn ảnh định dạng PNG/JPG có dung lượng tối đa 2 MB.');
            return;
        }
        setBusy(true);
        try {
            const data = new FormData();
            Object.entries(normalized).forEach(([key, value]) => data.append(key, value));
            data.append('removeQr', String(removeQr));
            if (file) data.append('qrImage', file);
            await billingJson('bank-account', { method: 'PUT', body: data });
            await onSaved();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const theme = isDarkMode
        ? {
            box: 'bg-[#161622] border-[#2A2518]',
            input: 'bg-[#11111A] border-[#2A2518] text-white focus:border-[#D4AF37] placeholder-gray-500',
            title: 'text-white',
            muted: 'text-gray-400',
            dropzone: 'border-[#2A2518] hover:border-[#D4AF37]/60 bg-[#11111A]/60'
        }
        : {
            box: 'bg-[#FAF8F5] border-[#E5D4AD]',
            input: 'bg-white border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
            title: 'text-slate-950',
            muted: 'text-slate-500',
            dropzone: 'border-[#E5D4AD] hover:border-[#D4AF37] bg-white'
        };

    return (
        <form onSubmit={submit} className={`rounded-2xl border p-5 md:p-6 space-y-4 shadow-sm transition-all ${theme.box}`}>
            <div className="flex items-center gap-2.5 border-b pb-3 border-inherit/40">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                    <CreditCard className="w-4 h-4" />
                </div>
                <div>
                    <h4 className={`text-sm font-black tracking-tight ${theme.title}`}>Tài Khoản Ngân Hàng Nhận Tiền Thu</h4>
                    <p className={`text-xs ${theme.muted}`}>Thông tin tài khoản nhận chuyển khoản và mã QR hiển thị trên hóa đơn cư dân</p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.muted}`}>Tên ngân hàng *</label>
                    <input
                        required
                        maxLength={100}
                        placeholder="Ví dụ: Vietcombank, MB Bank, Techcombank"
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border font-medium focus:outline-none transition-all ${theme.input}`}
                        value={form.bankName}
                        onChange={e => setForm({ ...form, bankName: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.muted}`}>Số tài khoản nhận *</label>
                    <input
                        required
                        maxLength={50}
                        placeholder="Ví dụ: 0987654321"
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border font-mono font-bold focus:outline-none transition-all ${theme.input}`}
                        value={form.accountNumber}
                        onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.muted}`}>Tên chủ tài khoản *</label>
                    <input
                        required
                        maxLength={150}
                        placeholder="Ví dụ: NGUYEN VAN A"
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border font-bold uppercase focus:outline-none transition-all ${theme.input}`}
                        value={form.accountName}
                        onChange={e => setForm({ ...form, accountName: e.target.value })}
                    />
                </div>
            </div>

            {/* Dropbox / Tải lên mã QR */}
            <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.muted}`}>
                    Ảnh mã QR chuyển khoản thủ công (PNG / JPG, tối đa 2 MB)
                </label>
                <label className={`relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${theme.dropzone}`}>
                    <UploadCloud className="w-7 h-7 text-[#D4AF37] mb-1.5 stroke-[1.8]" />
                    <span className={`text-xs font-bold ${theme.title}`}>Bấm để chọn hoặc kéo thả ảnh QR vào đây</span>
                    <span className={`text-[11px] ${theme.muted} mt-0.5`}>Hệ thống sẽ gắn mã QR này vào hóa đơn chuyển khoản</span>
                    <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={e => {
                            setFile(e.target.files?.[0] || null);
                            setRemoveQr(false);
                        }}
                    />
                </label>
            </div>

            {preview ? (
                <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-[#D4AF37]/50 bg-[#D4AF37]/5">
                    <img src={preview} alt="Ảnh QR đã chọn" className="w-24 h-24 object-contain bg-white rounded-lg p-1 border shadow-sm" />
                    <div>
                        <span className="text-xs font-bold text-emerald-400 block">Đã chọn ảnh mới</span>
                        <span className={`text-[11px] ${theme.muted}`}>{file?.name} ({(file?.size / 1024).toFixed(1)} KB)</span>
                        <button
                            type="button"
                            onClick={() => { setFile(null); }}
                            className="mt-1 block text-xs font-semibold text-rose-400 hover:underline"
                        >
                            Hủy bỏ ảnh này
                        </button>
                    </div>
                </div>
            ) : (
                !removeQr && bank?.hasQr && <BankQr bank={bank} />
            )}

            {bank?.hasQr && (
                <label className={`flex items-center gap-2 text-xs font-medium cursor-pointer ${theme.muted}`}>
                    <input
                        type="checkbox"
                        checked={removeQr}
                        onChange={e => { setRemoveQr(e.target.checked); setFile(null); }}
                        className="rounded border-gray-600 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span>Xóa mã QR hiện tại khỏi cấu hình mới</span>
                </label>
            )}

            <p className={`text-[11px] italic ${theme.muted}`}>
                * Lưu ý: Thay đổi tài khoản sẽ áp dụng cho các hóa đơn phát hành sau khi lưu. Hóa đơn cũ giữ nguyên thông tin đã phát hành.
            </p>

            {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="pt-2 flex justify-end">
                <button
                    disabled={busy}
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {busy ? (
                        <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4 stroke-[2.5]" /> Lưu cấu hình tài khoản
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

function IssueBills({
    properties = [],
    externalProperties = [],
    bank,
    capabilities,
    onOpenUpgradePro,
    onClose,
    onIssued,
    isDarkMode = true,
    facilityFilter = 'All'
}) {
    // Tổng hợp và chuẩn hóa danh sách Cơ sở / Nhà trọ từ cả prop nội bộ và bên ngoài
    const allProperties = useMemo(() => {
        const map = new Map();
        const add = (p) => {
            if (!p) return;
            const id = p.id || p.propertyId || p.Id;
            if (!id || id === 'All' || id === 'Hệ thống') return;
            const name = p.propertyName || p.name || p.Name || `Cơ sở ${id.toString().substring(0, 6)}`;
            if (!map.has(id)) {
                map.set(id, { id, name });
            }
        };
        (Array.isArray(properties) ? properties : []).forEach(add);
        (Array.isArray(externalProperties) ? externalProperties : []).forEach(add);
        return Array.from(map.values());
    }, [properties, externalProperties]);

    const initialPropId = (facilityFilter && facilityFilter !== 'All' && facilityFilter !== 'Hệ thống')
        ? facilityFilter
        : (allProperties[0]?.id || '');

    const [propertyId, setPropertyId] = useState(initialPropId);
    const [period, setPeriod] = useState(() => new Date().toLocaleDateString('sv-SE').slice(0, 7));
    const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 7 * 86400000).toLocaleDateString('sv-SE'));
    const [paymentMode, setPaymentMode] = useState('Manual');
    const [rooms, setRooms] = useState([]);
    const [roomIds, setRoomIds] = useState([]);
    const [chargeKeys, setChargeKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const requestId = useRef(0);
    const [reload, setReload] = useState(0);

    const canUsePayOs = capabilities?.canUsePayOs === true;
    const requiresUpgrade = capabilities?.requiresUpgrade === true;
    const configurationRequired = capabilities?.configurationRequired === true;

    // Tự động gán cơ sở đầu tiên nếu propertyId đang trống
    useEffect(() => {
        if (!propertyId && allProperties.length > 0) {
            setPropertyId(allProperties[0].id);
        }
    }, [allProperties, propertyId]);

    // Gọi API tính toán preview hóa đơn
    useEffect(() => {
        const id = ++requestId.current;
        let disposed = false;
        setRooms([]);
        setRoomIds([]);
        setChargeKeys([]);
        setError('');
        if (!propertyId || !period) return;
        setLoading(true);
        billingJson(`preview?propertyId=${propertyId}&period=${encodeURIComponent(period)}`)
            .then(data => {
                if (!disposed && id === requestId.current) {
                    const list = Array.isArray(data) ? data : [];
                    setRooms(list);
                }
            })
            .catch(e => {
                if (!disposed && id === requestId.current) setError(e.message);
            })
            .finally(() => {
                if (!disposed && id === requestId.current) setLoading(false);
            });
        return () => { disposed = true; };
    }, [propertyId, period, reload]);

    // Tự động chọn tất cả khoản thu và tất cả phòng hợp lệ khi dữ liệu xem trước được tải
    useEffect(() => {
        if (rooms.length > 0) {
            const keys = new Set();
            rooms.forEach(r => (r.lines || []).forEach(l => keys.add(l.key)));
            setChargeKeys(Array.from(keys));
            const elig = rooms.filter(r => r.residentId && (r.lines || []).length > 0);
            setRoomIds(elig.map(r => r.roomId));
        }
    }, [rooms]);

    const charges = new Map();
    rooms.forEach(room => {
        (room.lines || []).forEach(line => charges.set(line.key, line.description));
        (room.errors || []).filter(e => e.includes('|')).forEach(e => {
            const [key, text] = e.split('|');
            if (!charges.has(key)) charges.set(key, text.split(':')[0]);
        });
    });

    const eligible = rooms.filter(r => r.residentId && (r.lines || []).length > 0);
    const toggle = (values, key) => values.includes(key) ? values.filter(v => v !== key) : [...values, key];
    const selected = rooms.filter(r => roomIds.includes(r.roomId));
    const amount = room => (room.lines || []).filter(l => chargeKeys.includes(l.key)).reduce((sum, l) => sum + l.amount, 0);
    const problems = room => (room.errors || []).filter(e => !e.includes('|') || chargeKeys.includes(e.split('|')[0])).map(e => e.includes('|') ? e.split('|')[1] : e);
    const blocked = selected.some(r => problems(r).length || amount(r) <= 0);

    const submit = async e => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            await billingJson('invoices', {
                method: 'POST',
                body: JSON.stringify({
                    propertyId,
                    period,
                    dueDate,
                    roomIds,
                    chargeKeys,
                    paymentMode
                })
            });
            await onIssued();
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const theme = isDarkMode
        ? {
            modal: 'bg-[#11111A] border-[#2A2518] text-white',
            header: 'bg-gradient-to-r from-[#1E1609] via-[#161622] to-[#11111A] border-[#2A2518]',
            panel: 'bg-[#161622] border-[#2A2518]',
            panelSoft: 'bg-[#14141E] border-[#2A2518]/50',
            input: 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]',
            title: 'text-white',
            muted: 'text-gray-400',
            mutedSoft: 'text-gray-500',
            optionBg: 'bg-[#161622] text-white',
            divider: 'border-[#2A2518]/60'
        }
        : {
            modal: 'bg-[#FAF8F5] border-[#E5D4AD] text-slate-900',
            header: 'bg-gradient-to-r from-[#FFF9EC] to-white border-[#E5D4AD]',
            panel: 'bg-white border-[#E5D4AD]',
            panelSoft: 'bg-[#FFF9EC] border-[#E5D4AD]/70',
            input: 'bg-white border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]',
            title: 'text-slate-950',
            muted: 'text-slate-500',
            mutedSoft: 'text-slate-400',
            optionBg: 'bg-white text-slate-900',
            divider: 'border-[#E5D4AD]/70'
        };

    const totalBatch = selected.reduce((sum, r) => sum + amount(r), 0);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Lập phiếu thu tiền phòng và dịch vụ">
            <form onSubmit={submit} className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${theme.modal}`}>
                {/* Header */}
                <div className={`p-5 md:px-6 flex items-center justify-between border-b ${theme.header}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                            <Receipt className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> HỆ THỐNG PHÁT HÀNH HÓA ĐƠN ĐỊNH KỲ
                            </span>
                            <h3 className={`text-lg font-black tracking-tight ${theme.title} mt-0.5`}>
                                Lập Phiếu Thu Tiền Phòng & Dịch Vụ
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onClose}
                        aria-label="Đóng"
                        className="p-2 rounded-xl border border-transparent hover:border-inherit hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (scrollable) */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
                    {/* Hàng 1: Bộ điều khiển Cơ sở, Kỳ thu, Hạn thanh toán */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        {/* Dropdown Cơ sở / Nhà trọ */}
                        <div className="space-y-1.5">
                            <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>
                                <Building className="w-3.5 h-3.5 inline mr-1 text-[#D4AF37]" /> Cơ sở / Nhà trọ *
                            </label>
                            <div className="relative">
                                <select
                                    disabled={busy}
                                    required
                                    value={propertyId}
                                    onChange={e => setPropertyId(e.target.value)}
                                    className={`w-full rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold border appearance-none focus:outline-none transition-all cursor-pointer ${theme.input}`}
                                >
                                    <option value="" className={theme.optionBg}>-- Chọn nhà trọ --</option>
                                    {allProperties.map(p => (
                                        <option key={p.id} value={p.id} className={theme.optionBg}>{p.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4AF37]" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>
                                <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#D4AF37]" /> Kỳ thu (Tháng/Năm) *
                            </label>
                            <input
                                disabled={busy}
                                required
                                type="month"
                                value={period}
                                onChange={e => setPeriod(e.target.value)}
                                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold border focus:outline-none transition-all ${theme.input}`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>
                                <Clock className="w-3.5 h-3.5 inline mr-1 text-[#D4AF37]" /> Hạn thanh toán *
                            </label>
                            <input
                                disabled={busy}
                                required
                                type="date"
                                min={`${period}-01`}
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold border focus:outline-none transition-all ${theme.input}`}
                            />
                        </div>
                    </div>

                    {/* Lựa chọn phương thức thanh toán: Manual vs PayOS */}
                    <div className={`p-4 rounded-xl border space-y-3 ${theme.panelSoft}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.title}`}>
                                <CreditCard className="w-4 h-4 text-[#D4AF37]" /> Phương thức thanh toán hóa đơn
                            </span>
                            {requiresUpgrade && (
                                <button
                                    type="button"
                                    onClick={onOpenUpgradePro}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline"
                                >
                                    <Sparkles className="w-3 h-3" /> Nâng cấp PRO để dùng PayOS
                                </button>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                            {/* Option 1: Manual */}
                            <label
                                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${paymentMode === 'Manual'
                                    ? isDarkMode
                                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-sm'
                                        : 'bg-amber-50 border-[#D4AF37]'
                                    : theme.panel
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMode"
                                    value="Manual"
                                    checked={paymentMode === 'Manual'}
                                    onChange={() => setPaymentMode('Manual')}
                                    className="mt-0.5 text-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                                <div className="space-y-0.5">
                                    <strong className={`block ${theme.title}`}>Chuyển khoản thủ công</strong>
                                    <span className={`text-[11px] block leading-tight ${theme.muted}`}>
                                        Cư dân xem số tài khoản và ảnh QR chủ trọ tải lên, báo đã chuyển; chủ trọ tự đối soát và xác nhận.
                                    </span>
                                </div>
                            </label>

                            {/* Option 2: PayOS */}
                            <label
                                className={`p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 select-none ${!canUsePayOs
                                    ? 'opacity-65 cursor-pointer bg-inherit border-dashed'
                                    : paymentMode === 'PayOS'
                                        ? isDarkMode
                                            ? 'bg-blue-500/15 border-blue-500 shadow-sm'
                                            : 'bg-blue-50 border-blue-500'
                                        : theme.panel + ' cursor-pointer'
                                }`}
                                onClick={e => {
                                    if (!canUsePayOs) {
                                        e.preventDefault();
                                        if (requiresUpgrade && onOpenUpgradePro) onOpenUpgradePro();
                                    }
                                }}
                            >
                                <input
                                    type="radio"
                                    name="paymentMode"
                                    value="PayOS"
                                    disabled={!canUsePayOs}
                                    checked={paymentMode === 'PayOS'}
                                    onChange={() => { if (canUsePayOs) setPaymentMode('PayOS'); }}
                                    className="mt-0.5 text-blue-500 focus:ring-blue-500"
                                />
                                <div className="space-y-0.5 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <strong className={`block ${canUsePayOs ? theme.title : theme.muted}`}>
                                            Tự động PayOS (Mã QR động)
                                        </strong>
                                        {requiresUpgrade ? (
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                                                PRO
                                            </span>
                                        ) : canUsePayOs ? (
                                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                TỰ ĐỘNG
                                            </span>
                                        ) : null}
                                    </div>
                                    <span className={`text-[11px] block leading-tight ${theme.muted}`}>
                                        Tự động sinh mã VietQR theo số tiền hóa đơn. Cư dân quét mã là tự khớp tiền qua Webhook 24/7.
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Thông báo tương ứng theo phương thức và cấu hình */}
                        {paymentMode === 'PayOS' ? (
                            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <span>Đã chọn PayOS: Hệ thống tự động cấp QR riêng theo hóa đơn. Không bắt buộc cấu hình ảnh QR thủ công.</span>
                                </div>
                                <span className="text-[11px] font-bold text-blue-400">PayOS Ready</span>
                            </div>
                        ) : bank ? (
                            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    <span>Tài khoản nhận: <strong>{bank.bankName}</strong> · <strong>{bank.accountNumber}</strong> ({bank.accountName})</span>
                                </div>
                                <span className="text-[11px] font-bold text-[#D4AF37]">QR sẵn sàng</span>
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                                <span>Chưa có thông tin tài khoản ngân hàng nhận tiền. Vui lòng thiết lập để xuất mã QR trên hóa đơn thủ công.</span>
                            </div>
                        )}

                        {configurationRequired && (
                            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                                <span>Tài khoản demo chưa được cấu hình đầy đủ kết nối PayOS trên server. Hệ thống hiện chỉ hỗ trợ Chuyển khoản thủ công.</span>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="p-4 rounded-xl border border-dashed border-[#D4AF37]/40 text-center text-xs text-[#D4AF37] font-semibold flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Đang tổng hợp chỉ số điện, nước và các khoản thu...
                        </div>
                    )}

                    {/* Chọn các khoản thu */}
                    {charges.size > 0 && (
                        <div className={`p-4 rounded-xl border space-y-2.5 ${theme.panelSoft}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.title}`}>
                                    <Layers className="w-4 h-4 text-[#D4AF37]" /> Chọn các khoản thu phát hành
                                </span>
                                <span className={`text-[11px] ${theme.mutedSoft}`}>({chargeKeys.length}/{charges.size} khoản được chọn)</span>
                            </div>
                            <div className="flex flex-wrap gap-2.5 pt-1">
                                {[...charges].map(([key, name]) => {
                                    const active = chargeKeys.includes(key);
                                    return (
                                        <button
                                            type="button"
                                            key={key}
                                            disabled={busy || loading}
                                            onClick={() => setChargeKeys(toggle(chargeKeys, key))}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${active
                                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-sm'
                                                : isDarkMode
                                                    ? 'bg-[#161622] border-[#2A2518] text-gray-400 hover:text-white'
                                                    : 'bg-white border-[#E5D4AD] text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#D4AF37]' : 'bg-gray-500'}`} />
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Danh sách phòng thu tiền */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.title}`}>
                                <Building className="w-4 h-4 text-[#D4AF37]" /> Danh sách phòng phát hành ({selected.length}/{rooms.length} phòng)
                            </span>
                            {eligible.length > 0 && (
                                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] cursor-pointer hover:underline">
                                    <input
                                        type="checkbox"
                                        checked={eligible.length > 0 && roomIds.length === eligible.length}
                                        onChange={e => setRoomIds(e.target.checked ? eligible.map(r => r.roomId) : [])}
                                        className="rounded border-gray-600 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span>Chọn tất cả phòng đủ điều kiện ({eligible.length})</span>
                                </label>
                            )}
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2 max-h-64 overflow-y-auto pr-1">
                            {rooms.map(room => {
                                const isEligible = room.residentId && (room.lines || []).length > 0;
                                const isChecked = roomIds.includes(room.roomId);
                                const roomAmt = amount(room);
                                return (
                                    <label
                                        key={room.roomId}
                                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${isChecked
                                            ? isDarkMode
                                                ? 'bg-[#D4AF37]/5 border-[#D4AF37]/50 shadow-sm'
                                                : 'bg-amber-50/50 border-[#D4AF37]/50'
                                            : !isEligible
                                                ? 'opacity-50 cursor-not-allowed bg-inherit border-dashed'
                                                : theme.panel
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            disabled={!isEligible}
                                            checked={isChecked}
                                            onChange={() => setRoomIds(toggle(roomIds, room.roomId))}
                                            className="mt-0.5 rounded border-gray-600 text-[#D4AF37] focus:ring-[#D4AF37]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <strong className={theme.title}>Phòng {room.roomNumber}</strong>
                                                {isChecked && <span className="font-bold text-[#D4AF37]">{money(roomAmt)}</span>}
                                            </div>
                                            <span className={`text-[11px] block truncate ${theme.muted}`}>
                                                {room.payerName || 'Chưa có người đại diện'}
                                            </span>
                                            {(room.lines || []).length === 0 && (
                                                <span className="text-[10px] text-amber-500 block mt-0.5">
                                                    Không có khoản mới chưa thu.
                                                </span>
                                            )}
                                            {!room.residentId && (
                                                <span className="text-[10px] text-rose-500 block mt-0.5">
                                                    Chưa gán cư dân đại diện hợp đồng.
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        {!loading && propertyId && rooms.length === 0 && (
                            <div className={`p-8 text-center text-xs font-medium italic rounded-xl border border-dashed ${theme.panelSoft} ${theme.mutedSoft}`}>
                                Không tìm thấy phòng nào có dữ liệu cần thu trong kỳ {period}.
                            </div>
                        )}
                    </div>

                    {/* Xem trước đợt phát hành hóa đơn */}
                    {selected.length > 0 && (
                        <div className={`rounded-xl border p-4 space-y-3 ${theme.panelSoft}`}>
                            <div className="flex items-center justify-between">
                                <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.title}`}>
                                    <FileText className="w-4 h-4 text-[#D4AF37]" /> Chi tiết xem trước hóa đơn ({selected.length} hóa đơn)
                                </h4>
                                <span className="text-xs font-black text-[#D4AF37]">
                                    Tổng tạm tính: {money(totalBatch)}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {selected.map(room => (
                                    <div key={room.roomId} className={`p-3 rounded-lg border text-xs space-y-1 ${theme.panel}`}>
                                        <div className="flex justify-between items-center font-bold">
                                            <span className={theme.title}>Phòng {room.roomNumber} · {room.payerName}</span>
                                            <span className="text-[#D4AF37] font-black">{money(amount(room))}</span>
                                        </div>
                                        <div className="space-y-0.5 text-[11px]">
                                            {(room.lines || []).filter(l => chargeKeys.includes(l.key)).map(l => (
                                                <div key={l.key} className={`flex justify-between ${theme.muted}`}>
                                                    <span>{l.description} ({l.quantity} × {money(l.unitPrice)})</span>
                                                    <span>{money(l.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {problems(room).map((e, idx) => (
                                            <p key={idx} className="text-[10px] text-rose-400 font-medium">{e}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between" role="alert">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                            <button
                                type="button"
                                disabled={busy}
                                className="underline font-bold text-xs"
                                onClick={() => setReload(x => x + 1)}
                            >
                                Thử lại
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 md:px-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${theme.panel}`}>
                    <div>
                        <span className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>
                            Tổng đợt thu ({selected.length} hóa đơn) · {paymentMode === 'PayOS' ? 'PayOS Tự Động' : 'Thủ công'}
                        </span>
                        <div className="text-xl font-black text-[#D4AF37] tracking-tight">{money(totalBatch)}</div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={onClose}
                            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${isDarkMode
                                ? 'border-[#2A2518] text-gray-300 hover:bg-white/5'
                                : 'border-[#E5D4AD] text-slate-700 hover:bg-amber-50'
                                }`}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={busy || loading || !selected.length || !chargeKeys.length || blocked}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {busy ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Đang phát hành...
                                </>
                            ) : (
                                <>
                                    <Receipt className="w-4 h-4 stroke-[2.2]" /> Phát hành hóa đơn
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function BillingManagement({
    open = false,
    onClose,
    facilityFilter = 'All',
    properties: externalProperties = [],
    isDarkMode = true,
    onLoaded,
    onMutation
}) {
    const mutationRef = useRef(onMutation);
    useEffect(() => { mutationRef.current = onMutation; }, [onMutation]);

    const [bills, setBills] = useState([]);
    const [properties, setProperties] = useState([]);
    const [bank, setBank] = useState(null);
    const [capabilities, setCapabilities] = useState(null);
    const [proModalOpen, setProModalOpen] = useState(false);
    const [settings, setSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('Unpaid');
    const [signalRState, setSignalRState] = useState('disconnected');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [invoices, places, account, caps] = await Promise.all([
                billingJson('invoices').catch(err => {
                    console.warn('Load invoices warn:', err);
                    return [];
                }),
                billingJson('properties').catch(err => {
                    console.warn('Load billing properties warn:', err);
                    return [];
                }),
                billingJson('bank-account').catch(err => {
                    console.warn('Load bank account warn:', err);
                    return null;
                }),
                getPaymentCapabilities().catch(err => {
                    console.warn('Load capabilities warn:', err);
                    return null;
                })
            ]);
            setBills(Array.isArray(invoices) ? invoices : []);
            setProperties(Array.isArray(places) ? places : []);
            setBank(account);
            setCapabilities(caps);
            if (onLoaded) onLoaded(Array.isArray(invoices) ? invoices : []);
        } catch (e) {
            setError(e.message || 'Lỗi tải dữ liệu hóa đơn');
        } finally {
            setLoading(false);
        }
    }, [onLoaded]);

    useEffect(() => {
        load();
        const refresh = () => {
            if (document.visibilityState === 'visible') {
                load().then(() => { if (mutationRef.current) mutationRef.current(); });
            }
        };
        document.addEventListener('visibilitychange', refresh);

        // Listen for SignalR payment events to automatically refresh
        const unsubscribePayment = onInvoicePaymentUpdated(async () => {
            await load();
            if (mutationRef.current) await mutationRef.current();
        });

        // Track SignalR status
        const unsubscribeStatus = onPaymentConnectionStatus(setSignalRState);

        return () => {
            document.removeEventListener('visibilitychange', refresh);
            unsubscribePayment();
            unsubscribeStatus();
        };
    }, [load]);

    const changed = async () => {
        await load();
        if (onMutation) await onMutation();
    };

    const visible = bills.filter(b => {
        const matchFacility = (facilityFilter === 'All' || b.propertyId === facilityFilter);
        const matchStatus = (filter === 'All' || (filter === 'Unpaid' ? b.status !== 'Paid' : b.status === filter));
        return matchFacility && matchStatus;
    });

    const theme = isDarkMode
        ? {
            panel: 'bg-[#11111A] border-[#2A2518]',
            panelSoft: 'bg-[#161622] border-[#2A2518]/40',
            title: 'text-white',
            muted: 'text-gray-400',
            mutedSoft: 'text-gray-500',
            dropdown: 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]',
            optionBg: 'bg-[#161622] text-white'
        }
        : {
            panel: 'bg-white border-[#E5D4AD]',
            panelSoft: 'bg-[#FAF8F5] border-[#E5D4AD]/70',
            title: 'text-slate-950',
            muted: 'text-slate-500',
            mutedSoft: 'text-slate-400',
            dropdown: 'bg-white border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]',
            optionBg: 'bg-white text-slate-900'
        };

    return (
        <section className={`rounded-2xl border p-6 space-y-5 shadow-sm transition-all ${theme.panel}`}>
            {/* Header thanh công cụ Hóa đơn & Công nợ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" /> THEO DÕI HÓA ĐƠN & THU HỒI CÔNG NỢ
                        </span>
                        {/* Real-time Connection Indicator */}
                        {signalRState === 'connected' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Đã kết nối thông báo thời gian thực PayOS">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Realtime
                            </span>
                        ) : signalRState === 'reconnecting' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Đang kết nối lại SignalR...">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang kết nối
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => startPaymentConnection()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:text-white"
                                title="Bấm để kết nối lại thông báo thời gian thực"
                            >
                                <WifiOff className="w-2.5 h-2.5" /> Mất kết nối
                            </button>
                        )}
                    </div>
                    <h3 className={`text-xl font-black tracking-tight ${theme.title} mt-0.5`}>
                        Hóa Đơn Cư Dân & Thu Tiền Phòng
                    </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Nút Nâng cấp PRO cho chủ trọ không phải demo */}
                    {capabilities?.requiresUpgrade && (
                        <button
                            type="button"
                            onClick={() => setProModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:opacity-95 text-black shadow-md shadow-[#D4AF37]/20 transition-all hover:scale-[1.02]"
                        >
                            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Nâng cấp PRO</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setSettings(!settings)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${settings
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : isDarkMode
                                ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37] hover:bg-[#D4AF37]/10'
                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-[#AA7C11] hover:bg-amber-100/50'
                            }`}
                    >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{settings ? 'Đóng cấu hình tài khoản' : 'Cấu hình tài khoản nhận tiền'}</span>
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={changed}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${isDarkMode
                            ? 'border-[#2A2518] text-gray-400 hover:text-white hover:bg-white/5'
                            : 'border-[#E5D4AD] text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                        <span>Tải lại</span>
                    </button>
                </div>
            </div>

            {/* Form cấu hình tài khoản nhận tiền khi mở */}
            {settings && (
                <BankSettings
                    key={bank?.id || 'new'}
                    bank={bank}
                    isDarkMode={isDarkMode}
                    onSaved={async () => {
                        await load();
                        setSettings(false);
                    }}
                />
            )}

            {!bank && !settings && !loading && !error && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                        <span>Chưa có thông tin tài khoản ngân hàng nhận tiền. Vui lòng thiết lập để xuất mã QR trên hóa đơn chuyển khoản thủ công.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettings(true)}
                        className="text-xs font-bold text-[#D4AF37] underline whitespace-nowrap hover:opacity-80"
                    >
                        Cấu hình ngay
                    </button>
                </div>
            )}

            {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Bộ lọc trạng thái Dropdown format chuẩn */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-inherit/40">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${theme.muted}`}>
                        <Filter className="w-3.5 h-3.5 text-[#D4AF37]" /> Trạng thái:
                    </span>
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className={`text-xs font-bold border rounded-xl px-3 py-1.5 pr-8 appearance-none focus:outline-none transition-all cursor-pointer ${theme.dropdown}`}
                        >
                            <option value="Unpaid" className={theme.optionBg}>Chưa thanh toán (Tất cả)</option>
                            <option value="AwaitingConfirmation" className={theme.optionBg}>Chờ xác nhận</option>
                            <option value="Paid" className={theme.optionBg}>Đã thanh toán</option>
                            <option value="All" className={theme.optionBg}>Tất cả hóa đơn</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4AF37]" />
                    </div>
                </div>

                <span className={`text-xs ${theme.mutedSoft}`}>
                    Đang hiển thị <strong className="text-[#D4AF37]">{visible.length}</strong> hóa đơn
                </span>
            </div>

            {loading && (
                <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" /> Đang tải danh sách hóa đơn...
                </div>
            )}

            {!loading && !error && visible.length === 0 && (
                <div className={`p-8 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 ${theme.panelSoft}`}>
                    <FileText className={`w-8 h-8 ${theme.mutedSoft}`} />
                    <span className={`text-xs font-medium italic ${theme.mutedSoft}`}>
                        Không tìm thấy hóa đơn phù hợp với bộ lọc hiện tại.
                    </span>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                {visible.map(bill => (
                    <BillCard
                        key={bill.id}
                        bill={bill}
                        owner
                        onChanged={changed}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>

            {/* Modal Lập Phiếu Thu Mới */}
            {open && (
                <IssueBills
                    properties={properties}
                    externalProperties={externalProperties}
                    bank={bank}
                    capabilities={capabilities}
                    onOpenUpgradePro={() => setProModalOpen(true)}
                    onClose={onClose}
                    onIssued={changed}
                    isDarkMode={isDarkMode}
                    facilityFilter={facilityFilter}
                />
            )}

            {/* Modal Giới thiệu Nâng cấp PRO */}
            <ProUpgradeModal
                isOpen={proModalOpen}
                onClose={() => setProModalOpen(false)}
                isDarkMode={isDarkMode}
            />
        </section>
    );
}
