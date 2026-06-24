import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Plus, Home, User, ChevronRight, Sparkles,
    Droplet, Zap, Eye, FileText, Activity, CheckCircle,
    Clock, X, Upload, Edit2, Trash2, DollarSign,
    Users, Package, Image, Check, AlertTriangle, RefreshCw,
    ChevronDown, Building2, ImageIcon
} from 'lucide-react';
import {
    getRooms, createRoom, updateRoom, deleteRoom,
    uploadRoomImage, updateRoomPrice, updateRoomOccupants, updateRoomAmenities
} from '../api/roomApi';
import { getProperties } from '../api/propertyApi';
import './RoomManagement.css';

// ─── CONSTANTS ──────────────────────────────────────────────
const ROOM_STATUSES = ['Available', 'Occupied', 'Reserved', 'Maintenance'];

const STATUS_LABELS = {
    Available: 'Trống',
    Occupied: 'Đang ở',
    Reserved: 'Đã cọc',
    Maintenance: 'Sửa chữa',
};

const AMENITIES_LIST = [
    { key: 'wifi', label: 'WiFi', icon: '📶' },
    { key: 'ac', label: 'Điều hòa', icon: '❄️' },
    { key: 'tv', label: 'TV', icon: '📺' },
    { key: 'fridge', label: 'Tủ lạnh', icon: '🧊' },
    { key: 'washer', label: 'Máy giặt', icon: '🫧' },
    { key: 'waterheater', label: 'Nóng lạnh', icon: '🚿' },
    { key: 'parking', label: 'Chỗ để xe', icon: '🅿️' },
    { key: 'balcony', label: 'Ban công', icon: '🌇' },
    { key: 'kitchen', label: 'Bếp', icon: '🍳' },
    { key: 'desk', label: 'Bàn làm việc', icon: '💼' },
    { key: 'closet', label: 'Tủ quần áo', icon: '👔' },
    { key: 'security', label: 'Camera/An ninh', icon: '🔒' },
];

// ─── HELPERS ────────────────────────────────────────────────
function parseAmenities(json) {
    try { return json ? JSON.parse(json) : []; }
    catch { return []; }
}

function formatPrice(price) {
    if (!price) return '—';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function getStatusStyle(status) {
    switch (status) {
        case 'Occupied':    return 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]';
        case 'Available':   return 'bg-[#1A2438] text-[#5294E2] border-[#243B61]';
        case 'Reserved':    return 'bg-[#312519] text-[#C5A880] border-[#523F26]';
        case 'Maintenance': return 'bg-[#2D1B1B] text-[#E05252] border-[#522525]';
        default:            return 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]';
    }
}

// ─── TOAST ───────────────────────────────────────────────────
function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const icons = { success: <Check size={14} />, error: <AlertTriangle size={14} />, info: <Sparkles size={14} /> };
    return (
        <div className={`rm-toast rm-toast-${type}`}>
            {icons[type]}
            <span>{message}</span>
            <button onClick={onClose} className="ml-auto" style={{ background: 'none', border: 'none', color: '#5A5C66', cursor: 'pointer' }}>
                <X size={12} />
            </button>
        </div>
    );
}

