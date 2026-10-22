import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Search, Plus, Home, User, ChevronRight, Sparkles,
    Droplet, Zap, Eye, FileText, Activity, CheckCircle, CheckCircle2,
    Clock, X, Upload, Edit, Edit2, Trash2, DollarSign,
    Users, Package, Image, Check, AlertTriangle, RefreshCw,
    ChevronDown, Building2, Building, ImageIcon, LayoutGrid, List,
    Layers, Wrench, ShieldAlert, SlidersHorizontal, CheckSquare
} from 'lucide-react';
import {
    getRooms, createRoom, updateRoom, deleteRoom,
    uploadRoomImage, deleteRoomImage
} from '../api/roomApi';
import { getMaintenanceByRoom, markRoomStatus, createMaintenanceTicket } from '../api/maintenanceApi';
import { getProperties } from '../api/propertyApi';
import { formatImageUrl } from '../utils/imageHelper';

// ─── CONSTANTS ──────────────────────────────────────────────
const ROOM_STATUSES = ['Available', 'Occupied', 'Reserved', 'Maintenance'];

const STATUS_LABELS = {
    Available: 'Trống',
    Occupied: 'Đang ở',
    Reserved: 'Đã cọc',
    Maintenance: 'Bảo trì',
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
    { key: 'kitchen', label: 'Bếp riêng', icon: '🍳' },
    { key: 'desk', label: 'Bàn việc', icon: '💼' },
    { key: 'closet', label: 'Tủ áo', icon: '👔' },
    { key: 'security', label: 'An ninh/Cam', icon: '🔒' },
];

// ─── HELPERS ────────────────────────────────────────────────
function parseAmenities(json) {
    try { return json ? JSON.parse(json) : []; }
    catch { return []; }
}

