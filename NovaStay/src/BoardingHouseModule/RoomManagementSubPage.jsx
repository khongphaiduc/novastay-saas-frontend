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
    uploadRoomImage, deleteRoomImage
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

// ─── ROOM DETAILS MODAL ──────────────────────────────────────
function RoomDetailsModal({ room, onClose, onSaved, onDeleted, showToast }) {
    const [currentRoom, setCurrentRoom] = useState(room);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form fields state
    const [form, setForm] = useState({
        roomNumber: room.roomNumber ?? '',
        floor: room.floor ?? 1,
        basePrice: room.basePrice ?? 0,
        maxOccupants: room.maxOccupants ?? 1,
        status: room.status ?? 'Available',
    });
    const [errors, setErrors] = useState({});
    const [selectedAmenities, setSelectedAmenities] = useState(() => parseAmenities(room.amenitiesJson));

    // Upload & image states
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null);
    const [isCover, setIsCover] = useState(false);
    const fileInputRef = useRef();

    // Delete room state
    const [deletingRoom, setDeletingRoom] = useState(false);

    // Sync state when room changes or is saved
    const updateLocalRoomState = (newRoom) => {
        setCurrentRoom(newRoom);
        setForm({
            roomNumber: newRoom.roomNumber ?? '',
            floor: newRoom.floor ?? 1,
            basePrice: newRoom.basePrice ?? 0,
            maxOccupants: newRoom.maxOccupants ?? 1,
            status: newRoom.status ?? 'Available',
        });
        setSelectedAmenities(parseAmenities(newRoom.amenitiesJson));
        onSaved(newRoom); // Update parent rooms list in background!
    };

    const validate = () => {
        const e = {};
        if (!form.roomNumber.trim()) e.roomNumber = 'Mã phòng không được trống';
        if (Number(form.basePrice) <= 0) e.basePrice = 'Giá thuê phải > 0';
        if (Number(form.floor) < 1) e.floor = 'Tầng phải >= 1';
        if (Number(form.maxOccupants) < 1) e.maxOccupants = 'Sức chứa phải >= 1';
        return e;
    };

    // Save info & amenities
    const handleSaveChanges = async () => {
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                roomNumber: form.roomNumber,
                floor: Number(form.floor),
                basePrice: Number(form.basePrice),
                maxOccupants: Number(form.maxOccupants),
                status: form.status,
                amenitiesJson: selectedAmenities.length ? JSON.stringify(selectedAmenities) : null,
                rowVersion: currentRoom.rowVersion,
            };

            const saved = await updateRoom(currentRoom.id, payload);
            showToast('Đã lưu thay đổi phòng thành công!', 'success');
            updateLocalRoomState(saved);
            setIsEditing(false);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Toggle amenities selection
    const toggleAmenity = (key) => {
        setSelectedAmenities(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    // Delete image handler
    const handleDeleteImage = async (imageId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
        setDeletingImageId(imageId);
        try {
            await deleteRoomImage(currentRoom.id, imageId);
            showToast('Đã xóa ảnh thành công!', 'success');
            // Refresh local room details (and update parent)
            const updatedImages = currentRoom.images.filter(img => img.id !== imageId);
            const updatedRoom = { ...currentRoom, images: updatedImages };
            updateLocalRoomState(updatedRoom);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDeletingImageId(null);
        }
    };

    // Upload new image
    const handleUploadImageFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadRoomImage(currentRoom.id, file, isCover);
            showToast('Đã tải ảnh lên thành công!', 'success');
            
            // Fetch updated rooms list to sync this room with images
            const data = await getRooms({ propertyId: currentRoom.propertyId });
            const updated = data.find(r => r.id === currentRoom.id);
            if (updated) {
                updateLocalRoomState(updated);
            }
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setUploading(false);
            setIsCover(false);
        }
    };

    // Delete Room
    const handleDeleteRoom = async () => {
        if (!window.confirm(`Hành động này sẽ XÓA phòng ${currentRoom.roomNumber}. Bạn có chắc chắn?`)) return;
        setDeletingRoom(true);
        try {
            await deleteRoom(currentRoom.id);
            showToast(`Đã xóa phòng ${currentRoom.roomNumber} thành công!`, 'success');
            onDeleted(currentRoom.id);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDeletingRoom(false);
        }
    };

    // Parsed info
    const coverImage = currentRoom.images?.find(i => i.isCover) ?? currentRoom.images?.[0];
    const otherImages = currentRoom.images?.filter(i => i !== coverImage) ?? [];

    return (
        <Modal title={`Quản Lý Chi Tiết Phòng ${currentRoom.roomNumber}`} onClose={onClose} size="lg">
            <div className="rm-modal-body select-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT PANEL: Room Form & Amenities */}
                    <div className="space-y-4 border-r border-[#2C2D35]/50 pr-0 md:pr-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-semibold text-[#8A8D98] uppercase tracking-wider">Thông tin & Tiện ích</h4>
                            <button
                                className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-sm border transition-all ${
                                    isEditing
                                        ? 'bg-[#E05252]/10 border-[#522525] text-[#E05252] hover:bg-[#E05252]/20'
                                        : 'bg-[#C5A880]/10 border-[#C5A880]/30 text-[#C5A880] hover:bg-[#C5A880]/20'
                                }`}
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    if (isEditing) {
                                        setForm({
                                            roomNumber: currentRoom.roomNumber ?? '',
                                            floor: currentRoom.floor ?? 1,
                                            basePrice: currentRoom.basePrice ?? 0,
                                            maxOccupants: currentRoom.maxOccupants ?? 1,
                                            status: currentRoom.status ?? 'Available',
                                        });
                                        setSelectedAmenities(parseAmenities(currentRoom.amenitiesJson));
                                    }
                                }}
                            >
                                {isEditing ? 'Hủy sửa' : 'Chỉnh sửa'}
                            </button>
                        </div>

                        {/* Room Info Grid */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Mã số phòng</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="rm-input font-mono"
                                            value={form.roomNumber}
                                            onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))}
                                        />
                                    ) : (
                                        <div className="bg-[#16171E] px-3 py-2 rounded-sm border border-[#2C2D35]/60 text-white font-mono text-sm">
                                            {currentRoom.roomNumber}
                                        </div>
                                    )}
                                    {errors.roomNumber && <span className="text-[9px] text-[#E05252]">{errors.roomNumber}</span>}
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Tầng</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            className="rm-input font-mono"
                                            value={form.floor}
                                            onChange={e => setForm(p => ({ ...p, floor: e.target.value }))}
                                        />
                                    ) : (
                                        <div className="bg-[#16171E] px-3 py-2 rounded-sm border border-[#2C2D35]/60 text-white text-sm">
                                            Tầng {currentRoom.floor}
                                        </div>
                                    )}
                                    {errors.floor && <span className="text-[9px] text-[#E05252]">{errors.floor}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Giá thuê (VNĐ/tháng)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            step="50000"
                                            className="rm-input font-mono"
                                            value={form.basePrice}
                                            onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                                        />
                                    ) : (
                                        <div className="bg-[#16171E] px-3 py-2 rounded-sm border border-[#2C2D35]/60 text-[#C5A880] font-mono text-sm">
                                            {formatPrice(currentRoom.basePrice)}
                                        </div>
                                    )}
                                    {errors.basePrice && <span className="text-[9px] text-[#E05252]">{errors.basePrice}</span>}
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Sức chứa tối đa (người)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            className="rm-input font-mono"
                                            value={form.maxOccupants}
                                            onChange={e => setForm(p => ({ ...p, maxOccupants: e.target.value }))}
                                        />
                                    ) : (
                                        <div className="bg-[#16171E] px-3 py-2 rounded-sm border border-[#2C2D35]/60 text-white text-sm flex items-center gap-1.5">
                                            <Users size={12} className="text-[#8A8D98]" /> {currentRoom.maxOccupants} người
                                        </div>
                                    )}
                                    {errors.maxOccupants && <span className="text-[9px] text-[#E05252]">{errors.maxOccupants}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-1">Trạng thái phòng</label>
                                {isEditing ? (
                                    <select
                                        className="rm-select"
                                        value={form.status}
                                        onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                    >
                                        {ROOM_STATUSES.map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="bg-[#16171E] px-3 py-2 rounded-sm border border-[#2C2D35]/60 text-sm">
                                        <span className={`inline-block px-2 py-0.5 text-[10px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(currentRoom.status)}`}>
                                            {STATUS_LABELS[currentRoom.status] ?? currentRoom.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amenities checklist/list */}
                        <div className="pt-2">
                            <label className="text-[10px] text-[#5A5C66] uppercase tracking-wider block mb-2">Tiện ích phòng</label>
                            {isEditing ? (
                                <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                                    {AMENITIES_LIST.map(({ key, label, icon }) => {
                                        const active = selectedAmenities.includes(key);
                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center gap-2 p-1.5 border rounded-sm cursor-pointer transition-all ${
                                                    active
                                                        ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]'
                                                        : 'bg-[#1F212A] border-[#2C2D35] text-[#5A5C66] hover:text-[#8A8D98]'
                                                }`}
                                                onClick={() => toggleAmenity(key)}
                                            >
                                                <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center ${active ? 'bg-[#C5A880] border-[#C5A880]' : 'border-[#3E404C]'}`}>
                                                    {active && <Check size={8} color="#000" strokeWidth={4} />}
                                                </div>
                                                <span className="text-[11px]">{icon} {label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedAmenities.length > 0 ? (
                                        selectedAmenities.map(key => {
                                            const a = AMENITIES_LIST.find(x => x.key === key);
                                            return a ? (
                                                <span key={key} className="flex items-center gap-1 bg-[#1F212A] border border-[#2C2D35] text-[#E4E6EB] text-[11px] px-2 py-1 rounded-sm">
                                                    {a.icon} {a.label}
                                                </span>
                                            ) : null;
                                        })
                                    ) : (
                                        <span className="text-xs text-[#5A5C66] italic">Chưa có tiện ích nào.</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Save / Cancel edits */}
                        {isEditing && (
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    className="rm-btn rm-btn-cancel py-1 px-3"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setForm({
                                            roomNumber: currentRoom.roomNumber ?? '',
                                            floor: currentRoom.floor ?? 1,
                                            basePrice: currentRoom.basePrice ?? 0,
                                            maxOccupants: currentRoom.maxOccupants ?? 1,
                                            status: currentRoom.status ?? 'Available',
                                        });
                                        setSelectedAmenities(parseAmenities(currentRoom.amenitiesJson));
                                    }}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="rm-btn rm-btn-primary py-1 px-4"
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                >
                                    {saving ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: Images & Upload */}
                    <div className="space-y-4 flex flex-col">
                        <h4 className="text-xs font-semibold text-[#8A8D98] uppercase tracking-wider">Hình ảnh phòng</h4>

                        {/* Direct Image upload */}
                        <div className="bg-[#1C1D24] p-3 rounded-sm border border-[#2C2D35]/60 flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-[#8A8D98] uppercase font-semibold">Tải ảnh mới lên</span>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-[#C5A880] select-none hover:underline">
                                    <input
                                        type="checkbox"
                                        checked={isCover}
                                        onChange={e => setIsCover(e.target.checked)}
                                        className="accent-[#C5A880] w-3 h-3 cursor-pointer"
                                    />
                                    Đặt làm ảnh bìa (Cover)
                                </label>
                            </div>
                            <button
                                className="rm-btn rm-btn-primary py-1.5 px-3 flex items-center gap-1.5 text-[10px] font-bold"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
                                Chọn ảnh
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleUploadImageFile}
                            />
                        </div>

                        {/* Image grid */}
                        <div className="flex-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                            {currentRoom.images?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Render cover first */}
                                    {coverImage && (
                                        <div className="col-span-2 h-36 relative rounded-sm overflow-hidden border border-[#2C2D35] group">
                                            <img src={coverImage.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                            <span className="absolute top-2 left-2 bg-black/60 text-[#C5A880] text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">Ảnh bìa</span>
                                            <button
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-[#E05252] text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteImage(coverImage.id)}
                                                disabled={deletingImageId === coverImage.id}
                                            >
                                                {deletingImageId === coverImage.id ? <RefreshCw size={10} className="animate-spin" /> : <Trash2 size={10} />}
                                            </button>
                                        </div>
                                    )}
                                    {otherImages.map((img) => (
                                        <div key={img.id} className="h-20 relative rounded-sm overflow-hidden border border-[#2C2D35] group">
                                            <img src={img.imageUrl} alt="Room" className="w-full h-full object-cover" />
                                            <button
                                                className="absolute top-1 right-1 bg-black/60 hover:bg-[#E05252] text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteImage(img.id)}
                                                disabled={deletingImageId === img.id}
                                            >
                                                {deletingImageId === img.id ? <RefreshCw size={10} className="animate-spin" /> : <Trash2 size={10} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-44 bg-[#16171E] border border-[#2C2D35] border-dashed flex flex-col items-center justify-center text-[#5A5C66] rounded-sm">
                                    <ImageIcon size={24} className="mb-2 opacity-50" />
                                    <span className="text-[10px] uppercase tracking-wider">Chưa có hình ảnh nào</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="rm-modal-footer flex justify-between">
                <button
                    className="rm-btn rm-btn-danger flex items-center gap-1.5"
                    onClick={handleDeleteRoom}
                    disabled={deletingRoom}
                >
                    {deletingRoom ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Xóa phòng
                </button>
                <button className="rm-btn rm-btn-cancel" onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    );
}

// ─── ROOM CARD ───────────────────────────────────────────────
function RoomCard({ room, onViewDetails }) {
    const coverImage = room.images?.find(i => i.isCover) ?? room.images?.[0];

    return (
        <div className="bg-[#16171E] border border-[#2C2D35] hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-col group relative overflow-hidden shadow-xl">

            {/* Image strip */}
            <div
                className="h-[90px] bg-[#0F1016] overflow-hidden cursor-pointer relative flex items-center justify-center"
                onClick={() => onViewDetails(room)}
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
                        <span className="text-[9px] text-[#5A5C66] uppercase tracking-wider">Không có ảnh</span>
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
                    <span className="font-mono font-medium text-[#C5A880]">
                        {formatPrice(room.basePrice)}<span className="text-[10px] text-[#5A5C66] font-sans"> / thg</span>
                    </span>
                </div>

                {/* Occupants row */}
                <div className="flex justify-between items-center">
                    <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Sức chứa</span>
                    <span className="text-white font-light flex items-center gap-1">
                        <Users size={10} />
                        {room.maxOccupants ?? '—'} người
                    </span>
                </div>
            </div>

            {/* Footer actions */}
            <div className="p-3 bg-[#1B1C24] border-t border-[#2C2D35] flex">
                <button
                    onClick={() => onViewDetails(room)}
                    className="w-full flex items-center justify-center gap-1.5 text-[#8A8D98] hover:text-[#5294E2] border border-[#2C2D35] hover:border-[#5294E2] bg-[#1F212A] text-[10px] uppercase font-semibold py-2 rounded-sm transition-all"
                >
                    <Eye size={12} /> Xem Chi Tiết
                </button>
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
                    onSaved={handleRoomSaved}
                    onDeleted={handleRoomDeleted}
                    showToast={showToast}
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