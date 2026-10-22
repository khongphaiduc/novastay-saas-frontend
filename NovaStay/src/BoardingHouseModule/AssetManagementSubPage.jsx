import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, Plus, Package, Edit, Edit2, Trash2, X, Check, AlertTriangle,
    Sparkles, History, ArrowRightLeft, Wrench, Tag, Calendar,
    DollarSign, Hash, Building2, Building, ChevronDown, RefreshCw, Info,
    AlertCircle, CheckCircle2, Home, Clock, LayoutGrid, List, SlidersHorizontal,
    Shield, Layers, Box, CheckSquare
} from 'lucide-react';
import {
    getAssets, getAssetStatistics, createAsset, updateAsset, deleteAsset,
    assignAsset, revokeAsset, updateAssetStatus, getAssetHistory
} from '../api/assetApi';
import { getProperties } from '../api/propertyApi';
import { getRooms } from '../api/roomApi';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ASSET_STATUSES = ['Good', 'Working', 'Damaged', 'Maintenance', 'Broken'];

const STATUS_META = {
    Good:        { label: 'Tốt',          color: 'emerald' },
    Working:     { label: 'Đang dùng',    color: 'amber' },
    Damaged:     { label: 'Hư hỏng',      color: 'rose' },
    Maintenance: { label: 'Bảo trì',      color: 'sky' },
    Broken:      { label: 'Hỏng nặng',    color: 'rose' },
};

const CATEGORY_OPTIONS = [
    'Điện tử', 'Điện lạnh', 'Gia dụng', 'Nội thất gỗ',
    'Thiết bị vệ sinh', 'An ninh', 'Chiếu sáng', 'Khác',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getOrgId() {
    try {
        const acc = JSON.parse(localStorage.getItem('ns_account') || '{}');
        return acc.organizationId || '';
    } catch { return ''; }
}

function getBusinessName() {
    try {
        const acc = JSON.parse(localStorage.getItem('ns_account') || '{}');
        return acc.businessName || 'Hệ Thống NovaStay';
    } catch { return 'Hệ Thống NovaStay'; }
}

function formatCurrency(v) {
    if (!v && v !== 0) return '—';
    return new Intl.NumberFormat('vi-VN').format(v) + 'đ';
}

function formatDate(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('vi-VN'); }
    catch { return d; }
}

function relativeTime(d) {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Vừa xong';
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
}

function getStatusBadgeStyle(status, isDarkMode = true) {
    if (isDarkMode) {
        switch (status) {
            case 'Good':
                return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
            case 'Working':
                return 'bg-amber-500/15 text-[#D4AF37] border border-[#D4AF37]/35';
            case 'Damaged':
                return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
            case 'Maintenance':
                return 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
            case 'Broken':
                return 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse';
            default:
                return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
        }
    } else {
        switch (status) {
            case 'Good':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'Working':
                return 'bg-amber-50 text-amber-800 border border-amber-300';
            case 'Damaged':
                return 'bg-orange-50 text-orange-700 border border-orange-200';
            case 'Maintenance':
                return 'bg-sky-50 text-sky-700 border border-sky-200';
            case 'Broken':
                return 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse';
            default:
                return 'bg-slate-100 text-slate-600 border border-slate-200';
        }
    }
}