// ─── MODAL WRAPPER ───────────────────────────────────────────
function Modal({ title, onClose, children, size = '' }) {
    return (
        <div className="rm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`rm-modal ${size === 'lg' ? 'rm-modal-lg' : ''}`}>
                <div className="rm-modal-header">
                    <span className="rm-modal-title">{title}</span>
                    <button className="rm-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── TASK-014 / 015: CREATE / EDIT ROOM MODAL ───────────────
function RoomFormModal({ room, propertyId, onClose, onSaved, showToast }) {
    const isEdit = !!room;
    const [form, setForm] = useState({
        propertyId: propertyId,
        roomNumber: room?.roomNumber ?? '',
        floor: room?.floor ?? 1,
        basePrice: room?.basePrice ?? '',
        status: room?.status ?? 'Available',
        maxOccupants: room?.maxOccupants ?? 1,
        amenitiesJson: room?.amenitiesJson ?? null,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.roomNumber.trim()) e.roomNumber = 'Mã phòng không được để trống';
        if (!form.basePrice || Number(form.basePrice) <= 0) e.basePrice = 'Giá thuê phải lớn hơn 0';
        if (!form.floor || Number(form.floor) < 1) e.floor = 'Tầng phải >= 1';
        if (!form.maxOccupants || Number(form.maxOccupants) < 1) e.maxOccupants = 'Sức chứa phải >= 1';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const payload = {
                ...form,
                floor: Number(form.floor),
                basePrice: Number(form.basePrice),
                maxOccupants: Number(form.maxOccupants),
            };

            let saved;
            if (isEdit) {
                saved = await updateRoom(room.id, { ...payload, rowVersion: room.rowVersion });
            } else {
                saved = await createRoom(payload);
            }
            showToast(isEdit ? 'Đã cập nhật phòng thành công!' : 'Đã thêm phòng mới!', 'success');
            onSaved(saved);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const field = (name, label, extra = {}) => (
        <div className={`rm-field ${extra.col2 ? 'rm-col-2' : ''}`}>
            <label className="rm-label">{label}</label>
            <input
                className="rm-input"
                value={form[name]}
                onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                {...extra}
            />
            {errors[name] && <span className="rm-error-text">{errors[name]}</span>}
        </div>
    );

    return (
        <Modal title={isEdit ? 'Cập Nhật Phòng' : 'Thêm Phòng Mới'} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="rm-modal-body">
                    <div className="rm-form-grid">
                        {field('roomNumber', 'Mã / Số phòng', { placeholder: 'VD: P101' })}
                        {field('floor', 'Tầng', { type: 'number', min: 1 })}
                        {field('basePrice', 'Giá thuê (VNĐ/tháng)', { type: 'number', min: 0, placeholder: '3500000' })}
                        {field('maxOccupants', 'Sức chứa (người)', { type: 'number', min: 1, max: 20 })}

                        <div className="rm-field">
                            <label className="rm-label">Trạng thái</label>
                            <select
                                className="rm-select"
                                value={form.status}
                                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                            >
                                {ROOM_STATUSES.map(s => (
                                    <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="rm-modal-footer">
                    <button type="button" className="rm-btn rm-btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" className="rm-btn rm-btn-primary" disabled={loading}>
                        {loading ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                        {isEdit ? 'Lưu thay đổi' : 'Thêm phòng'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── TASK-016: DELETE CONFIRM ────────────────────────────────
function DeleteConfirmModal({ room, onClose, onDeleted, showToast }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteRoom(room.id);
            showToast(`Đã xóa phòng ${room.roomNumber}`, 'success');
            onDeleted(room.id);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Xác Nhận Xóa Phòng" onClose={onClose}>
            <div className="rm-modal-body">
                <div className="rm-confirm-icon"><AlertTriangle size={22} /></div>
                <p className="rm-confirm-title">Xóa phòng "{room.roomNumber}"?</p>
                <p className="rm-confirm-desc">
                    Hành động này không thể hoàn tác. Toàn bộ ảnh, lịch sử booking liên quan đến phòng này sẽ bị ảnh hưởng.
                </p>
            </div>
            <div className="rm-modal-footer">
                <button className="rm-btn rm-btn-cancel" onClick={onClose}>Hủy</button>
                <button className="rm-btn rm-btn-danger" onClick={handleDelete} disabled={loading}>
                    {loading ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Xóa phòng
                </button>
            </div>
        </Modal>
    );
}

// ─── TASK-017: UPLOAD IMAGE MODAL ────────────────────────────
function UploadImageModal({ room, onClose, onUploaded, showToast }) {
    const [files, setFiles] = useState([]);
    const [isCover, setIsCover] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef();

    const addFiles = (newFiles) => {
        const imgs = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        setFiles(prev => [...prev, ...imgs].slice(0, 5));
    };

    const handleUpload = async () => {
        if (!files.length) { showToast('Vui lòng chọn ít nhất 1 ảnh', 'error'); return; }
        setLoading(true);
        try {
            let lastUploaded;
            for (let i = 0; i < files.length; i++) {
                const setCover = isCover && i === 0;
                lastUploaded = await uploadRoomImage(room.id, files[i], setCover);
            }
            showToast(`Đã upload ${files.length} ảnh thành công!`, 'success');
            onUploaded();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Upload Ảnh Phòng" onClose={onClose}>
            <div className="rm-modal-body">
                <p style={{ fontSize: '0.75rem', color: '#5A5C66', marginBottom: '1rem' }}>
                    Phòng: <strong style={{ color: '#C5A880' }}>{room.roomNumber}</strong> — Tối đa 5 ảnh, mỗi ảnh &lt; 10MB
                </p>

                {/* Drop zone */}
                <div
                    className={`rm-upload-zone ${dragOver ? 'rm-drag-over' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                >
                    <Upload size={28} color="#3E404C" />
                    <p style={{ color: '#C5A880', fontWeight: 600, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Nhấp hoặc kéo thả ảnh vào đây
                    </p>
                    <p className="rm-upload-zone-text">Hỗ trợ JPEG, PNG, WebP</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={e => addFiles(e.target.files)}
                    />
                </div>

                {/* Preview */}
                {files.length > 0 && (
                    <div className="rm-upload-preview">
                        {files.map((f, i) => (
                            <div key={i} className="rm-upload-preview-item">
                                <img src={URL.createObjectURL(f)} alt={f.name} />
                                <button
                                    className="rm-upload-preview-remove"
                                    onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))}
                                >
                                    <X size={10} />
                                </button>
                                {isCover && i === 0 && <span className="rm-cover-badge">Cover</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Cover option */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="isCover"
                        checked={isCover}
                        onChange={e => setIsCover(e.target.checked)}
                        style={{ accentColor: '#C5A880' }}
                    />
                    <label htmlFor="isCover" style={{ fontSize: '0.75rem', color: '#8A8D98', cursor: 'pointer' }}>
                        Đặt ảnh đầu tiên làm ảnh bìa (cover)
                    </label>
                </div>
            </div>
            <div className="rm-modal-footer">
                <button className="rm-btn rm-btn-cancel" onClick={onClose}>Hủy</button>
                <button className="rm-btn rm-btn-primary" onClick={handleUpload} disabled={loading || !files.length}>
                    {loading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                    Upload {files.length > 0 ? `(${files.length} ảnh)` : ''}
                </button>
            </div>
        </Modal>
    );
}

// ─── TASK-018: UPDATE PRICE MODAL ────────────────────────────
function UpdatePriceModal({ room, onClose, onSaved, showToast }) {
    const [price, setPrice] = useState(room.basePrice ?? '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!price || Number(price) <= 0) { showToast('Giá thuê phải lớn hơn 0', 'error'); return; }
        setLoading(true);
        try {
            const saved = await updateRoomPrice(room.id, Number(price), room.rowVersion);
            showToast('Đã cập nhật giá thuê!', 'success');
            onSaved(saved);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Cập Nhật Giá Thuê" onClose={onClose}>
            <div className="rm-modal-body">
                <div className="rm-field">
                    <label className="rm-label">Phòng: {room.roomNumber}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <DollarSign size={16} color="#C5A880" />
                        <input
                            type="number"
                            className="rm-input"
                            placeholder="Giá thuê (VNĐ/tháng)"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            min={0}
                            style={{ flex: 1 }}
                        />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#5A5C66', marginTop: '0.5rem' }}>
                        Hiện tại: <strong style={{ color: '#C5A880' }}>{formatPrice(room.basePrice)}/tháng</strong>
                    </p>
                </div>
            </div>
            <div className="rm-modal-footer">
                <button className="rm-btn rm-btn-cancel" onClick={onClose}>Hủy</button>
                <button className="rm-btn rm-btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                    Lưu giá mới
                </button>
            </div>
        </Modal>
    );
}

// ─── TASK-019: UPDATE OCCUPANTS MODAL ───────────────────────
function UpdateOccupantsModal({ room, onClose, onSaved, showToast }) {
    const [occupants, setOccupants] = useState(room.maxOccupants ?? 1);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!occupants || Number(occupants) < 1) { showToast('Sức chứa phải >= 1', 'error'); return; }
        setLoading(true);
        try {
            const saved = await updateRoomOccupants(room.id, Number(occupants), room.rowVersion);
            showToast('Đã cập nhật sức chứa!', 'success');
            onSaved(saved);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Cập Nhật Sức Chứa" onClose={onClose}>
            <div className="rm-modal-body">
                <div className="rm-field">
                    <label className="rm-label">Phòng: {room.roomNumber} — Số người tối đa</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <Users size={16} color="#C5A880" />
                        <input
                            type="number"
                            className="rm-input"
                            value={occupants}
                            onChange={e => setOccupants(e.target.value)}
                            min={1} max={20}
                            style={{ flex: 1 }}
                        />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#5A5C66', marginTop: '0.5rem' }}>
                        Hiện tại: <strong style={{ color: '#C5A880' }}>{room.maxOccupants} người</strong>
                    </p>
                </div>
            </div>
            <div className="rm-modal-footer">
                <button className="rm-btn rm-btn-cancel" onClick={onClose}>Hủy</button>
                <button className="rm-btn rm-btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                    Lưu
                </button>
            </div>
        </Modal>
    );
}

// ─── TASK-020: AMENITIES MODAL ───────────────────────────────
function AmenitiesModal({ room, onClose, onSaved, showToast }) {
    const [selected, setSelected] = useState(parseAmenities(room.amenitiesJson));
    const [loading, setLoading] = useState(false);

    const toggle = (key) => setSelected(p =>
        p.includes(key) ? p.filter(k => k !== key) : [...p, key]
    );

    const handleSave = async () => {
        setLoading(true);
        try {
            const json = selected.length ? JSON.stringify(selected) : null;
            const saved = await updateRoomAmenities(room.id, json, room.rowVersion);
            showToast('Đã cập nhật tiện ích phòng!', 'success');
            onSaved(saved);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Cập Nhật Tiện Ích Phòng" onClose={onClose} size="lg">
            <div className="rm-modal-body">
                <p style={{ fontSize: '0.75rem', color: '#5A5C66', marginBottom: '1rem' }}>
                    Phòng <strong style={{ color: '#C5A880' }}>{room.roomNumber}</strong> — Chọn các tiện ích có sẵn trong phòng
                </p>
                <div className="rm-amenities-grid">
                    {AMENITIES_LIST.map(({ key, label, icon }) => {
                        const active = selected.includes(key);
                        return (
                            <div
                                key={key}
                                className={`rm-amenity-item ${active ? 'rm-amenity-active' : ''}`}
                                onClick={() => toggle(key)}
                            >
                                <div className="rm-amenity-checkbox">
                                    {active && <Check size={9} color="#000" strokeWidth={3} />}
                                </div>
                                <span>{icon}</span>
                                <span style={{ fontSize: '0.75rem' }}>{label}</span>
                            </div>
                        );
                    })}
                </div>
                <p style={{ fontSize: '0.7rem', color: '#3E404C', marginTop: '0.75rem' }}>
                    Đã chọn: {selected.length} tiện ích
                </p>
            </div>
            <div className="rm-modal-footer">
                <button className="rm-btn rm-btn-cancel" onClick={onClose}>Hủy</button>
                <button className="rm-btn rm-btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                    Lưu tiện ích
                </button>
            </div>
        </Modal>
    );
}

// ─── ROOM DETAILS MODAL ──────────────────────────────────────
function RoomDetailsModal({ room, onClose }) {
    const amenities = parseAmenities(room.amenitiesJson);
    const coverImage = room.images?.find(i => i.isCover) ?? room.images?.[0];
    const otherImages = room.images?.filter(i => i !== coverImage) ?? [];

    return (
        <Modal title={`Chi Tiết Phòng ${room.roomNumber}`} onClose={onClose} size="lg">
            <div className="rm-modal-body">
                {/* Images Section */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold text-[#8A8D98] uppercase tracking-wider mb-2">Hình ảnh phòng</h4>
                    {room.images?.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {coverImage && (
                                <div className="col-span-4 h-48 relative rounded-sm overflow-hidden border border-[#2C2D35]">
                                    <img src={coverImage.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    <span className="absolute top-2 left-2 bg-black/60 text-[#C5A880] text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider font-semibold">Ảnh bìa</span>
                                </div>
                            )}
                            {otherImages.map((img, idx) => (
                                <div key={idx} className="h-20 rounded-sm overflow-hidden border border-[#2C2D35]">
                                    <img src={img.imageUrl} alt={`Room ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-24 bg-[#16171E] border border-[#2C2D35] border-dashed flex flex-col items-center justify-center text-[#5A5C66] rounded-sm">
                            <ImageIcon size={24} className="mb-2 opacity-50" />
                            <span className="text-[10px] uppercase tracking-wider">Chưa có hình ảnh</span>
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#16171E] p-3 rounded-sm border border-[#2C2D35]">
                        <span className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Giá thuê cơ bản</span>
                        <div className="flex items-center gap-2 text-[#C5A880] font-mono text-lg">
                            <DollarSign size={16} />
                            {formatPrice(room.basePrice)}/tháng
                        </div>
                    </div>
                    <div className="bg-[#16171E] p-3 rounded-sm border border-[#2C2D35]">
                        <span className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Trạng thái</span>
                        <span className={`inline-block px-2 py-1 text-[10px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(room.status)}`}>
                            {STATUS_LABELS[room.status] ?? room.status}
                        </span>
                    </div>
                    <div className="bg-[#16171E] p-3 rounded-sm border border-[#2C2D35]">
                        <span className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Tầng</span>
                        <div className="text-white text-sm font-medium">{room.floor}</div>
                    </div>
                    <div className="bg-[#16171E] p-3 rounded-sm border border-[#2C2D35]">
                        <span className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Sức chứa tối đa</span>
                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                            <Users size={14} className="text-[#8A8D98]" /> {room.maxOccupants} người
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <h4 className="text-xs font-semibold text-[#8A8D98] uppercase tracking-wider mb-2">Tiện ích phòng</h4>
                    {amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {amenities.map(key => {
                                const a = AMENITIES_LIST.find(x => x.key === key);
                                return a ? (
                                    <div key={key} className="flex items-center gap-1.5 bg-[#1F212A] border border-[#2C2D35] px-2.5 py-1.5 rounded-sm">
                                        <span>{a.icon}</span>
                                        <span className="text-xs text-[#E4E6EB]">{a.label}</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <span className="text-xs text-[#5A5C66] italic">Phòng này chưa có tiện ích nào.</span>
                    )}
                </div>
            </div>
            <div className="rm-modal-footer">
                <button className="rm-btn rm-btn-cancel ml-auto" onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    );
}

// ─── ROOM CARD ───────────────────────────────────────────────
function RoomCard({ room, onEdit, onDelete, onUploadImage, onUpdatePrice, onUpdateOccupants, onUpdateAmenities, onViewDetails }) {
    const amenities = parseAmenities(room.amenitiesJson);
    const coverImage = room.images?.find(i => i.isCover) ?? room.images?.[0];

    return (
        <div className="bg-[#16171E] border border-[#2C2D35] hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-col group relative overflow-hidden shadow-xl">

            {/* Image strip */}
            <div
                className="h-[90px] bg-[#0F1016] overflow-hidden cursor-pointer relative flex items-center justify-center"
                onClick={() => onUploadImage(room)}
            >
                {coverImage ? (
                    <img
                        src={coverImage.imageUrl}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-1 opacity-30">
                        <ImageIcon size={20} color="#C5A880" />
                        <span className="text-[9px] text-[#5A5C66] uppercase tracking-wider">Thêm ảnh</span>
                    </div>
                )}
                {room.images?.length > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/60 text-[#C5A880] text-[9px] px-1.5 py-0.5 rounded-sm font-mono">
                        {room.images.length} ảnh
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="p-4 border-b border-[#2C2D35]/50">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <span className="text-[10px] font-mono text-[#5A5C66] block tracking-wider">
                            Tầng {room.floor}
                        </span>
                        <h3 className="text-sm font-light tracking-wide text-white group-hover:text-[#C5A880] transition-colors mt-0.5">
                            Phòng {room.roomNumber}
                        </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(room.status)}`}>
                        {STATUS_LABELS[room.status] ?? room.status}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-[#12131A]/40 border-b border-[#2C2D35]/30 space-y-2 flex-1 text-xs">
                {/* Price row */}
                <div className="flex justify-between items-center">
                    <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Giá thuê</span>
                    <button
                        onClick={() => onUpdatePrice(room)}
                        className="font-mono font-medium text-[#C5A880] hover:text-[#D4AF37] transition-colors"
                    >
                        {formatPrice(room.basePrice)}<span className="text-[10px] text-[#5A5C66] font-sans"> / thg</span>
                    </button>
                </div>

                {/* Occupants row */}
                <div className="flex justify-between items-center">
                    <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Sức chứa</span>
                    <button
                        onClick={() => onUpdateOccupants(room)}
                        className="text-white hover:text-[#C5A880] transition-colors font-light flex items-center gap-1"
                    >
                        <Users size={10} />
                        {room.maxOccupants ?? '—'} người
                    </button>
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {amenities.slice(0, 5).map(key => {
                            const a = AMENITIES_LIST.find(x => x.key === key);
                            return a ? (
                                <span key={key} className="text-[9px] bg-[#1F212A] border border-[#2C2D35] text-[#5A5C66] px-1.5 py-0.5 rounded-sm">
                                    {a.icon}
                                </span>
                            ) : null;
                        })}
                        {amenities.length > 5 && (
                            <span className="text-[9px] text-[#3E404C]">+{amenities.length - 5}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer actions */}
            <div className="p-3 bg-[#1B1C24] border-t border-[#2C2D35] flex justify-between gap-1.5 flex-wrap">
                <div className="flex gap-1.5">
                    <button
                        onClick={() => onViewDetails(room)}
                        className="flex items-center gap-1 text-[#8A8D98] hover:text-[#5294E2] border border-[#2C2D35] hover:border-[#5294E2] bg-[#1F212A] text-[10px] uppercase font-semibold px-3 py-1.5 rounded-sm transition-all"
                    >
                        <Eye size={11} /> Chi tiết
                    </button>
                    <button
                        onClick={() => onUploadImage(room)}
                        title="Upload ảnh"
                        className="flex items-center justify-center w-7 h-7 text-[#5A5C66] hover:text-[#C5A880] border border-[#2C2D35] hover:border-[#C5A880] bg-[#1F212A] rounded-sm transition-all"
                    >
                        <Image size={11} />
                    </button>
                    <button
                        onClick={() => onUpdateAmenities(room)}
                        title="Tiện ích"
                        className="flex items-center justify-center w-7 h-7 text-[#5A5C66] hover:text-[#C5A880] border border-[#2C2D35] hover:border-[#C5A880] bg-[#1F212A] rounded-sm transition-all"
                    >
                        <Package size={11} />
                    </button>
                </div>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => onEdit(room)}
                        title="Sửa phòng"
                        className="flex items-center justify-center w-7 h-7 text-[#8A8D98] hover:text-white border border-[#2C2D35] hover:border-white bg-[#1F212A] rounded-sm transition-all"
                    >
                        <Edit2 size={11} />
                    </button>
                    <button
                        onClick={() => onDelete(room)}
                        title="Xóa phòng"
                        className="flex items-center justify-center w-7 h-7 text-[#8A8D98] hover:text-[#E05252] border border-[#2C2D35] hover:border-[#522525] bg-[#1F212A] rounded-sm transition-all"
                    >
                        <Trash2 size={11} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SKELETON LOADER ─────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-[#16171E] border border-[#2C2D35] rounded-sm overflow-hidden">
            <div className="rm-skeleton h-[90px]" />
            <div className="p-4 space-y-2">
                <div className="rm-skeleton h-3 w-16 rounded" />
                <div className="rm-skeleton h-4 w-28 rounded" />
            </div>
            <div className="p-4 space-y-2">
                <div className="rm-skeleton h-3 w-full rounded" />
                <div className="rm-skeleton h-3 w-3/4 rounded" />
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function RoomManagementSubPage({ isDarkMode = true, propertyId: propPropertyId }) {
    // State
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedPropertyId, setSelectedPropertyId] = useState(propPropertyId ?? '');
    const [toast, setToast] = useState(null);
    const [properties, setProperties] = useState([]);

    // Modal states
    const [modal, setModal] = useState(null); // { type: 'create'|'edit'|'delete'|'image'|'price'|'occupants'|'amenities', room: ... }

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type, key: Date.now() });
    }, []);

    // Fetch properties for dropdown if no propPropertyId
    useEffect(() => {
        if (propPropertyId) return;
        async function fetchProps() {
            try {
                const accountStr = localStorage.getItem('ns_account');
                if (accountStr) {
                    const orgId = JSON.parse(accountStr).organizationId;
                    if (orgId) {
                        const data = await getProperties(orgId);
                        setProperties(data);
                        if (data.length > 0 && !selectedPropertyId) {
                            setSelectedPropertyId(data[0].id);
                        }
                    }
                }
            } catch (err) {
                console.error('Lỗi tải danh sách cơ sở', err);
            }
        }
        fetchProps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propPropertyId]);

    // TASK-011: Fetch rooms
    const fetchRooms = useCallback(async () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        try {
            const data = await getRooms({
                propertyId: selectedPropertyId,
                search: searchTerm,
                status: statusFilter !== 'All' ? statusFilter : '',
            });
            setRooms(data);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedPropertyId, searchTerm, statusFilter, showToast]);

    // TASK-012 & 013: Debounce search + filter
    useEffect(() => {
        const timer = setTimeout(fetchRooms, 350);
        return () => clearTimeout(timer);
    }, [fetchRooms]);

    // Stats
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const available = rooms.filter(r => r.status === 'Available').length;
    const reserved = rooms.filter(r => r.status === 'Reserved').length;

    // Handlers
    const handleRoomSaved = (savedRoom) => {
        setRooms(prev => {
            const idx = prev.findIndex(r => r.id === savedRoom.id);
            return idx >= 0 ? prev.map(r => r.id === savedRoom.id ? savedRoom : r) : [savedRoom, ...prev];
        });
        setModal(null);
    };

    const handleRoomDeleted = (roomId) => {
        setRooms(prev => prev.filter(r => r.id !== roomId));
        setModal(null);
    };

    const handleImageUploaded = () => {
        setModal(null);
        fetchRooms(); // Reload để lấy ảnh mới
    };

    return (
        <div className="w-full h-full max-h-screen bg-[#0F1016] text-[#E4E6EB] font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden">

            {/* PROPERTY SELECTOR */}
            {!propPropertyId && (
                <div className="rm-property-selector shrink-0">
                    <Building2 size={14} color="#5A5C66" />
                    <span className="rm-property-label">Cơ sở:</span>
                    <select
                        className="rm-property-select"
                        value={selectedPropertyId}
                        onChange={e => setSelectedPropertyId(e.target.value)}
                    >
                        <option value="">-- Chọn cơ sở --</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.propertyName || `Cơ sở ${p.id.substring(0, 8)}`}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* STATS */}
            <div className="shrink-0 bg-[#16171E] border border-[#3E404C] rounded-sm p-6 mb-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#C5A880]/[0.04] to-transparent pointer-events-none" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x divide-[#343642]">
                    {[
                        { label: 'Tổng quy mô', value: total, sub: 'BĐS hiện hữu', icon: Activity, color: '#D4AF37' },
                        { label: 'Đang cho thuê', value: occupied, sub: `Lấp đầy ${total ? ((occupied / total) * 100).toFixed(0) : 0}%`, icon: CheckCircle, color: '#56B37B' },
                        { label: 'Trống bàn giao', value: available, sub: 'Sẵn sàng ký', icon: Home, color: '#62A1EC' },
                        { label: 'Cọc giữ chỗ', value: reserved, sub: 'Đợi bàn giao', icon: Clock, color: '#EAD0A8' },
                    ].map(({ label, value, sub, icon: Icon, color }, i) => (
                        <div key={i} className={`flex flex-col justify-between ${i > 0 ? 'lg:pl-6' : ''}`}>
                            <span className="text-[11px] tracking-[0.15em] text-[#E4E6EB] uppercase font-semibold flex items-center gap-1.5">
                                <Icon size={12} style={{ color }} /> {label}
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className="text-4xl font-normal tracking-tight" style={{ color: i === 0 ? 'white' : color }}>{value}</span>
                                <span className="text-[10px] text-[#8A8D98] uppercase font-mono tracking-wider font-medium">{sub}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CONTROL BAR */}
            <div className="shrink-0 bg-[#16171E] border border-[#2C2D35] rounded-sm p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* TASK-012: Search */}
                    <div className="relative w-full lg:w-80">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Tìm nhanh số phòng..."
                            className="w-full bg-[#1F212A] border border-[#2C2D35] text-white placeholder-[#5A5C66] text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                        />
                        <Search size={14} className="absolute left-3 top-3 text-[#5A5C66]" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-[#5A5C66] hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
                        {/* TASK-013: Status filter tabs */}
                        <div className="flex gap-1.5 overflow-x-auto">
                            {['All', ...ROOM_STATUSES].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 text-[10px] tracking-wider font-semibold border transition-all rounded-sm uppercase whitespace-nowrap ${statusFilter === s
                                        ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]'
                                        : 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white'
                                    }`}
                                >
                                    {s === 'All' ? 'Tất cả' : STATUS_LABELS[s] ?? s}
                                </button>
                            ))}
                        </div>

                        {/* TASK-014: Add room button */}
                        <button
                            onClick={() => {
                                if (!selectedPropertyId) {
                                    showToast('Vui lòng chọn cơ sở trước khi thêm phòng', 'error');
                                    return;
                                }
                                setModal({ type: 'create' });
                            }}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-[11px] font-bold px-4 py-2 rounded-sm hover:opacity-90 transition-opacity uppercase tracking-wider whitespace-nowrap h-[32px]"
                        >
                            <Plus size={14} /> Thêm Phòng
                        </button>
                    </div>
                </div>
            </div>

            {/* ROOM GRID */}
            <div className="flex-1 overflow-y-scroll pr-1 pb-4 min-h-[200px] scrollbar-thin scrollbar-thumb-[#3E404C] scrollbar-track-transparent">
                {!selectedPropertyId ? (
                    <div className="py-16 text-center border border-dashed border-[#2C2D35] bg-[#16171E] rounded-sm flex flex-col items-center justify-center min-h-[300px]">
                        <Building2 size={32} className="text-[#3E404C] mb-2" />
                        <h3 className="text-sm font-medium text-white tracking-wide">Chọn cơ sở để xem phòng</h3>
                        <p className="text-xs text-[#5A5C66] mt-1">Nhập PropertyId hoặc chọn từ danh sách cơ sở</p>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rooms.map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onEdit={r => setModal({ type: 'edit', room: r })}
                                onDelete={r => setModal({ type: 'delete', room: r })}
                                onUploadImage={r => setModal({ type: 'image', room: r })}
                                onUpdatePrice={r => setModal({ type: 'price', room: r })}
                                onUpdateOccupants={r => setModal({ type: 'occupants', room: r })}
                                onUpdateAmenities={r => setModal({ type: 'amenities', room: r })}
                                onViewDetails={r => setModal({ type: 'details', room: r })}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center border border-dashed border-[#2C2D35] bg-[#16171E] rounded-sm flex flex-col items-center justify-center min-h-[300px]">
                        <Home size={32} className="text-[#3E404C] mb-2" />
                        <h3 className="text-sm font-medium text-white tracking-wide">Không tìm thấy phòng phù hợp</h3>
                        <p className="text-xs text-[#5A5C66] mt-1">Thử thay đổi bộ lọc hoặc thêm phòng mới</p>
                    </div>
                )}
            </div>

            {/* ── MODALS ── */}
            {modal?.type === 'details' && (
                <RoomDetailsModal
                    room={modal.room}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === 'create' && (
                <RoomFormModal
                    propertyId={selectedPropertyId}
                    onClose={() => setModal(null)}
                    onSaved={handleRoomSaved}
                    showToast={showToast}
                />
            )}
            {modal?.type === 'edit' && (
                <RoomFormModal
                    room={modal.room}
                    propertyId={selectedPropertyId}
                    onClose={() => setModal(null)}
                    onSaved={handleRoomSaved}
                    showToast={showToast}
                />
            )}
            {modal?.type === 'delete' && (
                <DeleteConfirmModal
                    room={modal.room}
                    onClose={() => setModal(null)}
                    onDeleted={handleRoomDeleted}
                    showToast={showToast}
                />
            )}
            {modal?.type === 'image' && (
                <UploadImageModal
                    room={modal.room}
                    onClose={() => setModal(null)}
                    onUploaded={handleImageUploaded}
                    showToast={showToast}
                />
            )}
            {modal?.type === 'price' && (
                <UpdatePriceModal
                    room={modal.room}
                    onClose={() => setModal(null)}
                    onSaved={handleRoomSaved}
                    showToast={showToast}
                />
            )}
            {modal?.type === 'occupants' && (
                <UpdateOccupantsModal
                    room={modal.room}
                    onClose={() => setModal(null)}
                    onSaved={handleRoomSaved}
                    showToast={showToast}
                />
            )}
            {modal?.type === 'amenities' && (
                <AmenitiesModal
                    room={modal.room}
                    onClose={() => setModal(null)}
                    onSaved={handleRoomSaved}
                    showToast={showToast}
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