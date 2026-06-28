import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Package, Edit2, Trash2, X, Check, AlertTriangle,
    Sparkles, History, ArrowRightLeft, Wrench, Tag, Calendar,
    DollarSign, Hash, Building2, ChevronDown, RefreshCw, Info,
    AlertCircle, CheckCircle2, Home, Clock
} from 'lucide-react';
import {
    getAssets, getAssetStatistics, createAsset, updateAsset, deleteAsset,
    assignAsset, revokeAsset, updateAssetStatus, getAssetHistory
} from '../api/assetApi';
import { getProperties } from '../api/propertyApi';
import { getRooms } from '../api/roomApi';
import './AssetManagement.css';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ASSET_STATUSES = ['Good', 'Working', 'Damaged', 'Maintenance', 'Broken'];

const STATUS_META = {
    Good:        { label: 'Tốt',          cls: 'am-status-good' },
    Working:     { label: 'Đang dùng',    cls: 'am-status-working' },
    Damaged:     { label: 'Hư hỏng',      cls: 'am-status-damaged' },
    Maintenance: { label: 'Bảo trì',      cls: 'am-status-maintenance' },
    Broken:      { label: 'Hỏng nặng',    cls: 'am-status-broken' },
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

function formatCurrency(v) {
    if (!v) return '—';
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

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    const icons = {
        success: <CheckCircle2 size={14} />,
        error:   <AlertTriangle size={14} />,
        info:    <Sparkles size={14} />,
    };
    return (
        <div className={`am-toast am-toast-${type}`}>
            {icons[type]}
            <span>{message}</span>
            <button onClick={onClose} className="am-toast-close"><X size={12} /></button>
        </div>
    );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, size = '' }) {
    return (
        <div className="am-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`am-modal ${size === 'lg' ? 'am-modal-lg' : size === 'xl' ? 'am-modal-xl' : ''}`}>
                <div className="am-modal-header">
                    <div>
                        <span className="am-modal-title">{title}</span>
                        {subtitle && <p className="am-modal-subtitle">{subtitle}</p>}
                    </div>
                    <button className="am-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }) {
    return (
        <div className={`am-stat-card am-stat-${accent}`}>
            <div className="am-stat-icon"><Icon size={16} /></div>
            <div>
                <div className="am-stat-value">{value ?? '—'}</div>
                <div className="am-stat-label">{label}</div>
            </div>
        </div>
    );
}

// ─── CREATE / EDIT ASSET MODAL ────────────────────────────────────────────────
function AssetFormModal({ asset, organizationId, onClose, onSaved, showToast }) {
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
                showToast('Thêm tài sản thành công!', 'success');
            }
            onSaved(saved);
            onClose();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isEdit ? 'Chỉnh sửa tài sản' : 'Thêm tài sản mới'}
            subtitle={isEdit ? `Mã: ${asset?.assetCode || asset?.id?.slice(0, 8)}` : 'Khai báo tài sản nhập kho'}
            onClose={onClose}
            size="lg"
        >
            <form onSubmit={handleSubmit}>
                <div className="am-modal-body">
                    <div className="am-form-grid">
                        {/* Tên tài sản */}
                        <div className="am-field am-col-2">
                            <label className="am-label">Tên tài sản / Thiết bị *</label>
                            <input
                                className="am-input" required
                                placeholder="VD: Điều hòa Daikin Inverter 1 HP"
                                value={form.assetName}
                                onChange={e => set('assetName', e.target.value)}
                            />
                        </div>

                        {/* Danh mục + Mã tài sản */}
                        <div className="am-field">
                            <label className="am-label">Danh mục</label>
                            <select className="am-select" value={form.category} onChange={e => set('category', e.target.value)}>
                                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="am-field">
                            <label className="am-label">Mã tài sản</label>
                            <input className="am-input" placeholder="VD: TS-DH-001" value={form.assetCode} onChange={e => set('assetCode', e.target.value)} />
                        </div>

                        {/* Hãng + Model */}
                        <div className="am-field">
                            <label className="am-label">Hãng sản xuất</label>
                            <input className="am-input" placeholder="VD: Daikin, Samsung..." value={form.brand} onChange={e => set('brand', e.target.value)} />
                        </div>
                        <div className="am-field">
                            <label className="am-label">Model</label>
                            <input className="am-input" placeholder="VD: DK-12000" value={form.model} onChange={e => set('model', e.target.value)} />
                        </div>

                        {/* Ngày mua + Bảo hành */}
                        <div className="am-field">
                            <label className="am-label">Ngày mua</label>
                            <input className="am-input" type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
                        </div>
                        <div className="am-field">
                            <label className="am-label">Hạn bảo hành</label>
                            <input className="am-input" type="date" value={form.warrantyExpiryDate} onChange={e => set('warrantyExpiryDate', e.target.value)} />
                        </div>

                        {/* Giá trị */}
                        <div className="am-field am-col-2">
                            <label className="am-label">Giá trị (VNĐ)</label>
                            <input className="am-input" type="number" min="0" placeholder="VD: 9500000" value={form.baseValue} onChange={e => set('baseValue', e.target.value)} />
                        </div>

                        {/* Ghi chú nhập kho - chỉ hiện khi tạo mới */}
                        {!isEdit && (
                            <div className="am-field am-col-2">
                                <label className="am-label">Ghi chú nhập kho</label>
                                <textarea
                                    className="am-input am-textarea" rows={2}
                                    placeholder="Ghi chú khi nhập tài sản vào kho..."
                                    value={form.initialNote}
                                    onChange={e => set('initialNote', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="am-modal-footer">
                    <button type="button" className="am-btn am-btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" className="am-btn am-btn-primary" disabled={loading}>
                        {loading ? <RefreshCw size={13} className="am-spin" /> : <Check size={13} />}
                        {isEdit ? 'Lưu thay đổi' : 'Thêm vào kho'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteModal({ asset, onClose, onDeleted, showToast }) {
    const [loading, setLoading] = useState(false);
    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteAsset(asset.id);
            showToast(`Đã xóa tài sản "${asset.assetName}".`, 'success');
            onDeleted(asset.id);
            onClose();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal title="Xác nhận xóa tài sản" onClose={onClose}>
            <div className="am-modal-body" style={{ textAlign: 'center' }}>
                <div className="am-confirm-icon"><Trash2 size={22} /></div>
                <p className="am-confirm-title">Xóa tài sản này?</p>
                <p className="am-confirm-desc">
                    Tài sản <strong style={{ color: '#C5A880' }}>"{asset.assetName}"</strong> sẽ bị xóa (ẩn khỏi hệ thống).
                    Thao tác này không thể hoàn tác.<br />
                    <span style={{ color: '#E05252' }}>Lưu ý: Không thể xóa tài sản đang gán cho phòng.</span>
                </p>
            </div>
            <div className="am-modal-footer">
                <button className="am-btn am-btn-cancel" onClick={onClose}>Hủy</button>
                <button className="am-btn am-btn-danger" disabled={loading} onClick={handleDelete}>
                    {loading ? <RefreshCw size={13} className="am-spin" /> : <Trash2 size={13} />}
                    Xóa tài sản
                </button>
            </div>
        </Modal>
    );
}

// ─── ASSIGN / REVOKE MODAL ────────────────────────────────────────────────────
function AssignRevokeModal({ asset, mode, onClose, onDone, showToast }) {
    // mode: 'assign' | 'revoke'
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
                // Lấy danh sách properties của organization
                const propsData = await getProperties(orgId);
                const props = propsData?.items || propsData || [];
                // Lấy rooms từ tất cả properties
                const roomLists = await Promise.all(
                    props.map(async p => {
                        const rData = await getRooms({ propertyId: p.id }).catch(() => []);
                        return rData?.items || rData || [];
                    })
                );
                setRooms(roomLists.flat());
            } catch (err) {
                showToast('Không tải được danh sách phòng.', 'error');
            } finally {
                setLoadingRooms(false);
            }
        })();
    }, [mode]);

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
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={mode === 'assign' ? 'Gán tài sản vào phòng' : 'Thu hồi tài sản về kho'}
            subtitle={asset.assetName}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <div className="am-modal-body">
                    <div className="am-asset-info-row">
                        <Package size={14} />
                        <span>{asset.category && <span className="am-gold">[{asset.category}]</span>} {asset.assetName}</span>
                        {asset.currentStatus && (
                            <span className={`am-badge ${STATUS_META[asset.currentStatus]?.cls || ''}`}>
                                {STATUS_META[asset.currentStatus]?.label || asset.currentStatus}
                            </span>
                        )}
                    </div>

                    {mode === 'assign' && (
                        <div className="am-field" style={{ marginBottom: '1rem' }}>
                            <label className="am-label">Chọn phòng *</label>
                            {loadingRooms ? (
                                <div className="am-loading-text"><RefreshCw size={12} className="am-spin" /> Đang tải danh sách phòng...</div>
                            ) : (
                                <select className="am-select" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} required>
                                    <option value="">-- Chọn phòng --</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            Phòng {r.roomNumber} {r.propertyName ? `— ${r.propertyName}` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {mode === 'revoke' && asset.currentRoomNumber && (
                        <div className="am-info-box" style={{ marginBottom: '1rem' }}>
                            <Home size={13} />
                            <span>Đang ở phòng: <strong>{asset.currentRoomNumber}</strong></span>
                        </div>
                    )}

                    <div className="am-field">
                        <label className="am-label">Ghi chú</label>
                        <textarea
                            className="am-input am-textarea" rows={2}
                            placeholder={mode === 'assign' ? 'VD: Bàn giao thiết bị cho khách thuê mới...' : 'VD: Thu hồi do khách trả phòng...'}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>
                </div>
                <div className="am-modal-footer">
                    <button type="button" className="am-btn am-btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" className="am-btn am-btn-primary" disabled={loading}>
                        {loading ? <RefreshCw size={13} className="am-spin" /> : <ArrowRightLeft size={13} />}
                        {mode === 'assign' ? 'Xác nhận gán' : 'Xác nhận thu hồi'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── UPDATE STATUS MODAL ──────────────────────────────────────────────────────
function UpdateStatusModal({ asset, onClose, onDone, showToast }) {
    const [status, setStatus] = useState(asset.currentStatus || 'Good');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateAssetStatus(asset.id, status, note);
            showToast('Đã cập nhật tình trạng tài sản!', 'success');
            onDone();
            onClose();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Cập nhật tình trạng tài sản" subtitle={asset.assetName} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="am-modal-body">
                    <div className="am-field" style={{ marginBottom: '1rem' }}>
                        <label className="am-label">Tình trạng hiện tại</label>
                        <div className="am-status-picker">
                            {ASSET_STATUSES.map(s => (
                                <button
                                    key={s} type="button"
                                    className={`am-status-option ${status === s ? 'am-status-option-active' : ''} ${STATUS_META[s]?.cls || ''}`}
                                    onClick={() => setStatus(s)}
                                >
                                    {STATUS_META[s]?.label || s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="am-field">
                        <label className="am-label">Ghi chú / Chi tiết hư hỏng</label>
                        <textarea
                            className="am-input am-textarea" rows={3}
                            placeholder="VD: Remote hỏng nút nguồn, dàn nóng kêu to..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>
                </div>
                <div className="am-modal-footer">
                    <button type="button" className="am-btn am-btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" className="am-btn am-btn-primary" disabled={loading}>
                        {loading ? <RefreshCw size={13} className="am-spin" /> : <Check size={13} />}
                        Lưu tình trạng
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── ASSET HISTORY MODAL ──────────────────────────────────────────────────────
function AssetHistoryModal({ asset, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAssetHistory(asset.id)
            .then(setHistory)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [asset.id]);

    const getHistoryIcon = (h) => {
        if (!h.roomId) return <Package size={12} />;
        return <Home size={12} />;
    };

    return (
        <Modal title="Lịch sử tài sản" subtitle={asset.assetName} onClose={onClose} size="lg">
            <div className="am-modal-body">
                {loading ? (
                    <div className="am-loading-text"><RefreshCw size={14} className="am-spin" /> Đang tải lịch sử...</div>
                ) : history.length === 0 ? (
                    <div className="am-empty-mini"><Info size={20} /><span>Chưa có lịch sử ghi nhận</span></div>
                ) : (
                    <div className="am-timeline">
                        {history.map((h, i) => (
                            <div key={h.id || i} className="am-timeline-item">
                                <div className={`am-timeline-dot ${STATUS_META[h.status]?.cls || ''}`}>
                                    {getHistoryIcon(h)}
                                </div>
                                <div className="am-timeline-content">
                                    <div className="am-timeline-header">
                                        <span className={`am-badge ${STATUS_META[h.status]?.cls || ''}`}>
                                            {STATUS_META[h.status]?.label || h.status}
                                        </span>
                                        {h.roomNumber && (
                                            <span className="am-timeline-room">
                                                <Home size={10} /> Phòng {h.roomNumber}
                                            </span>
                                        )}
                                        {!h.roomId && <span className="am-timeline-room">📦 Trong kho</span>}
                                    </div>
                                    {h.note && <p className="am-timeline-note">"{h.note}"</p>}
                                    <div className="am-timeline-time">
                                        <Clock size={10} /> {formatDate(h.assignedAt)} · {relativeTime(h.assignedAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="am-modal-footer">
                <button className="am-btn am-btn-cancel" onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    );
}

// ─── ASSET CARD ───────────────────────────────────────────────────────────────
function AssetCard({ asset, onEdit, onDelete, onAssign, onRevoke, onStatus, onHistory }) {
    const statusMeta = STATUS_META[asset.currentStatus] || { label: asset.currentStatus, cls: '' };
    const isAssigned = !!asset.currentRoomId;

    return (
        <div className="am-card">
            {/* Header */}
            <div className="am-card-header">
                <div className="am-card-icon-wrap">
                    <Package size={16} />
                </div>
                <div className="am-card-title-wrap">
                    {asset.assetCode && <span className="am-card-code"><Hash size={9} />{asset.assetCode}</span>}
                    <h3 className="am-card-name" title={asset.assetName}>{asset.assetName}</h3>
                    {asset.category && <span className="am-card-category"><Tag size={9} />{asset.category}</span>}
                </div>
                <span className={`am-badge ${statusMeta.cls}`}>{statusMeta.label}</span>
            </div>

            {/* Meta info */}
            <div className="am-card-meta">
                {asset.brand && (
                    <div className="am-card-meta-row">
                        <span className="am-card-meta-label">Hãng</span>
                        <span className="am-card-meta-val">{asset.brand}{asset.model ? ` · ${asset.model}` : ''}</span>
                    </div>
                )}
                {asset.baseValue && (
                    <div className="am-card-meta-row">
                        <span className="am-card-meta-label"><DollarSign size={9} /> Giá trị</span>
                        <span className="am-card-meta-val am-gold">{formatCurrency(asset.baseValue)}</span>
                    </div>
                )}
                {asset.warrantyExpiryDate && (
                    <div className="am-card-meta-row">
                        <span className="am-card-meta-label"><Calendar size={9} /> Bảo hành</span>
                        <span className="am-card-meta-val">{formatDate(asset.warrantyExpiryDate)}</span>
                    </div>
                )}
                <div className="am-card-meta-row">
                    <span className="am-card-meta-label"><Home size={9} /> Vị trí</span>
                    <span className={`am-card-meta-val ${isAssigned ? 'am-gold' : 'am-muted'}`}>
                        {isAssigned ? `Phòng ${asset.currentRoomNumber || asset.currentRoomId?.slice(0, 8)}` : 'Trong kho'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="am-card-actions">
                <button className="am-card-action-btn am-action-ghost" onClick={() => onHistory(asset)} title="Lịch sử">
                    <History size={12} /> Lịch sử
                </button>
                <div className="am-card-action-right">
                    <button className="am-card-action-btn am-action-ghost" onClick={() => onStatus(asset)} title="Cập nhật tình trạng">
                        <Wrench size={12} />
                    </button>
                    {isAssigned ? (
                        <button className="am-card-action-btn am-action-revoke" onClick={() => onRevoke(asset)} title="Thu hồi khỏi phòng">
                            <ArrowRightLeft size={12} /> Thu hồi
                        </button>
                    ) : (
                        <button className="am-card-action-btn am-action-assign" onClick={() => onAssign(asset)} title="Gán vào phòng">
                            <ArrowRightLeft size={12} /> Gán phòng
                        </button>
                    )}
                    <button className="am-card-action-btn am-action-edit" onClick={() => onEdit(asset)} title="Chỉnh sửa">
                        <Edit2 size={12} />
                    </button>
                    <button className="am-card-action-btn am-action-delete" onClick={() => onDelete(asset)} title="Xóa">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AssetManagementSubPage({ isDarkMode = true }) {
    const organizationId = getOrgId();

    const [assets, setAssets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [toast, setToast] = useState(null);

    // Modal states
    const [formModal, setFormModal] = useState(null);  // null | { asset } | { asset: null }
    const [deleteModal, setDeleteModal] = useState(null);
    const [assignModal, setAssignModal] = useState(null);  // { asset, mode }
    const [statusModal, setStatusModal] = useState(null);
    const [historyModal, setHistoryModal] = useState(null);

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type, key: Date.now() });
    }, []);

    const loadAssets = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const [data, statsData] = await Promise.all([
                getAssets({ organizationId, search, category: filterCategory, status: filterStatus }),
                getAssetStatistics(organizationId),
            ]);
            setAssets(data);
            setStats(statsData);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [organizationId, search, filterCategory, filterStatus, showToast]);

    useEffect(() => { loadAssets(); }, [loadAssets]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { loadAssets(); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const handleSaved = useCallback(() => { loadAssets(); }, [loadAssets]);
    const handleDeleted = useCallback(() => { loadAssets(); }, [loadAssets]);
    const handleDone = useCallback(() => { loadAssets(); }, [loadAssets]);

    return (
        <div className={`am-page ${isDarkMode ? 'am-dark' : 'am-light'}`}>

            {/* STATISTICS BAR */}
            {stats && (
                <div className="am-stats-row">
                    <StatCard label="Tổng tài sản"       value={stats.total}       icon={Package}      accent="default" />
                    <StatCard label="Tốt / Đang dùng"    value={(stats.good || 0) + (stats.working || 0)} icon={CheckCircle2}  accent="good" />
                    <StatCard label="Hư hỏng"            value={stats.damaged}     icon={AlertCircle}  accent="damaged" />
                    <StatCard label="Bảo trì / Hỏng nặng" value={(stats.maintenance || 0) + (stats.broken || 0)} icon={Wrench}  accent="maintenance" />
                    <StatCard label="Trong kho"          value={stats.inStorage}   icon={Building2}    accent="storage" />
                    <StatCard label="Đã gán phòng"       value={stats.assigned}    icon={Home}         accent="assigned" />
                </div>
            )}

            {/* CONTROL BAR */}
            <div className="am-control-bar">
                <div className="am-search-wrap">
                    <Search size={13} className="am-search-icon" />
                    <input
                        className="am-search"
                        placeholder="Tìm tên, mã tài sản..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="am-filters">
                    <div className="am-select-wrap">
                        <select className="am-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="">Tất cả danh mục</option>
                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={12} className="am-select-caret" />
                    </div>
                    <div className="am-select-wrap">
                        <select className="am-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">Tất cả trạng thái</option>
                            {ASSET_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                        </select>
                        <ChevronDown size={12} className="am-select-caret" />
                    </div>
                    <button className="am-btn-icon" onClick={loadAssets} title="Làm mới">
                        <RefreshCw size={13} />
                    </button>
                </div>
                <button className="am-btn am-btn-primary" onClick={() => setFormModal({ asset: null })}>
                    <Plus size={13} /> Thêm tài sản
                </button>
            </div>

            {/* ASSET GRID */}
            <div className="am-grid-scroll">
                {loading ? (
                    <div className="am-skeleton-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="am-skeleton-card"><div className="am-skeleton" /></div>)}
                    </div>
                ) : assets.length === 0 ? (
                    <div className="am-empty">
                        <Package size={36} className="am-empty-icon" />
                        <p className="am-empty-title">Chưa có tài sản nào</p>
                        <p className="am-empty-desc">Thêm tài sản đầu tiên vào kho bằng nút bên trên.</p>
                    </div>
                ) : (
                    <div className="am-grid">
                        {assets.map(asset => (
                            <AssetCard
                                key={asset.id}
                                asset={asset}
                                onEdit={a => setFormModal({ asset: a })}
                                onDelete={a => setDeleteModal(a)}
                                onAssign={a => setAssignModal({ asset: a, mode: 'assign' })}
                                onRevoke={a => setAssignModal({ asset: a, mode: 'revoke' })}
                                onStatus={a => setStatusModal(a)}
                                onHistory={a => setHistoryModal(a)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {formModal !== null && (
                <AssetFormModal
                    asset={formModal.asset}
                    organizationId={organizationId}
                    onClose={() => setFormModal(null)}
                    onSaved={handleSaved}
                    showToast={showToast}
                />
            )}
            {deleteModal && (
                <DeleteModal
                    asset={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onDeleted={handleDeleted}
                    showToast={showToast}
                />
            )}
            {assignModal && (
                <AssignRevokeModal
                    asset={assignModal.asset}
                    mode={assignModal.mode}
                    onClose={() => setAssignModal(null)}
                    onDone={handleDone}
                    showToast={showToast}
                />
            )}
            {statusModal && (
                <UpdateStatusModal
                    asset={statusModal}
                    onClose={() => setStatusModal(null)}
                    onDone={handleDone}
                    showToast={showToast}
                />
            )}
            {historyModal && (
                <AssetHistoryModal
                    asset={historyModal}
                    onClose={() => setHistoryModal(null)}
                />
            )}

            {/* TOAST */}
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}