function formatPrice(price) {
    if (!price && price !== 0) return '—';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function getStatusBadgeStyle(status, isDarkMode = true) {
    if (isDarkMode) {
        switch (status) {
            case 'Available':
                return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
            case 'Occupied':
                return 'bg-amber-500/15 text-[#D4AF37] border border-[#D4AF37]/35';
            case 'Reserved':
                return 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
            case 'Maintenance':
                return 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse';
            default:
                return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
        }
    } else {
        switch (status) {
            case 'Available':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'Occupied':
                return 'bg-amber-50 text-[#8A6212] border border-amber-300';
            case 'Reserved':
                return 'bg-sky-50 text-sky-700 border border-sky-200';
            case 'Maintenance':
                return 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse';
            default:
                return 'bg-slate-100 text-slate-600 border border-slate-200';
        }
    }
}

// ─── UNIFIED ROOM DETAILS & EDIT MODAL ─────────────────────────
function RoomDetailsModal({ room, propertyId, onClose, onSaved, onDeleted, showToast, theme, isDarkMode }) {
    const isCreate = !room;
    const [currentRoom, setCurrentRoom] = useState(room || {
        propertyId: propertyId,
        roomNumber: '',
        floor: 1,
        basePrice: 0,
        maxOccupants: 1,
        status: 'Available',
        images: []
    });

    const [isEditing, setIsEditing] = useState(isCreate);
    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'images' | 'maintenance'

    // Form fields state
    const [form, setForm] = useState({
        roomNumber: currentRoom.roomNumber ?? '',
        floor: currentRoom.floor ?? 1,
        basePrice: currentRoom.basePrice ?? 0,
        maxOccupants: currentRoom.maxOccupants ?? 1,
        status: currentRoom.status ?? 'Available',
    });
    const [maintenanceReason, setMaintenanceReason] = useState('');
    const [errors, setErrors] = useState({});
    const [selectedAmenities, setSelectedAmenities] = useState(() => parseAmenities(currentRoom.amenitiesJson));
    const [lightboxImage, setLightboxImage] = useState(null);

    // Upload & image states
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null);
    const [isCover, setIsCover] = useState(false);
    const fileInputRef = useRef();

    // Mảng lưu ảnh chưa tải lên (dành cho Create Mode)
    const [pendingFiles, setPendingFiles] = useState([]);
    const [deletingRoom, setDeletingRoom] = useState(false);

    // Maintenance history state
    const [maintenanceTickets, setMaintenanceTickets] = useState([]);
    const [loadingMaintenance, setLoadingMaintenance] = useState(false);
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(1);
    const [maintenancePrompt, setMaintenancePrompt] = useState(null);

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
        onSaved(newRoom);
    };

    const fetchMaintenance = useCallback(async (p = 1) => {
        if (isCreate || !currentRoom.id) return;
        setLoadingMaintenance(true);
        try {
            const data = await getMaintenanceByRoom(currentRoom.id, p, 5);
            setMaintenanceTickets(data?.items || []);
            setMaintenanceTotalPages(data?.totalPages || 1);
            setMaintenancePage(p);
        } catch (err) {
            console.error('Fetch maintenance error', err);
        } finally {
            setLoadingMaintenance(false);
        }
    }, [currentRoom.id, isCreate]);

    useEffect(() => {
        if (activeTab === 'maintenance') {
            fetchMaintenance(1);
        }
    }, [activeTab, fetchMaintenance]);

    const handleMarkMaintenance = async (newStatus, desc) => {
        setMaintenancePrompt(null);
        if (!desc && newStatus === 'Maintenance') desc = 'Bảo trì phòng';
        if (!desc && newStatus === 'Available') desc = 'Hoàn tất bảo trì';
        setSaving(true);
        try {
            const accountData = localStorage.getItem('ns_account');
            let organizationId = '412a98e1-5efa-4109-be90-83db01cd05c5';
            if (accountData) {
                const parsed = JSON.parse(accountData);
                if (parsed.organizationId) organizationId = parsed.organizationId;
            }
            const res = await markRoomStatus(currentRoom.id, {
                status: newStatus,
                organizationId,
                description: desc
            });
            const finalStatus = res?.status || newStatus;
            showToast(`Đã chuyển phòng sang trạng thái ${STATUS_LABELS[finalStatus] || finalStatus}!`, 'success');
            updateLocalRoomState({ ...currentRoom, status: finalStatus });
            if (activeTab === 'maintenance') fetchMaintenance(1);
        } catch (err) {
            showToast(err.message || 'Lỗi khi cập nhật trạng thái', 'error');
        } finally {
            setSaving(false);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.roomNumber.trim()) e.roomNumber = 'Mã phòng không được để trống';
        if (Number(form.basePrice) <= 0) e.basePrice = 'Giá thuê phải lớn hơn 0';
        if (Number(form.floor) < 1) e.floor = 'Số tầng phải từ 1 trở lên';
        if (Number(form.maxOccupants) < 1) e.maxOccupants = 'Sức chứa tối thiểu 1 người';
        if (form.status === 'Maintenance' && !maintenanceReason.trim() && isCreate) {
            e.maintenanceReason = 'Vui lòng nhập lý do bảo trì khi tạo phòng mới';
        }
        return e;
    };

    const handleSaveChanges = async () => {
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            if (activeTab !== 'info') setActiveTab('info');
            return;
        }

        setSaving(true);
        try {
            let savedRoom;
            if (isCreate) {
                const initialStatus = form.status === 'Maintenance' ? 'Available' : form.status;
                const payload = {
                    propertyId: currentRoom.propertyId,
                    roomNumber: form.roomNumber.trim(),
                    floor: Number(form.floor),
                    basePrice: Number(form.basePrice),
                    maxOccupants: Number(form.maxOccupants),
                    status: initialStatus,
                    amenitiesJson: selectedAmenities.length ? JSON.stringify(selectedAmenities) : null,
                };
                savedRoom = await createRoom(payload);

                if (form.status === 'Maintenance') {
                    const accountData = localStorage.getItem('ns_account');
                    let organizationId = '';
                    if (accountData) {
                        try { organizationId = JSON.parse(accountData).organizationId; } catch (_) {}
                    }
                    await markRoomStatus(savedRoom.id, {
                        status: 'Maintenance',
                        organizationId: organizationId || '412a98e1-5efa-4109-be90-83db01cd05c5',
                        description: maintenanceReason || 'Bảo trì phòng mới'
                    });
                    savedRoom.status = 'Maintenance';
                }

                // Tải ảnh pending lên
                for (let i = 0; i < pendingFiles.length; i++) {
                    const fileObj = pendingFiles[i];
                    try {
                        await uploadRoomImage(savedRoom.id, fileObj.file, fileObj.isCover);
                    } catch (e) {
                        console.error('Failed to upload image', fileObj.file.name, e);
                    }
                }
                showToast('Đã thêm phòng mới thành công!', 'success');
                const data = await getRooms({ propertyId: currentRoom.propertyId });
                const roomsArray = data?.items || data?.data || data || [];
                const finalRoom = roomsArray.find(r => r.id === savedRoom.id) || savedRoom;
                onClose();
                onSaved(finalRoom);
                return;
            } else {
                const payload = {
                    roomNumber: form.roomNumber.trim(),
                    floor: Number(form.floor),
                    basePrice: Number(form.basePrice),
                    maxOccupants: Number(form.maxOccupants),
                    status: form.status,
                    amenitiesJson: selectedAmenities.length ? JSON.stringify(selectedAmenities) : null,
                    rowVersion: currentRoom.rowVersion,
                };
                savedRoom = await updateRoom(currentRoom.id, payload);
                showToast('Đã lưu thông tin phòng thành công!', 'success');
                updateLocalRoomState(savedRoom);
                setIsEditing(false);
            }
        } catch (err) {
            showToast(err.message || 'Lỗi khi lưu thông tin phòng', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleAmenity = (key) => {
        setSelectedAmenities(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleDeleteImage = async (imageId, isPending = false, pendingIndex = -1) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
        if (isPending) {
            setPendingFiles(prev => prev.filter((_, idx) => idx !== pendingIndex));
            return;
        }
        setDeletingImageId(imageId);
        try {
            await deleteRoomImage(currentRoom.id, imageId);
            showToast('Đã xóa ảnh thành công!', 'success');
            const updatedImages = currentRoom.images.filter(img => img.id !== imageId);
            const updatedRoom = { ...currentRoom, images: updatedImages };
            updateLocalRoomState(updatedRoom);
        } catch (err) {
            showToast(err.message || 'Lỗi xóa ảnh', 'error');
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleUploadImageFile = async (e, forceCover = false) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const makeCover = forceCover || isCover;

        if (isCreate) {
            setPendingFiles(prev => [...prev, {
                file,
                isCover: makeCover,
                preview: URL.createObjectURL(file)
            }]);
            setIsCover(false);
            showToast('Đã thêm ảnh vào danh sách chờ lưu', 'success');
            return;
        }

        setUploading(true);
        try {
            await uploadRoomImage(currentRoom.id, file, makeCover);
            showToast('Đã tải ảnh lên thành công!', 'success');
            const data = await getRooms({ propertyId: currentRoom.propertyId });
            const roomsArray = data?.items || data?.data || data || [];
            const updated = roomsArray.find(r => r.id === currentRoom.id);
            if (updated) updateLocalRoomState(updated);
        } catch (err) {
            showToast(err.message || 'Lỗi tải ảnh lên', 'error');
        } finally {
            setUploading(false);
            setIsCover(false);
        }
    };

    const handleDeleteRoom = async () => {
        if (!window.confirm(`Hành động này sẽ XÓA VĨNH VIỄN phòng ${currentRoom.roomNumber}. Bạn có chắc chắn?`)) return;
        setDeletingRoom(true);
        try {
            await deleteRoom(currentRoom.id);
            showToast(`Đã xóa phòng ${currentRoom.roomNumber} thành công!`, 'success');
            onDeleted(currentRoom.id);
        } catch (err) {
            showToast(err.message || 'Lỗi xóa phòng', 'error');
        } finally {
            setDeletingRoom(false);
        }
    };

    let allImages = [...(currentRoom.images || [])];
    let coverImage = allImages.find(i => i.isCover);
    let pendingCover = pendingFiles.find(i => i.isCover);
    const otherImages = allImages.filter(i => i !== coverImage) ?? [];
    const otherPending = pendingFiles.filter(i => i !== pendingCover) ?? [];

    if (!coverImage && pendingFiles.length > 0) {
        if (pendingCover) coverImage = { imageUrl: pendingCover.preview, isPending: true, file: pendingCover.file };
        else coverImage = { imageUrl: pendingFiles[0].preview, isPending: true, file: pendingFiles[0].file };
    } else if (coverImage) {
        coverImage = { ...coverImage, isPending: false };
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-all ${theme.panel}`}>
                
                {/* MODAL HEADER */}
                <div className={`p-5 md:p-6 border-b flex items-center justify-between ${theme.border}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                            <Home className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`text-lg md:text-xl font-black tracking-tight ${theme.title}`}>
                                    {isCreate ? 'Khởi Tạo Phòng Trọ Mới' : `Chi Tiết Phòng ${currentRoom.roomNumber}`}
                                </h3>
                                {!isCreate && (
                                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(currentRoom.status, isDarkMode)}`}>
                                        {STATUS_LABELS[currentRoom.status] || currentRoom.status}
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                {isCreate ? 'Điền các thông số cơ bản và tiện nghi để đưa phòng vào vận hành' : `Quản lý bảng giá, tiện nghi, hình ảnh và lịch sử bảo dưỡng`}
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

                {/* MODAL TABS */}
                <div className={`flex border-b px-6 gap-2 pt-3 ${theme.border} ${theme.panelSoft}`}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'info'
                                ? 'border-[#D4AF37] text-[#D4AF37]'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Thông Tin & Tiện Nghi
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('images')}
                        className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'images'
                                ? 'border-[#D4AF37] text-[#D4AF37]'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" /> Album Ảnh
                        {(allImages.length > 0 || pendingFiles.length > 0) && (
                            <span className="text-[10px] bg-[#D4AF37] text-black px-1.5 py-0.2 rounded-full font-black">
                                {allImages.length + pendingFiles.length}
                            </span>
                        )}
                    </button>
                    {!isCreate && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('maintenance')}
                            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                                activeTab === 'maintenance'
                                    ? 'border-[#D4AF37] text-[#D4AF37]'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            <Wrench className="w-3.5 h-3.5" /> Lịch Sử Bảo Trì
                        </button>
                    )}
                </div>

                {/* MODAL BODY */}
                <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">

                    {/* ── TAB 1: THÔNG TIN PHÒNG ── */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> THÔNG SỐ VẬN HÀNH PHÒNG
                                </span>
                                {!isCreate && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                                            isEditing
                                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                                : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20'
                                        }`}
                                    >
                                        <Edit className="w-3.5 h-3.5" /> {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Mã số / Số phòng <span className="text-rose-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={form.roomNumber}
                                            onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))}
                                            placeholder="Ví dụ: P101, Phòng 202..."
                                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold border transition-all ${theme.input}`}
                                        />
                                    ) : (
                                        <div className={`rounded-xl px-4 py-3 border text-sm font-black ${theme.panelSoft} ${theme.title}`}>
                                            Phòng {currentRoom.roomNumber}
                                        </div>
                                    )}
                                    {errors.roomNumber && <p className="text-xs text-rose-400 mt-1 font-semibold">{errors.roomNumber}</p>}
                                </div>

                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Vị trí Tầng <span className="text-rose-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.floor}
                                            onChange={e => setForm(p => ({ ...p, floor: e.target.value }))}
                                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold border transition-all ${theme.input}`}
                                        />
                                    ) : (
                                        <div className={`rounded-xl px-4 py-3 border text-sm font-black ${theme.panelSoft} ${theme.title}`}>
                                            Tầng {currentRoom.floor}
                                        </div>
                                    )}
                                    {errors.floor && <p className="text-xs text-rose-400 mt-1 font-semibold">{errors.floor}</p>}
                                </div>

                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Giá thuê niêm yết (VNĐ/tháng) <span className="text-rose-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            step="50000"
                                            value={form.basePrice}
                                            onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                                            className={`w-full rounded-xl px-4 py-3 text-sm font-mono font-bold border transition-all ${theme.input}`}
                                        />
                                    ) : (
                                        <div className={`rounded-xl px-4 py-3 border text-sm font-mono font-black text-[#D4AF37] ${theme.panelSoft}`}>
                                            {formatPrice(currentRoom.basePrice)} / tháng
                                        </div>
                                    )}
                                    {errors.basePrice && <p className="text-xs text-rose-400 mt-1 font-semibold">{errors.basePrice}</p>}
                                </div>

                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Sức chứa tối đa (người) <span className="text-rose-500">*</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={form.maxOccupants}
                                            onChange={e => setForm(p => ({ ...p, maxOccupants: e.target.value }))}
                                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold border transition-all ${theme.input}`}
                                        />
                                    ) : (
                                        <div className={`rounded-xl px-4 py-3 border text-sm font-black flex items-center gap-2 ${theme.panelSoft} ${theme.title}`}>
                                            <Users className="w-4 h-4 text-[#D4AF37]" /> {currentRoom.maxOccupants || 1} người
                                        </div>
                                    )}
                                    {errors.maxOccupants && <p className="text-xs text-rose-400 mt-1 font-semibold">{errors.maxOccupants}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Trạng thái hoạt động
                                    </label>
                                    {isEditing ? (
                                        <select
                                            value={form.status}
                                            onChange={e => {
                                                setForm(p => ({ ...p, status: e.target.value }));
                                                if (e.target.value !== 'Maintenance') setMaintenanceReason('');
                                            }}
                                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold border transition-all ${theme.input}`}
                                        >
                                            {ROOM_STATUSES.map(s => (
                                                <option key={s} value={s} className="bg-[#11111A] text-white">
                                                    {STATUS_LABELS[s] || s}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className={`rounded-xl px-4 py-3 border text-sm font-black w-max ${getStatusBadgeStyle(currentRoom.status, isDarkMode)}`}>
                                            {STATUS_LABELS[currentRoom.status] || currentRoom.status}
                                        </div>
                                    )}

                                    {/* Lý do bảo trì nếu chọn trạng thái bảo trì */}
                                    {isEditing && form.status === 'Maintenance' && (
                                        <div className="mt-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4" /> Lý do bảo trì / sửa chữa (Tạo phiếu bảo trì)
                                            </span>
                                            <textarea
                                                rows={2}
                                                value={maintenanceReason}
                                                onChange={e => setMaintenanceReason(e.target.value)}
                                                placeholder="Mô tả sự cố (VD: Hỏng vòi sen, sơn lại tường, sửa điều hòa...)"
                                                className={`w-full rounded-xl px-4 py-2.5 text-xs border resize-none ${theme.input}`}
                                            />
                                            {errors.maintenanceReason && (
                                                <p className="text-xs text-rose-400 font-semibold">{errors.maintenanceReason}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tiện ích trang bị */}
                            <div className="pt-4 border-t border-inherit/40 space-y-3">
                                <div>
                                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5" /> DANH MỤC TIỆN NGHI TRANG BỊ
                                    </span>
                                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                        {isEditing ? 'Nhấp chọn tiện ích có sẵn trong phòng' : 'Các trang thiết bị phục vụ khách thuê trong phòng'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                    {AMENITIES_LIST.map(({ key, label, icon }) => {
                                        const isSelected = selectedAmenities.includes(key);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                disabled={!isEditing}
                                                onClick={() => isEditing && toggleAmenity(key)}
                                                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                                                    isSelected
                                                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm'
                                                        : `${theme.panelSoft} ${theme.textMuted} hover:border-[#D4AF37]/40`
                                                } ${!isEditing ? 'cursor-default opacity-85' : 'cursor-pointer hover:scale-[1.02]'}`}
                                            >
                                                <span className="text-base">{icon}</span>
                                                <span className="flex-1 truncate">{label}</span>
                                                {isSelected && (
                                                    <Check className="w-3.5 h-3.5 text-[#D4AF37] stroke-[3]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: HÌNH ẢNH PHÒNG ── */}
                    {activeTab === 'images' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5" /> BỘ SƯU TẬP HÌNH ẢNH
                                    </span>
                                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                        Ảnh bìa đại diện được ưu tiên hiển thị trên danh sách và hợp đồng
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <label className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${theme.buttonOutline}`}>
                                        <Upload className="w-3.5 h-3.5" /> Thêm Ảnh
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={(e) => handleUploadImageFile(e, false)}
                                            disabled={uploading}
                                        />
                                    </label>
                                    <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-[#D4AF37] hover:bg-[#c49f2e] text-black cursor-pointer shadow-md transition-all">
                                        <Sparkles className="w-3.5 h-3.5" /> Thêm Ảnh Bìa
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleUploadImageFile(e, true)}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            {uploading && (
                                <div className={`p-6 rounded-2xl border border-dashed flex items-center justify-center gap-3 ${theme.panelSoft}`}>
                                    <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                                    <span className="text-xs font-bold text-[#D4AF37]">Đang tải hình ảnh lên hệ thống...</span>
                                </div>
                            )}

                            {/* Empty state */}
                            {!uploading && allImages.length === 0 && pendingFiles.length === 0 ? (
                                <div className={`p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 ${theme.panelSoft}`}>
                                    <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <h4 className={`text-sm font-bold ${theme.title}`}>Chưa có hình ảnh nào</h4>
                                    <p className={`text-xs ${theme.textMuted} max-w-sm`}>
                                        Tải lên các góc chụp đẹp của căn phòng để người thuê dễ hình dung không gian sống.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-xl shadow-md uppercase tracking-wider"
                                    >
                                        Chọn ảnh từ máy
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Ảnh Bìa */}
                                    {coverImage && (
                                        <div>
                                            <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-2">
                                                ẢNH BÌA CHÍNH
                                            </span>
                                            <div
                                                className="h-60 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 relative group cursor-pointer shadow-lg"
                                                onClick={() => setLightboxImage(coverImage.isPending ? coverImage.imageUrl : formatImageUrl(coverImage.imageUrl))}
                                            >
                                                <img
                                                    src={coverImage.isPending ? coverImage.imageUrl : formatImageUrl(coverImage.imageUrl)}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                                                    Ảnh bìa đại diện
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (coverImage.isPending) {
                                                            const idx = pendingFiles.findIndex(p => p.preview === coverImage.imageUrl);
                                                            handleDeleteImage(null, true, idx);
                                                        } else {
                                                            handleDeleteImage(coverImage.id);
                                                        }
                                                    }}
                                                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-rose-500 text-white transition-all opacity-0 group-hover:opacity-100 shadow"
                                                    title="Xóa ảnh bìa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Các ảnh khác */}
                                    {(otherImages.length > 0 || otherPending.length > 0) && (
                                        <div className="pt-2">
                                            <span className={`text-[10px] font-black tracking-widest uppercase block mb-2 ${theme.textMutedSoft}`}>
                                                ẢNH CHI TIẾT KHÁC ({otherImages.length + otherPending.length})
                                            </span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {otherImages.map((img) => (
                                                    <div
                                                        key={img.id}
                                                        className="h-28 rounded-xl overflow-hidden border border-inherit/40 relative group cursor-pointer shadow-sm hover:border-[#D4AF37]"
                                                        onClick={() => setLightboxImage(formatImageUrl(img.imageUrl))}
                                                    >
                                                        <img
                                                            src={formatImageUrl(img.imageUrl)}
                                                            alt="Room detail"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteImage(img.id);
                                                            }}
                                                            disabled={deletingImageId === img.id}
                                                            className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            {deletingImageId === img.id ? (
                                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))}

                                                {otherPending.map((p, idx) => (
                                                    <div
                                                        key={`pending_${idx}`}
                                                        className="h-28 rounded-xl overflow-hidden border border-dashed border-amber-500/60 relative group cursor-pointer"
                                                        onClick={() => setLightboxImage(p.preview)}
                                                    >
                                                        <img
                                                            src={p.preview}
                                                            alt="Pending room"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                                            Chờ lưu
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const realIdx = pendingFiles.findIndex(pf => pf.preview === p.preview);
                                                                handleDeleteImage(null, true, realIdx);
                                                            }}
                                                            className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB 3: BẢO TRÌ PHÒNG ── */}
                    {activeTab === 'maintenance' && !isCreate && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                        <Wrench className="w-3.5 h-3.5" /> TIẾN ĐỘ BẢO DƯỠNG & SỰ CỐ
                                    </span>
                                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                        Ghi nhận lịch sử kiểm tra kỹ thuật, thay thế thiết bị hoặc báo hỏng
                                    </p>
                                </div>
                                <div>
                                    {currentRoom.status !== 'Maintenance' ? (
                                        <button
                                            type="button"
                                            onClick={() => setMaintenancePrompt('Maintenance')}
                                            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all flex items-center gap-2"
                                        >
                                            <AlertTriangle className="w-4 h-4" /> Báo Sự Cố / Bảo Trì
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setMaintenancePrompt('Available')}
                                            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Hoàn Tất Bảo Trì
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Prompt box */}
                            {maintenancePrompt && (
                                <div className={`p-5 rounded-2xl border space-y-3 shadow-lg ${theme.panelSoft}`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider ${theme.title}`}>
                                        {maintenancePrompt === 'Maintenance' ? 'Xác nhận đưa phòng vào chế độ bảo trì' : 'Đánh dấu đã hoàn tất sửa chữa'}
                                    </h4>
                                    <textarea
                                        id="modal-maintenance-reason-input"
                                        rows={3}
                                        placeholder={maintenancePrompt === 'Maintenance' ? 'Nhập chi tiết sự cố cần xử lý...' : 'Ghi chú khắc phục (VD: Đã thay thế vòi nước mới)...'}
                                        className={`w-full rounded-xl px-4 py-3 text-xs border resize-none ${theme.input}`}
                                    />
                                    <div className="flex justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setMaintenancePrompt(null)}
                                            className={`px-4 py-2 text-xs font-bold rounded-xl border ${theme.buttonOutline}`}
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const el = document.getElementById('modal-maintenance-reason-input');
                                                handleMarkMaintenance(maintenancePrompt, el ? el.value : '');
                                            }}
                                            className={`px-5 py-2 text-xs font-black uppercase rounded-xl shadow-md transition-all ${
                                                maintenancePrompt === 'Maintenance'
                                                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            }`}
                                        >
                                            Xác Nhận
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Ticket list */}
                            <div className="space-y-3">
                                {loadingMaintenance ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                                        <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                                        <span className={`text-xs ${theme.textMuted}`}>Đang tải dữ liệu bảo trì...</span>
                                    </div>
                                ) : maintenanceTickets.length === 0 ? (
                                    <div className={`p-8 text-center rounded-2xl border border-dashed ${theme.panelSoft}`}>
                                        <p className={`text-xs ${theme.textMuted}`}>Phòng hiện chưa ghi nhận lịch sử sự cố nào.</p>
                                    </div>
                                ) : (
                                    <>
                                        {maintenanceTickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${theme.panelSoft}`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                    ticket.status === 'Resolved'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                    {ticket.status === 'Resolved' ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : (
                                                        <Clock className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h5 className={`text-xs font-bold ${theme.title}`}>
                                                            {ticket.userDescription || 'Bảo dưỡng định kỳ'}
                                                        </h5>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                            ticket.status === 'Resolved'
                                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                                : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                            {ticket.status === 'Resolved' ? 'Đã hoàn tất' : 'Đang xử lý'}
                                                        </span>
                                                    </div>
                                                    <div className={`text-[10px] ${theme.textMutedSoft} flex items-center gap-3 mt-1.5`}>
                                                        <span>Ngày tạo: {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
                                                        {ticket.completedAt && (
                                                            <span>• Hoàn tất: {new Date(ticket.completedAt).toLocaleDateString('vi-VN')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {maintenanceTotalPages > 1 && (
                                            <div className="flex justify-center items-center gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    disabled={maintenancePage === 1}
                                                    onClick={() => fetchMaintenance(maintenancePage - 1)}
                                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${theme.buttonOutline} disabled:opacity-40`}
                                                >
                                                    Trước
                                                </button>
                                                <span className={`text-xs font-mono ${theme.textMutedSoft}`}>
                                                    {maintenancePage} / {maintenanceTotalPages}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={maintenancePage === maintenanceTotalPages}
                                                    onClick={() => fetchMaintenance(maintenancePage + 1)}
                                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${theme.buttonOutline} disabled:opacity-40`}
                                                >
                                                    Sau
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div className={`p-5 md:p-6 border-t flex flex-wrap items-center justify-between gap-3 ${theme.border} ${theme.panelSoft}`}>
                    <div>
                        {!isCreate && (
                            <button
                                type="button"
                                onClick={handleDeleteRoom}
                                disabled={deletingRoom}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all disabled:opacity-50"
                            >
                                {deletingRoom ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Xóa Phòng
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${theme.buttonOutline}`}
                        >
                            Đóng
                        </button>
                        {(isEditing || isCreate) && (
                            <button
                                type="button"
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#D4AF37] hover:bg-[#c49f2e] text-black shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                                {isCreate ? 'Tạo Phòng Ngay' : 'Lưu Thay Đổi'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* LIGHTBOX FULL IMAGE */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Zoomed room view"
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

// ─── ROOM CARD COMPONENT (LUXURY GRID) ────────────────────────
function RoomCard({ room, onViewDetails, theme, isDarkMode }) {
    const coverImage = room.images?.find(i => i.isCover) ?? room.images?.[0];
    const amenities = parseAmenities(room.amenitiesJson);

    return (
        <div className={`${theme.panel} rounded-2xl border hover:border-[#D4AF37]/60 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#D4AF37]/5 flex flex-col group relative`}>
            
            {/* Image Banner */}
            <div
                className="h-48 overflow-hidden cursor-pointer relative bg-gradient-to-br from-[#161622] to-[#0B0B12]"
                onClick={() => onViewDetails(room)}
            >
                {coverImage ? (
                    <img
                        src={formatImageUrl(coverImage.imageUrl)}
                        alt={`Phòng ${room.roomNumber}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40 gap-2">
                        <Home className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                            Chưa cập nhật ảnh
                        </span>
                    </div>
                )}

                {/* Floating Top Left: Floor Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 shadow">
                    Tầng {room.floor}
                </div>

                {/* Floating Top Right: Status Badge */}
                <div className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md backdrop-blur-md ${getStatusBadgeStyle(room.status, isDarkMode)}`}>
                    {STATUS_LABELS[room.status] || room.status}
                </div>

                {/* Floating Bottom Right: Images count */}
                {room.images?.length > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#D4AF37]/20 flex items-center gap-1 shadow">
                        <ImageIcon className="w-3 h-3" /> {room.images.length}
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                    <div className="flex items-baseline justify-between gap-2">
                        <h4
                            onClick={() => onViewDetails(room)}
                            className={`text-lg font-black tracking-tight ${theme.title} group-hover:text-[#D4AF37] transition-colors cursor-pointer`}
                        >
                            Phòng {room.roomNumber}
                        </h4>
                        <div className="text-right">
                            <span className="text-base font-black text-[#D4AF37] font-mono">
                                {formatPrice(room.basePrice)}
                            </span>
                            <span className={`text-[10px] ${theme.textMutedSoft} block font-medium`}>
                                / tháng
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {room.maxOccupants || 1} người
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Tầng {room.floor}
                        </span>
                    </div>
                </div>

                {/* Amenities pills */}
                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {amenities.slice(0, 3).map((key) => {
                            const found = AMENITIES_LIST.find(a => a.key === key);
                            return (
                                <span
                                    key={key}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${theme.panelSoft} text-gray-300`}
                                >
                                    <span>{found?.icon || '✦'}</span>
                                    <span>{found?.label || key}</span>
                                </span>
                            );
                        })}
                        {amenities.length > 3 && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${theme.panelSoft} text-[#D4AF37]`}>
                                +{amenities.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Card Action Button */}
            <div className={`p-3.5 border-t ${theme.border}/40 bg-black/5 flex items-center gap-2`}>
                <button
                    type="button"
                    onClick={() => onViewDetails(room)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        isDarkMode
                            ? 'bg-white/5 hover:bg-[#D4AF37] hover:text-black text-gray-200 border border-white/10'
                            : 'bg-amber-50 hover:bg-[#D4AF37] hover:text-black text-slate-800 border border-[#E5D4AD]'
                    }`}
                >
                    <Eye className="w-3.5 h-3.5" /> Quản Lý & Chi Tiết
                </button>
            </div>
        </div>
    );
}

// ─── SKELETON LOADER ──────────────────────────────────────────
function SkeletonCard({ theme }) {
    return (
        <div className={`${theme.panel} rounded-2xl overflow-hidden border shadow-sm animate-pulse`}>
            <div className="h-48 bg-white/5" />
            <div className="p-5 space-y-3">
                <div className="h-4 bg-white/10 rounded-md w-2/3" />
                <div className="h-3 bg-white/5 rounded-md w-1/2" />
                <div className="h-3 bg-white/5 rounded-md w-3/4" />
            </div>
            <div className="p-3.5 bg-white/5 border-t border-white/5">
                <div className="h-8 bg-white/10 rounded-xl" />
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function RoomManagementSubPage({ isDarkMode = true, propertyId: propPropertyId }) {
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

    // State
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedPropertyId, setSelectedPropertyId] = useState(propPropertyId ?? '');
    const [toast, setToast] = useState(null);
    const [properties, setProperties] = useState([]);

    // Pagination & View Mode
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [totalRooms, setTotalRooms] = useState(0);

    // Modal
    const [modal, setModal] = useState(null); // { type: 'details' | 'create', room: ... }

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // Load Properties
    useEffect(() => {
        if (propPropertyId) return;
        async function fetchProps() {
            try {
                const accountStr = localStorage.getItem('ns_account');
                if (accountStr) {
                    const orgId = JSON.parse(accountStr).organizationId;
                    if (orgId) {
                        const data = await getProperties(orgId);
                        const list = data?.items || [];
                        setProperties(list);
                        if (list.length > 0 && !selectedPropertyId) {
                            setSelectedPropertyId(list[0].id);
                        }
                    }
                }
            } catch (err) {
                console.error('Lỗi tải danh sách cơ sở', err);
            }
        }
        fetchProps();
    }, [propPropertyId]);

    // Fetch rooms
    const fetchRooms = useCallback(async (currentPage = 1) => {
        if (!selectedPropertyId) return;
        setLoading(true);
        try {
            const data = await getRooms({
                propertyId: selectedPropertyId,
                search: searchTerm.trim(),
                status: statusFilter !== 'All' ? statusFilter : '',
                pageIndex: currentPage,
                pageSize: 12
            });
            setRooms(data?.items || []);
            setTotalPages(data?.totalPages || 1);
            setTotalRooms(data?.totalCount || 0);
            setPage(currentPage);
        } catch (err) {
            showToast(err.message || 'Lỗi tải danh sách phòng', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedPropertyId, searchTerm, statusFilter, showToast]);

    useEffect(() => {
        const timer = setTimeout(() => fetchRooms(1), 300);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, selectedPropertyId]);

    // KPIs calculation
    const total = totalRooms;
    const occupied = useMemo(() => rooms.filter(r => r.status === 'Occupied').length, [rooms]);
    const available = useMemo(() => rooms.filter(r => r.status === 'Available').length, [rooms]);
    const reserved = useMemo(() => rooms.filter(r => r.status === 'Reserved').length, [rooms]);
    const maintenance = useMemo(() => rooms.filter(r => r.status === 'Maintenance').length, [rooms]);
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

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

    const currentPropertyName = useMemo(() => {
        const p = properties.find(item => item.id === selectedPropertyId);
        return p?.propertyName || 'Toàn Hệ Thống';
    }, [properties, selectedPropertyId]);

    return (
        <div className={`w-full min-h-full transition-colors duration-300 ${theme.bg} font-sans p-6 lg:p-8 space-y-6 relative`}>

            {/* ── 1. HEADER SECTION ── */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${theme.border} pb-5`}>
                <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" /> HỆ THỐNG PHÒNG NGHỈ & VẬN HÀNH
                    </span>
                    <h2 className={`text-2xl font-black tracking-tight ${theme.title} mt-0.5`}>
                        Quản Lý Danh Sách Phòng Trọ
                    </h2>
                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                        Theo dõi trạng thái phòng, công suất lấp đầy, bảng giá cho thuê và bảo dưỡng thiết bị.
                    </p>
                </div>

                {/* Facility Selector */}
                <div className={`flex items-center gap-2.5 text-xs font-bold px-3.5 py-2 rounded-2xl border ${theme.panelSoft}`}>
                    <Building className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className={`${theme.textMuted} shrink-0`}>Cơ sở:</span>
                    <select
                        value={selectedPropertyId}
                        onChange={e => setSelectedPropertyId(e.target.value)}
                        className="bg-transparent text-[#D4AF37] font-black focus:outline-none cursor-pointer pr-2 max-w-[200px] truncate"
                    >
                        {properties.length === 0 && <option value="">Đang tải cơ sở...</option>}
                        {properties.map(p => (
                            <option key={p.id} value={p.id} className="bg-[#11111A] text-white">
                                {p.propertyName || `Cơ sở ${p.id.substring(0, 8)}`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── 2. METRIC / KPI CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {/* Metric 1 */}
                <div className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 shadow-sm flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Tổng Quy Mô Phòng
                        </span>
                        <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black tracking-tight ${theme.title}`}>
                                {total}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>phòng toàn chuỗi</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] w-full" />
                        </div>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 shadow-sm flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Đang Cho Thuê
                        </span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-[#D4AF37]">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline justify-between">
                            <span className={`text-3xl font-black tracking-tight ${theme.title}`}>
                                {occupied}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                                Lấp đầy {occupancyRate}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-[#D4AF37]"
                                style={{ width: `${Math.min(100, occupancyRate)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 shadow-sm flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Phòng Trống Sẵn Sàng
                        </span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Home className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tight text-emerald-400">
                                {available}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>sẵn sàng bàn giao</span>
                        </div>
                        <p className={`text-[10px] font-semibold text-emerald-400/80 mt-1`}>
                            Tỷ lệ trống: {total > 0 ? Math.round((available / total) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 shadow-sm flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Cọc & Đang Sửa Chữa
                        </span>
                        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                            <Wrench className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black tracking-tight ${theme.title}`}>
                                {reserved + maintenance}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>phòng biến động</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                            <span className="text-sky-400">Đã cọc: {reserved}</span>
                            <span>•</span>
                            <span className="text-rose-400">Bảo trì: {maintenance}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 3. ACTION & FILTER BAR ── */}
            <div className={`p-3 md:p-4 rounded-2xl border ${theme.panelSoft} flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3`}>
                
                {/* Left: Search & View Toggle */}
                <div className="flex items-center gap-2.5 flex-1 max-w-md">
                    <div className={`flex items-center border rounded-xl px-3.5 py-2 w-full ${theme.input}`}>
                        <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm theo số phòng, tầng..."
                            className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:inherit min-w-0"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-white text-xs ml-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* View mode toggle */}
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
                            title="Xem dạng bảng danh sách"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Status Filters & CTA */}
                <div className="flex flex-wrap items-center gap-2 justify-end">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-1">
                        {[
                            { id: 'All', label: 'Tất cả' },
                            { id: 'Available', label: 'Trống' },
                            { id: 'Occupied', label: 'Đang ở' },
                            { id: 'Reserved', label: 'Đã cọc' },
                            { id: 'Maintenance', label: 'Bảo trì' },
                        ].map(({ id, label }) => {
                            const count = id === 'All'
                                ? rooms.length
                                : rooms.filter(r => r.status === id).length;

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setStatusFilter(id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                                        statusFilter === id ? theme.cardActive : theme.cardIdle
                                    }`}
                                >
                                    <span>{label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                        statusFilter === id ? 'bg-black/20 text-black' : 'bg-white/10 text-[#D4AF37]'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={() => fetchRooms(page)}
                        disabled={loading}
                        className={`p-2 rounded-xl border transition-all ${theme.buttonOutline}`}
                        title="Tải lại danh sách phòng"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                    </button>

                    {/* Add Room Button */}
                    <button
                        type="button"
                        onClick={() => {
                            if (!selectedPropertyId) {
                                showToast('Vui lòng chọn cơ sở trước khi thêm phòng', 'error');
                                return;
                            }
                            setModal({ type: 'create' });
                        }}
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-[#D4AF37]/20 transition-all flex items-center gap-1.5 shrink-0"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" /> Thêm Phòng Mới
                    </button>
                </div>
            </div>

            {/* ── 4. ROOMS CONTENT: GRID HOẶC TABLE ── */}
            {!selectedPropertyId ? (
                <div className={`p-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 ${theme.panelSoft}`}>
                    <Building2 className="w-10 h-10 text-[#D4AF37] opacity-60" />
                    <h3 className={`text-sm font-bold ${theme.title}`}>Vui lòng chọn một cơ sở lưu trú</h3>
                    <p className={`text-xs ${theme.textMuted}`}>Chọn cơ sở ở góc phải bên trên để xem toàn bộ danh sách phòng tương ứng.</p>
                </div>
            ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} theme={theme} />)}
                </div>
            ) : rooms.length === 0 ? (
                <div className={`p-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 ${theme.panelSoft}`}>
                    <Home className="w-10 h-10 text-gray-500 stroke-[1.5]" />
                    <h3 className={`text-sm font-bold ${theme.title}`}>Không tìm thấy phòng trọ phù hợp</h3>
                    <p className={`text-xs ${theme.textMuted}`}>Hãy thử thay đổi từ khóa tìm kiếm, bộ lọc trạng thái hoặc bấm "Thêm Phòng Mới".</p>
                    <button
                        type="button"
                        onClick={() => setModal({ type: 'create' })}
                        className="mt-2 px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-xl shadow-md uppercase tracking-wider"
                    >
                        Tạo Phòng Mới
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── DẠNG GRID THẺ PHÒNG SANG TRỌNG ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                    {rooms.map(room => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            onViewDetails={r => setModal({ type: 'details', room: r })}
                            theme={theme}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </div>
            ) : (
                /* ── DẠNG BẢNG DANH SÁCH CHI TIẾT ── */
                <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme.panel}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className={`border-b ${theme.tableHead}`}>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Phòng & Vị Trí</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Giá Thuê / Tháng</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Sức Chứa</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Tiện Nghi</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Trạng Thái</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme.divide}`}>
                                {rooms.map(room => {
                                    const cover = room.images?.find(i => i.isCover) ?? room.images?.[0];
                                    const amenities = parseAmenities(room.amenitiesJson);

                                    return (
                                        <tr key={room.id} className={`transition-colors ${theme.rowHover}`}>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-inherit/40 shrink-0 cursor-pointer"
                                                        onClick={() => setModal({ type: 'details', room })}
                                                    >
                                                        {cover ? (
                                                            <img
                                                                src={formatImageUrl(cover.imageUrl)}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center opacity-30 text-[#D4AF37]">
                                                                <Home className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4
                                                            onClick={() => setModal({ type: 'details', room })}
                                                            className={`font-black text-sm ${theme.title} hover:text-[#D4AF37] cursor-pointer`}
                                                        >
                                                            Phòng {room.roomNumber}
                                                        </h4>
                                                        <span className={`text-[11px] ${theme.textMutedSoft} block`}>
                                                            Tầng {room.floor}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-black text-sm text-[#D4AF37]">
                                                {formatPrice(room.basePrice)}
                                            </td>

                                            <td className="py-3.5 px-4 font-medium">
                                                <span className="inline-flex items-center gap-1 text-gray-300">
                                                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                    {room.maxOccupants || 1} người
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {amenities.slice(0, 3).map(k => {
                                                        const found = AMENITIES_LIST.find(a => a.key === k);
                                                        return (
                                                            <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                                                                {found?.icon || '✦'} {found?.label || k}
                                                            </span>
                                                        );
                                                    })}
                                                    {amenities.length > 3 && (
                                                        <span className="text-[10px] font-bold text-[#D4AF37]">
                                                            +{amenities.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${getStatusBadgeStyle(room.status, isDarkMode)}`}>
                                                    {STATUS_LABELS[room.status] || room.status}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setModal({ type: 'details', room })}
                                                    className={`p-2 rounded-xl border transition-all ${theme.buttonOutline}`}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── 5. PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                    <span className={`text-xs ${theme.textMuted}`}>
                        Hiển thị <span className="font-bold text-white">{rooms.length}</span> / {totalRooms} phòng
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fetchRooms(page - 1)}
                            disabled={page === 1}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${theme.buttonOutline} disabled:opacity-40`}
                        >
                            Trước
                        </button>
                        <span className={`text-xs font-mono font-bold px-3 text-[#D4AF37]`}>
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => fetchRooms(page + 1)}
                            disabled={page === totalPages}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${theme.buttonOutline} disabled:opacity-40`}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* ── 6. UNIFIED MODAL ── */}
            {modal?.type === 'details' && (
                <RoomDetailsModal
                    room={modal.room}
                    propertyId={selectedPropertyId}
                    onClose={() => setModal(null)}
                    onSaved={handleRoomSaved}
                    onDeleted={handleRoomDeleted}
                    showToast={showToast}
                    theme={theme}
                    isDarkMode={isDarkMode}
                />
            )}

            {modal?.type === 'create' && (
                <RoomDetailsModal
                    room={null}
                    propertyId={selectedPropertyId}
                    onClose={() => setModal(null)}
                    onSaved={handleRoomSaved}
                    onDeleted={handleRoomDeleted}
                    showToast={showToast}
                    theme={theme}
                    isDarkMode={isDarkMode}
                />
            )}

            {/* ── 7. FLOATING TOAST NOTIFICATION ── */}
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