// ─── CREATE / EDIT ASSET MODAL ────────────────────────────────────────────────
function AssetFormModal({ asset, organizationId, onClose, onSaved, showToast, theme }) {
    const isEdit = !!asset;
    const [form, setForm] = useState({
        assetName:          asset?.assetName || '',
        category:           asset?.category || CATEGORY_OPTIONS[0],
        brand:              asset?.brand || '',
        model:              asset?.model || '',
        assetCode:          asset?.assetCode || '',
        purchaseDate:       asset?.purchaseDate || '',
        warrantyExpiryDate: asset?.warrantyExpiryDate || '',
        baseValue:          asset?.baseValue || '',
        initialNote:        '',
    });
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.assetName.trim()) return showToast('Vui lòng nhập tên tài sản.', 'error');

        setLoading(true);
        try {
            const payload = {
                assetName:          form.assetName.trim(),
                category:           form.category || null,
                brand:              form.brand || null,
                model:              form.model || null,
                assetCode:          form.assetCode || null,
                purchaseDate:       form.purchaseDate || null,
                warrantyExpiryDate: form.warrantyExpiryDate || null,
                baseValue:          form.baseValue ? parseFloat(form.baseValue) : null,
            };
            let saved;
            if (isEdit) {
                saved = await updateAsset(asset.id, payload);
                showToast('Cập nhật tài sản thành công!', 'success');
            } else {
                saved = await createAsset({ ...payload, organizationId, initialNote: form.initialNote || null });
                showToast('Thêm tài sản vào kho thành công!', 'success');
            }
            onSaved(saved);
            onClose();
        } catch (err) {
            showToast(err.message || 'Lỗi khi lưu tài sản', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-all ${theme.panel}`}>
                
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${theme.border}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-black tracking-tight ${theme.title}`}>
                                {isEdit ? 'Chỉnh Sửa Thông Tin Tài Sản' : 'Khai Báo Tài Sản Mới Vào Kho'}
                            </h3>
                            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                {isEdit ? `Mã thiết bị: ${asset?.assetCode || asset?.id?.slice(0, 8)}` : 'Nhập thông số kỹ thuật và giá trị trang thiết bị'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-all ${theme.cardIdle}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Tên Tài Sản / Thiết Bị <span className="text-rose-500">*</span>
                            </label>
                            <input
                                required
                                value={form.assetName}
                                onChange={e => set('assetName', e.target.value)}
                                placeholder="VD: Điều hòa Daikin Inverter 1.5 HP, Tủ lạnh Toshiba 180L..."
                                className={`w-full rounded-xl px-4 py-3 text-sm font-bold border transition-all ${theme.input}`}
                            />
                        </div>

                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Danh Mục Phân Loại
                            </label>
                            <select
                                value={form.category}
                                onChange={e => set('category', e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 text-xs font-bold border transition-all ${theme.input}`}
                            >
                                {CATEGORY_OPTIONS.map(c => (
                                    <option key={c} value={c} className="bg-[#11111A] text-white">{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Mã Quản Lý (Mã Code)
                            </label>
                            <input
                                value={form.assetCode}
                                onChange={e => set('assetCode', e.target.value)}
                                placeholder="VD: TS-DH-001, TL-P102..."
                                className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                            />
                        </div>

                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Hãng Sản Xuất
                            </label>
                            <input
                                value={form.brand}
                                onChange={e => set('brand', e.target.value)}
                                placeholder="VD: Daikin, Panasonic, Samsung..."
                                className={`w-full rounded-xl px-4 py-3 text-xs font-bold border transition-all ${theme.input}`}
                            />
                        </div>

                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Dòng Máy / Model
                            </label>
                            <input
                                value={form.model}
                                onChange={e => set('model', e.target.value)}
                                placeholder="VD: FTKB35WAVMV..."
                                className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                            />
                        </div>

                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Ngày Mua Nhập Kho
                            </label>
                            <input
                                type="date"
                                value={form.purchaseDate}
                                onChange={e => set('purchaseDate', e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                            />
                        </div>

                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Hạn Bảo Hành
                            </label>
                            <input
                                type="date"
                                value={form.warrantyExpiryDate}
                                onChange={e => set('warrantyExpiryDate', e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Giá Trị Mua / Nguyên Giá (VNĐ)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="50000"
                                value={form.baseValue}
                                onChange={e => set('baseValue', e.target.value)}
                                placeholder="VD: 8500000"
                                className={`w-full rounded-xl px-4 py-3 text-sm font-mono font-bold border transition-all ${theme.input}`}
                            />
                        </div>

                        {!isEdit && (
                            <div className="md:col-span-2">
                                <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                    Ghi Chú Ban Đầu
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.initialNote}
                                    onChange={e => set('initialNote', e.target.value)}
                                    placeholder="Ghi chú xuất xứ, bảo hành hoặc tình trạng bàn giao..."
                                    className={`w-full rounded-xl px-4 py-2.5 text-xs border resize-none ${theme.input}`}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2.5 justify-end pt-4 border-t border-inherit/40">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${theme.buttonOutline}`}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                            {isEdit ? 'Lưu Thay Đổi' : 'Thêm Vào Kho'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteModal({ asset, onClose, onDeleted, showToast, theme }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteAsset(asset.id);
            showToast(`Đã xóa tài sản "${asset.assetName}".`, 'success');
            onDeleted(asset.id);
            onClose();
        } catch (err) {
            showToast(err.message || 'Lỗi khi xóa tài sản', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 text-center space-y-4 ${theme.panel}`}>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                    <Trash2 className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-black ${theme.title}`}>Xác Nhận Xóa Tài Sản?</h3>
                <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                    Tài sản <strong className="text-[#D4AF37]">"{asset.assetName}"</strong> sẽ bị xóa khỏi kho hệ thống.
                    {asset.currentRoomId && (
                        <span className="text-rose-400 block mt-2 font-bold">
                            Lưu ý: Tài sản đang được gán cho phòng. Hãy thu hồi về kho trước khi xóa!
                        </span>
                    )}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${theme.buttonOutline}`}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Xác Nhận Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── ASSIGN / REVOKE MODAL ────────────────────────────────────────────────────
function AssignRevokeModal({ asset, mode, onClose, onDone, showToast, theme }) {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(mode === 'assign');

    useEffect(() => {
        if (mode !== 'assign') return;
        const orgId = getOrgId();
        (async () => {
            try {
                const propsRes = await getProperties(orgId, null, null, 1, 100);
                const properties = propsRes.items || propsRes.data || propsRes || [];
                const roomLists = await Promise.all(
                    properties.map(async p => {
                        try {
                            const res = await getRooms({ propertyId: p.id, pageSize: 100 });
                            const items = res.items || res.data || res || [];
                            return items.map(r => ({ ...r, propertyName: p.propertyName }));
                        } catch {
                            return [];
                        }
                    })
                );
                setRooms(roomLists.flat());
            } catch (err) {
                showToast('Không tải được danh sách phòng.', 'error');
            } finally {
                setLoadingRooms(false);
            }
        })();
    }, [mode, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'assign' && !selectedRoom) return showToast('Vui lòng chọn phòng.', 'error');
        setLoading(true);
        try {
            if (mode === 'assign') {
                await assignAsset(asset.id, selectedRoom, note);
                showToast('Gán tài sản vào phòng thành công!', 'success');
            } else {
                await revokeAsset(asset.id, note);
                showToast('Đã thu hồi tài sản về kho!', 'success');
            }
            onDone();
            onClose();
        } catch (err) {
            showToast(err.message || 'Lỗi thao tác', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${theme.panel}`}>
                <div className={`p-6 border-b flex items-center justify-between ${theme.border}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className={`text-base font-black ${theme.title}`}>
                                {mode === 'assign' ? 'Bàn Giao & Gán Vào Phòng' : 'Thu Hồi Tài Sản Về Kho'}
                            </h3>
                            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                Thiết bị: <span className="font-bold text-gray-200">{asset.assetName}</span>
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className={`p-2 rounded-xl transition-all ${theme.cardIdle}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {mode === 'assign' ? (
                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                Chọn Phòng Tiếp Nhận <span className="text-rose-500">*</span>
                            </label>
                            {loadingRooms ? (
                                <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs ${theme.panelSoft}`}>
                                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" /> Đang tải danh sách phòng...
                                </div>
                            ) : (
                                <select
                                    required
                                    value={selectedRoom}
                                    onChange={e => setSelectedRoom(e.target.value)}
                                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold border transition-all ${theme.input}`}
                                >
                                    <option value="">-- Chọn phòng tiếp nhận thiết bị --</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id} className="bg-[#11111A] text-white">
                                            Phòng {r.roomNumber} {r.propertyName ? `(${r.propertyName})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ) : (
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${theme.panelSoft}`}>
                            <Home className="w-5 h-5 text-[#D4AF37]" />
                            <span className="text-xs text-gray-300">
                                Đang lắp đặt tại: <strong className="text-white">Phòng {asset.currentRoomNumber || 'N/A'}</strong>
                            </span>
                        </div>
                    )}

                    <div>
                        <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                            Ghi Chú Bàn Giao / Lý Do
                        </label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder={mode === 'assign' ? 'Ví dụ: Bàn giao phòng mới, thay thế điều hòa cũ...' : 'Ví dụ: Khách trả phòng thu hồi bảo dưỡng...'}
                            className={`w-full rounded-xl px-4 py-2.5 text-xs border resize-none ${theme.input}`}
                        />
                    </div>

                    <div className="flex gap-2.5 justify-end pt-3 border-t border-inherit/40">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${theme.buttonOutline}`}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                            {mode === 'assign' ? 'Xác Nhận Bàn Giao' : 'Xác Nhận Thu Hồi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── UPDATE STATUS MODAL ──────────────────────────────────────────────────────
function UpdateStatusModal({ asset, onClose, onDone, showToast, theme, isDarkMode }) {
    const [status, setStatus] = useState(asset.currentStatus || 'Good');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateAssetStatus(asset.id, status, note);
            showToast('Đã cập nhật tình trạng thiết bị thành công!', 'success');
            onDone();
            onClose();
        } catch (err) {
            showToast(err.message || 'Lỗi cập nhật', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${theme.panel}`}>
                <div className={`p-6 border-b flex items-center justify-between ${theme.border}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className={`text-base font-black ${theme.title}`}>
                                Cập Nhật Tình Trạng Thiết Bị
                            </h3>
                            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                {asset.assetName}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className={`p-2 rounded-xl transition-all ${theme.cardIdle}`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className={`text-xs font-bold uppercase tracking-wider block mb-2.5 ${theme.textMutedSoft}`}>
                            Chọn Tình Trạng Kỹ Thuật
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {ASSET_STATUSES.map(s => {
                                const isAct = status === s;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`p-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${
                                            isAct
                                                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md'
                                                : `${theme.panelSoft} ${theme.textMuted} hover:border-[#D4AF37]/50`
                                        }`}
                                    >
                                        <span>{STATUS_META[s]?.label || s}</span>
                                        {isAct && <Check className="w-4 h-4 stroke-[3]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                            Ghi Chú Chi Tiết Kỹ Thuật / Hư Hỏng
                        </label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Mô tả sự cố (VD: Máy lạnh kêu to, remote liệt phím, vòi nước rỉ...)"
                            className={`w-full rounded-xl px-4 py-2.5 text-xs border resize-none ${theme.input}`}
                        />
                    </div>

                    <div className="flex gap-2.5 justify-end pt-3 border-t border-inherit/40">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${theme.buttonOutline}`}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                            Lưu Tình Trạng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── ASSET HISTORY MODAL ──────────────────────────────────────────────────────
function AssetHistoryModal({ asset, onClose, theme }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAssetHistory(asset.id)
            .then(data => setHistory(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [asset.id]);

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto ${theme.panel}`}>
                <div className={`p-6 border-b flex items-center justify-between ${theme.border}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className={`text-base font-black ${theme.title}`}>
                                Lịch Sử Luân Chuyển & Sử Dụng
                            </h3>
                            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                Thiết bị: <span className="font-bold text-gray-200">{asset.assetName}</span>
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className={`p-2 rounded-xl transition-all ${theme.cardIdle}`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                            <span className={`text-xs ${theme.textMuted}`}>Đang tải dòng thời gian...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className={`p-10 text-center rounded-2xl border border-dashed ${theme.panelSoft}`}>
                            <Info className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 opacity-50" />
                            <p className={`text-xs ${theme.textMuted}`}>Thiết bị chưa có lịch sử luân chuyển nào.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/10">
                            {history.map((h, i) => (
                                <div key={h.id || i} className="flex items-start gap-4 relative">
                                    <div className="w-7 h-7 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center shrink-0 shadow mt-0.5 font-bold z-10">
                                        {h.roomNumber ? <Home className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className={`flex-1 p-4 rounded-2xl border ${theme.panelSoft} space-y-1.5`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-white">
                                                {h.roomNumber ? `Phòng ${h.roomNumber}` : 'Nhập kho lưu trữ'}
                                            </span>
                                            <span className="text-[10px] font-mono text-[#D4AF37]">
                                                {STATUS_META[h.status]?.label || h.status}
                                            </span>
                                        </div>
                                        {h.note && (
                                            <p className={`text-xs ${theme.textMuted} italic`}>
                                                "{h.note}"
                                            </p>
                                        )}
                                        <div className={`text-[10px] ${theme.textMutedSoft} flex items-center gap-2 pt-1`}>
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(h.assignedAt)}</span>
                                            <span>• {relativeTime(h.assignedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`p-5 border-t flex justify-end ${theme.border} ${theme.panelSoft}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${theme.buttonOutline}`}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── ASSET CARD COMPONENT (LUXURY GRID) ───────────────────────
function AssetCard({ asset, onEdit, onDelete, onAssign, onRevoke, onStatus, onHistory, theme, isDarkMode }) {
    const isAssigned = !!asset.currentRoomId;

    return (
        <div className={`${theme.panel} rounded-2xl border hover:border-[#D4AF37]/60 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#D4AF37]/5 flex flex-col justify-between group relative`}>
            
            {/* Card Header */}
            <div className={`p-5 border-b ${theme.border}/50`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                            <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            {asset.assetCode && (
                                <span className={`text-[10px] font-mono text-[#D4AF37] block tracking-wider uppercase font-bold`}>
                                    #{asset.assetCode}
                                </span>
                            )}
                            <h4 className={`text-base font-black tracking-tight ${theme.title} group-hover:text-[#D4AF37] transition-colors truncate mt-0.5`}>
                                {asset.assetName}
                            </h4>
                            {asset.category && (
                                <span className={`text-[10px] font-bold ${theme.textMutedSoft} flex items-center gap-1 mt-0.5`}>
                                    <Tag className="w-3 h-3 text-[#D4AF37]" /> {asset.category}
                                </span>
                            )}
                        </div>
                    </div>

                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shrink-0 ${getStatusBadgeStyle(asset.currentStatus, isDarkMode)}`}>
                        {STATUS_META[asset.currentStatus]?.label || asset.currentStatus}
                    </span>
                </div>
            </div>

            {/* Card Body */}
            <div className={`p-5 space-y-3 flex-1 ${theme.panelSoft} text-xs`}>
                {asset.brand && (
                    <div className="flex justify-between items-center">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft}`}>
                            Hãng / Model
                        </span>
                        <span className="font-bold text-gray-200">
                            {asset.brand}{asset.model ? ` · ${asset.model}` : ''}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft}`}>
                        Giá trị tài sản
                    </span>
                    <span className="font-mono font-black text-[#D4AF37]">
                        {formatCurrency(asset.baseValue)}
                    </span>
                </div>

                {asset.warrantyExpiryDate && (
                    <div className="flex justify-between items-center">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft}`}>
                            Hạn bảo hành
                        </span>
                        <span className="font-mono font-bold text-gray-300">
                            {formatDate(asset.warrantyExpiryDate)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-inherit/30">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} flex items-center gap-1`}>
                        <Home className="w-3.5 h-3.5 text-[#D4AF37]" /> Vị trí hiện tại
                    </span>
                    <span className={`text-xs font-black ${isAssigned ? 'text-[#D4AF37]' : theme.textMuted}`}>
                        {isAssigned ? `Phòng ${asset.currentRoomNumber || asset.currentRoomId?.slice(0, 8)}` : 'Trong kho lưu trữ'}
                    </span>
                </div>

                {asset.currentNote && (
                    <div className="pt-2 border-t border-inherit/20 text-[11px] text-gray-400 italic flex items-start gap-1.5 line-clamp-2">
                        <Info className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span>"{asset.currentNote}"</span>
                    </div>
                )}
            </div>

            {/* Card Actions Footer */}
            <div className={`p-3.5 border-t ${theme.border}/40 bg-black/10 flex items-center justify-between gap-1.5`}>
                <button
                    type="button"
                    onClick={() => onHistory(asset)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${theme.buttonOutline}`}
                    title="Xem lịch sử thiết bị"
                >
                    <History className="w-3.5 h-3.5" /> Lịch sử
                </button>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onStatus(asset)}
                        className={`p-1.5 rounded-xl border transition-all ${theme.buttonOutline}`}
                        title="Cập nhật tình trạng"
                    >
                        <Wrench className="w-3.5 h-3.5" />
                    </button>

                    {isAssigned ? (
                        <button
                            type="button"
                            onClick={() => onRevoke(asset)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/30 transition-all flex items-center gap-1"
                            title="Thu hồi về kho"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Thu hồi
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onAssign(asset)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all flex items-center gap-1"
                            title="Bàn giao vào phòng"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Gán phòng
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onEdit(asset)}
                        className={`p-1.5 rounded-xl border transition-all ${theme.buttonOutline}`}
                        title="Chỉnh sửa thông tin"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(asset)}
                        className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/15 border border-rose-500/30 transition-all"
                        title="Xóa tài sản"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AssetManagementSubPage({ isDarkMode = true }) {
    const organizationId = getOrgId();
    const businessName = useMemo(() => getBusinessName(), []);

    const theme = isDarkMode ? {
        bg: 'bg-[#0B0B12] text-slate-100 selection:bg-[#D4AF37] selection:text-black',
        panel: 'bg-[#11111A] border-[#2A2518]',
        panelSoft: 'bg-[#161622] border-[#2A2518]/50',
        input: 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37] placeholder-gray-500',
        textMuted: 'text-gray-400',
        textMutedSoft: 'text-gray-500',
        title: 'text-white',
        border: 'border-[#2A2518]',
        divide: 'divide-[#2A2518]/50',
        cardActive: 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/15',
        cardIdle: 'text-gray-400 hover:text-white hover:bg-white/5',
        tableHead: 'bg-[#0F0F17]/70 border-[#2A2518]/50 text-gray-400',
        rowHover: 'hover:bg-white/[0.02]',
        goldText: 'text-[#D4AF37]',
        goldBg: 'bg-[#D4AF37]',
        modalBg: 'bg-[#11111A] border-[#2A2518] text-white',
        modalInput: 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37] placeholder-gray-500',
        statusOk: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
        statusPending: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
        buttonOutline: 'bg-[#161622] border-[#2A2518] text-gray-300 hover:text-white hover:border-[#D4AF37]/50'
    } : {
        bg: 'bg-[#FAF8F5] text-slate-900 selection:bg-[#D4AF37] selection:text-black',
        panel: 'bg-white border-[#E5D4AD] shadow-sm',
        panelSoft: 'bg-[#FFF9EC] border-[#E5D4AD]/70',
        input: 'bg-white border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
        textMuted: 'text-slate-500',
        textMutedSoft: 'text-slate-400',
        title: 'text-slate-950',
        border: 'border-[#E5D4AD]',
        divide: 'divide-[#E5D4AD]/70',
        cardActive: 'bg-gradient-to-r from-[#FFF1C7] to-white text-[#8A6212] border border-[#D4AF37]/40 shadow-sm font-bold',
        cardIdle: 'text-slate-600 hover:text-slate-950 hover:bg-amber-50',
        tableHead: 'bg-[#FAF8F5] border-[#E5D4AD]/70 text-slate-500',
        rowHover: 'hover:bg-amber-50/50',
        goldText: 'text-[#AA7C11]',
        goldBg: 'bg-[#AA7C11]',
        modalBg: 'bg-white border-[#E5D4AD] text-slate-900',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
        statusOk: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        statusPending: 'bg-amber-50 text-amber-700 border border-amber-200',
        buttonOutline: 'bg-white border-[#E5D4AD] text-slate-700 hover:bg-amber-50'
    };

    const [assets, setAssets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'storage' | 'assigned' | 'issue'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [toast, setToast] = useState(null);

    // Modal states
    const [formModal, setFormModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [statusModal, setStatusModal] = useState(null);
    const [historyModal, setHistoryModal] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const loadAssets = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const [data, statsData] = await Promise.all([
                getAssets({ organizationId, search: search.trim(), category: filterCategory, status: filterStatus }),
                getAssetStatistics(organizationId).catch(() => null),
            ]);
            setAssets(Array.isArray(data) ? data : []);
            setStats(statsData);
        } catch (err) {
            showToast(err.message || 'Lỗi tải danh sách tài sản', 'error');
        } finally {
            setLoading(false);
        }
    }, [organizationId, search, filterCategory, filterStatus, showToast]);

    useEffect(() => {
        const timer = setTimeout(() => loadAssets(), 300);
        return () => clearTimeout(timer);
    }, [loadAssets]);

    const handleSaved = useCallback(() => { loadAssets(); }, [loadAssets]);
    const handleDeleted = useCallback(() => { loadAssets(); }, [loadAssets]);
    const handleDone = useCallback(() => { loadAssets(); }, [loadAssets]);

    // Backend stats use: totalAssets, inUse, inStorage, damaged, inMaintenance
    const totalCount = stats?.totalAssets ?? stats?.total ?? assets.length;
    const goodCount = stats?.inUse ?? ((stats?.good || 0) + (stats?.working || 0));
    const readyRate = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 100;
    const assignedCount = stats?.inUse ?? stats?.assigned ?? assets.filter(a => !!a.currentRoomId).length;
    const storageCount = stats?.inStorage ?? assets.filter(a => !a.currentRoomId).length;
    const issueCount = (stats?.damaged || 0) + (stats?.inMaintenance || stats?.maintenance || 0) + (stats?.broken || 0);

    // Filter assets client-side by location/condition tab
    const filteredAssets = useMemo(() => {
        return assets.filter(a => {
            if (activeTabFilter === 'storage' && a.currentRoomId) return false;
            if (activeTabFilter === 'assigned' && !a.currentRoomId) return false;
            if (activeTabFilter === 'issue' && !['Damaged', 'Maintenance', 'Broken'].includes(a.currentStatus)) return false;
            return true;
        });
    }, [assets, activeTabFilter]);

    return (
        <div className={`w-full min-h-full transition-colors duration-300 ${theme.bg} font-sans p-6 lg:p-8 space-y-6 relative`}>

            {/* ── 1. HEADER SECTION ── */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${theme.border} pb-5`}>
                <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> HỆ THỐNG TRANG THIẾT BỊ & TÀI SẢN
                    </span>
                    <h2 className={`text-2xl font-black tracking-tight ${theme.title} mt-0.5`}>
                        Quản Lý Danh Mục Tài Sản
                    </h2>
                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                        Kiểm kê trang thiết bị, phân bổ phòng lưu trú, theo dõi hạn bảo hành và luân chuyển tài sản.
                    </p>
                </div>

                <div className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-2xl border ${theme.panelSoft}`}>
                    <Building className="w-4 h-4 text-[#D4AF37]" />
                    <span className={theme.textMuted}>Cơ sở vận hành:</span>
                    <span className="text-[#D4AF37] font-black">{businessName}</span>
                </div>
            </div>

            {/* ── 2. METRIC / KPI CARDS (INTERACTIVE) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {/* Metric 1: Tổng tài sản */}
                <div
                    onClick={() => { setActiveTabFilter('all'); setFilterStatus(''); setFilterCategory(''); }}
                    className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37] hover:scale-[1.01] cursor-pointer shadow-sm flex flex-col justify-between h-36 ${
                        activeTabFilter === 'all' && !filterStatus ? 'ring-2 ring-[#D4AF37]/50 border-[#D4AF37]' : ''
                    }`}
                    title="Bấm để xem tất cả tài sản"
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Tổng Tài Sản Khai Báo
                        </span>
                        <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black tracking-tight ${theme.title}`}>
                                {totalCount}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>thiết bị trong kho & phòng</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] w-full" />
                        </div>
                    </div>
                </div>

                {/* Metric 2: Đang dùng tốt */}
                <div
                    onClick={() => { setActiveTabFilter('all'); setFilterStatus('Good'); }}
                    className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-emerald-500 hover:scale-[1.01] cursor-pointer shadow-sm flex flex-col justify-between h-36 ${
                        filterStatus === 'Good' ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''
                    }`}
                    title="Bấm để lọc thiết bị tình trạng Tốt"
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Đang Hoạt Động Tốt
                        </span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-black tracking-tight text-emerald-400">
                                {goodCount}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                Tốt {readyRate}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${Math.min(100, readyRate)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Metric 3: Đã gán phòng & Trong kho */}
                <div
                    onClick={() => setActiveTabFilter(activeTabFilter === 'assigned' ? 'storage' : 'assigned')}
                    className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-sky-500 hover:scale-[1.01] cursor-pointer shadow-sm flex flex-col justify-between h-36 ${
                        activeTabFilter === 'assigned' || activeTabFilter === 'storage' ? 'ring-2 ring-sky-500/50 border-sky-500' : ''
                    }`}
                    title="Bấm để xem thiết bị đã bàn giao hoặc trong kho"
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Đã Bàn Giao Phòng
                        </span>
                        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                            <Home className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tight text-sky-400">
                                {assignedCount}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>phòng đang sử dụng</span>
                        </div>
                        <p className={`text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1`}>
                            <Box className="w-3 h-3 text-[#D4AF37]" /> Trong kho sẵn sàng: {storageCount}
                        </p>
                    </div>
                </div>

                {/* Metric 4: Hư hỏng & Bảo trì */}
                <div
                    onClick={() => setActiveTabFilter('issue')}
                    className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-rose-500 hover:scale-[1.01] cursor-pointer shadow-sm flex flex-col justify-between h-36 ${
                        activeTabFilter === 'issue' ? 'ring-2 ring-rose-500/50 border-rose-500' : ''
                    }`}
                    title="Bấm để xem các thiết bị đang bị hỏng hoặc bảo trì"
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Hư Hỏng & Sửa Chữa
                        </span>
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                            <Wrench className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black tracking-tight ${issueCount > 0 ? 'text-rose-400' : theme.title}`}>
                                {issueCount}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>thiết bị cần xử lý</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                            <span className="text-orange-400">Hỏng: {stats?.damaged || 0}</span>
                            <span>•</span>
                            <span className="text-rose-400">Bảo trì: {stats?.inMaintenance || stats?.maintenance || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 3. ACTION & FILTER BAR ── */}
            <div className={`p-4 rounded-2xl border ${theme.panelSoft} space-y-3`}>
                
                {/* 3.1 Quick Status & Location Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-inherit/20 pb-3">
                    {[
                        { id: 'all', label: 'Tất Cả', count: totalCount },
                        { id: 'storage', label: 'Trong Kho Sẵn Sàng', count: storageCount },
                        { id: 'assigned', label: 'Đang Lắp Tại Phòng', count: assignedCount },
                        { id: 'issue', label: 'Hư Hỏng & Bảo Trì', count: issueCount, isAlert: issueCount > 0 },
                    ].map(({ id, label, count, isAlert }) => {
                        const isAct = activeTabFilter === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActiveTabFilter(id)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                                    isAct ? theme.cardActive : theme.cardIdle
                                }`}
                            >
                                <span>{label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                    isAct
                                        ? 'bg-black/20 text-black'
                                        : isAlert
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                                        : 'bg-white/10 text-gray-300'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 3.2 Search, Filters & Action Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
                    {/* Search & View Toggle */}
                    <div className="flex items-center gap-2.5 flex-1 max-w-md">
                        <div className={`flex items-center border rounded-xl px-3.5 py-2 w-full ${theme.input}`}>
                            <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm kiếm theo tên thiết bị, mã code..."
                                className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:inherit min-w-0"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="text-gray-400 hover:text-white text-xs ml-1"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className={`flex items-center p-1 rounded-xl border shrink-0 ${theme.border} ${theme.panel}`}>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-[#D4AF37] text-black font-bold shadow'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                                title="Xem dạng thẻ lưới"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-lg transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-[#D4AF37] text-black font-bold shadow'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                                title="Xem dạng bảng"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Dropdown Filters & Actions */}
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className={`rounded-xl px-3 py-2 text-xs font-bold border transition-all appearance-none pr-8 cursor-pointer ${theme.input}`}
                            >
                                <option value="">Tất cả danh mục</option>
                                {CATEGORY_OPTIONS.map(c => (
                                    <option key={c} value={c} className="bg-[#11111A] text-white">{c}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-gray-400" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className={`rounded-xl px-3 py-2 text-xs font-bold border transition-all appearance-none pr-8 cursor-pointer ${theme.input}`}
                            >
                                <option value="">Tất cả tình trạng</option>
                                {ASSET_STATUSES.map(s => (
                                    <option key={s} value={s} className="bg-[#11111A] text-white">{STATUS_META[s].label}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-gray-400" />
                        </div>

                        {/* Refresh */}
                        <button
                            type="button"
                            onClick={loadAssets}
                            disabled={loading}
                            className={`p-2 rounded-xl border transition-all ${theme.buttonOutline}`}
                            title="Tải lại danh sách"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                        </button>

                        {/* Create Button */}
                        <button
                            type="button"
                            onClick={() => setFormModal({ asset: null })}
                            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-[#D4AF37]/20 transition-all flex items-center gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" /> Khai Báo Tài Sản
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 4. CONTENT LIST / TABLE / GRID ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`${theme.panel} rounded-2xl p-5 border shadow-sm animate-pulse space-y-4`}>
                            <div className="h-5 bg-white/10 rounded w-1/2" />
                            <div className="h-4 bg-white/5 rounded w-3/4" />
                            <div className="h-4 bg-white/5 rounded w-2/3" />
                            <div className="h-8 bg-white/10 rounded-xl mt-4" />
                        </div>
                    ))}
                </div>
            ) : assets.length === 0 ? (
                <div className={`p-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 ${theme.panelSoft}`}>
                    <Package className="w-10 h-10 text-gray-500 stroke-[1.5]" />
                    <h3 className={`text-sm font-bold ${theme.title}`}>Chưa có tài sản hoặc thiết bị nào</h3>
                    <p className={`text-xs ${theme.textMuted}`}>Bấm "Khai Báo Tài Sản" để nhập tài sản đầu tiên vào kho lưu trữ.</p>
                    <button
                        type="button"
                        onClick={() => setFormModal({ asset: null })}
                        className="mt-2 px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-xl shadow-md uppercase tracking-wider"
                    >
                        Khai Báo Ngay
                    </button>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className={`p-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 ${theme.panelSoft}`}>
                    <Package className="w-10 h-10 text-gray-500 stroke-[1.5]" />
                    <h3 className={`text-sm font-bold ${theme.title}`}>Không tìm thấy tài sản nào theo bộ lọc</h3>
                    <p className={`text-xs ${theme.textMuted}`}>Thử thay đổi tab hoặc từ khóa tìm kiếm.</p>
                    <button
                        type="button"
                        onClick={() => { setActiveTabFilter('all'); setSearch(''); setFilterCategory(''); setFilterStatus(''); }}
                        className="mt-2 px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-xl shadow-md uppercase tracking-wider"
                    >
                        Đặt Lại Bộ Lọc
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── GRID VIEW ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                    {filteredAssets.map(asset => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            onEdit={a => setFormModal({ asset: a })}
                            onDelete={a => setDeleteModal(a)}
                            onAssign={a => setAssignModal({ asset: a, mode: 'assign' })}
                            onRevoke={a => setAssignModal({ asset: a, mode: 'revoke' })}
                            onStatus={a => setStatusModal(a)}
                            onHistory={a => setHistoryModal(a)}
                            theme={theme}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </div>
            ) : (
                /* ── TABLE VIEW ── */
                <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme.panel}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className={`border-b ${theme.tableHead}`}>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Mã & Tên Tài Sản</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Danh Mục & Hãng</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Giá Trị</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Hạn Bảo Hành</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Vị Trí Hiện Tại</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Tình Trạng</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme.divide}`}>
                                {filteredAssets.map(asset => {
                                    const isAssigned = !!asset.currentRoomId;

                                    return (
                                        <tr key={asset.id} className={`transition-colors ${theme.rowHover}`}>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-black text-sm ${theme.title} hover:text-[#D4AF37]`}>
                                                            {asset.assetName}
                                                        </h4>
                                                        {asset.assetCode && (
                                                            <span className="text-[10px] font-mono text-[#D4AF37] font-bold block">
                                                                #{asset.assetCode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className="font-bold text-gray-200 block">
                                                        {asset.category || 'Chưa phân loại'}
                                                    </span>
                                                    <span className={`text-[11px] ${theme.textMutedSoft}`}>
                                                        {asset.brand ? `${asset.brand} ${asset.model || ''}` : '—'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-black text-[#D4AF37]">
                                                {formatCurrency(asset.baseValue)}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-gray-300">
                                                {formatDate(asset.warrantyExpiryDate)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className={`inline-flex items-center gap-1.5 font-bold ${
                                                        isAssigned ? 'text-[#D4AF37]' : theme.textMuted
                                                    }`}>
                                                        <Home className="w-3.5 h-3.5" />
                                                        {isAssigned ? `Phòng ${asset.currentRoomNumber || 'N/A'}` : 'Trong kho'}
                                                    </span>
                                                    {asset.currentNote && (
                                                        <span className="block text-[10px] text-gray-400 italic truncate max-w-[140px]" title={asset.currentNote}>
                                                            "{asset.currentNote}"
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${getStatusBadgeStyle(asset.currentStatus, isDarkMode)}`}>
                                                    {STATUS_META[asset.currentStatus]?.label || asset.currentStatus}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setHistoryModal(asset)}
                                                        className={`p-1.5 rounded-xl border transition-all ${theme.buttonOutline}`}
                                                        title="Xem lịch sử"
                                                    >
                                                        <History className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStatusModal(asset)}
                                                        className={`p-1.5 rounded-xl border transition-all ${theme.buttonOutline}`}
                                                        title="Cập nhật tình trạng"
                                                    >
                                                        <Wrench className="w-3.5 h-3.5" />
                                                    </button>
                                                    {isAssigned ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssignModal({ asset, mode: 'revoke' })}
                                                            className="p-1.5 rounded-xl bg-amber-500/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                                                            title="Thu hồi về kho"
                                                        >
                                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssignModal({ asset, mode: 'assign' })}
                                                            className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                                            title="Gán phòng"
                                                        >
                                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormModal({ asset })}
                                                        className={`p-1.5 rounded-xl border transition-all ${theme.buttonOutline}`}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModal(asset)}
                                                        className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/15 border border-rose-500/30 transition-all"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 5. MODALS ── */}
            {formModal !== null && (
                <AssetFormModal
                    asset={formModal.asset}
                    organizationId={organizationId}
                    onClose={() => setFormModal(null)}
                    onSaved={handleSaved}
                    showToast={showToast}
                    theme={theme}
                />
            )}

            {deleteModal && (
                <DeleteModal
                    asset={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onDeleted={handleDeleted}
                    showToast={showToast}
                    theme={theme}
                />
            )}

            {assignModal && (
                <AssignRevokeModal
                    asset={assignModal.asset}
                    mode={assignModal.mode}
                    onClose={() => setAssignModal(null)}
                    onDone={handleDone}
                    showToast={showToast}
                    theme={theme}
                />
            )}

            {statusModal && (
                <UpdateStatusModal
                    asset={statusModal}
                    onClose={() => setStatusModal(null)}
                    onDone={handleDone}
                    showToast={showToast}
                    theme={theme}
                    isDarkMode={isDarkMode}
                />
            )}

            {historyModal && (
                <AssetHistoryModal
                    asset={historyModal}
                    onClose={() => setHistoryModal(null)}
                    theme={theme}
                />
            )}

            {/* ── 6. FLOATING TOAST NOTIFICATION ── */}
            {toast && (
                <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm ${
                        toast.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                    }`}>
                        <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                            <span className="text-xs font-bold block">{toast.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}