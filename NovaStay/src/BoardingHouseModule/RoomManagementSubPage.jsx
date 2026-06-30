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
import { getMaintenanceByRoom, markRoomStatus, createMaintenanceTicket } from '../api/maintenanceApi';
import { getProperties } from '../api/propertyApi';
import { formatImageUrl } from '../utils/imageHelper';
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

function getStatusStyle(status, theme) {
    if (!theme) return 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]';
    switch (status) {
        case 'Occupied':    return theme.statusOccupied;
        case 'Available':   return theme.statusAvailable;
        case 'Reserved':    return theme.statusReserved;
        case 'Maintenance': return theme.statusMaintenance;
        default:            return theme.statusDefault;
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

// ─── UNIFIED ROOM MODAL ──────────────────────────────────────
function RoomDetailsModal({ room, propertyId, onClose, onSaved, onDeleted, showToast, theme }) {
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
    
    // Nếu tạo mới thì mở form edit luôn
    const [isEditing, setIsEditing] = useState(isCreate);
    
    // Form fields state
    const [form, setForm] = useState({
        roomNumber: currentRoom.roomNumber ?? '',
        floor: currentRoom.floor ?? 1,
        basePrice: currentRoom.basePrice ?? 0,
        maxOccupants: currentRoom.maxOccupants ?? 1,
        status: currentRoom.status ?? 'Available',
    });
    const [maintenanceReason, setMaintenanceReason] = useState(''); // Lý do bảo trì khi tạo mới/sửa trạng thái

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

    // Maintenance state
    const [maintenanceTickets, setMaintenanceTickets] = useState([]);
    const [loadingMaintenance, setLoadingMaintenance] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'images' | 'maintenance'

    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(1);

    const fetchMaintenance = useCallback(async (page = 1) => {
        if (isCreate) return; // Không fetch nếu chưa tạo phòng
        setLoadingMaintenance(true);
        try {
            const data = await getMaintenanceByRoom(currentRoom.id, page, 5); // 5 tickets per page
            setMaintenanceTickets(data?.items || []);
            setMaintenanceTotalPages(data?.totalPages || 1);
            setMaintenancePage(page);
        } catch (err) {
            console.error('Fetch maintenance error', err);
        } finally {
            setLoadingMaintenance(false);
        }
    }, [currentRoom.id, isCreate]);

    useEffect(() => {
        if (activeTab === 'maintenance') {
            fetchMaintenance();
        }
    }, [activeTab, fetchMaintenance]);

    const [maintenancePrompt, setMaintenancePrompt] = useState(null);

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
            showToast(`Đã chuyển phòng sang trạng thái ${finalStatus === 'Available' ? 'Trống' : finalStatus === 'Occupied' ? 'Đang ở' : 'Bảo trì'}!`, 'success');
            // Optimistic update status
            updateLocalRoomState({ ...currentRoom, status: finalStatus });
            if (activeTab === 'maintenance') fetchMaintenance();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.roomNumber.trim()) e.roomNumber = 'Mã phòng không được trống';
        if (Number(form.basePrice) <= 0) e.basePrice = 'Giá thuê phải > 0';
        if (Number(form.floor) < 1) e.floor = 'Tầng phải >= 1';
        if (Number(form.maxOccupants) < 1) e.maxOccupants = 'Sức chứa phải >= 1';
        if (form.status === 'Maintenance' && !maintenanceReason.trim() && isCreate) e.maintenanceReason = 'Vui lòng nhập lý do bảo trì';
        return e;
    };

    // Save info & amenities
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
                // TẠO MỚI PHÒNG
                // Nếu là bảo trì, ta tạo phòng với status Available trước, sau đó gọi markRoomStatus
                const initialStatus = form.status === 'Maintenance' ? 'Available' : form.status;
                const payload = {
                    propertyId: currentRoom.propertyId,
                    roomNumber: form.roomNumber,
                    floor: Number(form.floor),
                    basePrice: Number(form.basePrice),
                    maxOccupants: Number(form.maxOccupants),
                    status: initialStatus,
                    amenitiesJson: selectedAmenities.length ? JSON.stringify(selectedAmenities) : null,
                };
                savedRoom = await createRoom(payload);

                // Nếu chọn bảo trì, tạo ticket
                if (form.status === 'Maintenance') {
                    const accountData = localStorage.getItem('ns_account');
                    let organizationId = '412a98e1-5efa-4109-be90-83db01cd05c5';
                    if (accountData) {
                        const parsed = JSON.parse(accountData);
                        if (parsed.organizationId) organizationId = parsed.organizationId;
                    }
                    await markRoomStatus(savedRoom.id, {
                        status: 'Maintenance',
                        organizationId,
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
                showToast('Đã thêm phòng và tải ảnh lên thành công!', 'success');
                // Fetch full room data to get uploaded images URLs
                const data = await getRooms({ propertyId: currentRoom.propertyId });
                const roomsArray = data?.items || data?.data || data || [];
                const finalRoom = roomsArray.find(r => r.id === savedRoom.id) || savedRoom;
                
                onClose(); // Đóng modal sau khi tạo xong
                onSaved(finalRoom);
                return;
            } else {
                // CẬP NHẬT PHÒNG
                const payload = {
                    roomNumber: form.roomNumber,
                    floor: Number(form.floor),
                    basePrice: Number(form.basePrice),
                    maxOccupants: Number(form.maxOccupants),
                    status: form.status,
                    amenitiesJson: selectedAmenities.length ? JSON.stringify(selectedAmenities) : null,
                    rowVersion: currentRoom.rowVersion,
                };

                savedRoom = await updateRoom(currentRoom.id, payload);
                showToast('Đã lưu thay đổi phòng thành công!', 'success');
                updateLocalRoomState(savedRoom);
                setIsEditing(false);
            }
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

        if (isCreate) {
            // Thêm vào hàng đợi upload
            setPendingFiles(prev => [...prev, {
                file,
                isCover,
                preview: URL.createObjectURL(file)
            }]);
            setIsCover(false);
            showToast('Đã thêm ảnh vào danh sách chờ lưu', 'success');
            return;
        }

        setUploading(true);
        try {
            await uploadRoomImage(currentRoom.id, file, isCover);
            showToast('Đã tải ảnh lên thành công!', 'success');
            
            // Fetch updated rooms list to sync this room with images
            const data = await getRooms({ propertyId: currentRoom.propertyId });
            const roomsArray = data?.items || data?.data || data || [];
            const updated = roomsArray.find(r => r.id === currentRoom.id);
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
    let allImages = [...(currentRoom.images || [])];
    
    // Tìm ảnh Cover (Server hoặc Pending)
    let coverImage = allImages.find(i => i.isCover);
    let pendingCover = pendingFiles.find(i => i.isCover);

    const otherImages = allImages.filter(i => i !== coverImage) ?? [];
    const otherPending = pendingFiles.filter(i => i !== pendingCover) ?? [];

    // Nếu không có cover nhưng có pending, hiển thị pending đầu tiên làm cover
    if (!coverImage && pendingFiles.length > 0) {
        if (pendingCover) coverImage = { imageUrl: pendingCover.preview, isPending: true, file: pendingCover.file };
        else coverImage = { imageUrl: pendingFiles[0].preview, isPending: true, file: pendingFiles[0].file };
    } else if (coverImage) {
        coverImage = { ...coverImage, isPending: false };
    }

    return (
        <>
        <Modal title={isCreate ? `Thêm Phòng Mới` : `Quản Lý Chi Tiết Phòng ${currentRoom.roomNumber}`} onClose={onClose} size="lg">
            <div className="flex border-b border-[#2C2D35] px-6">
                <button 
                    className={`py-4 px-5 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'info' ? 'border-[#C5A880] text-[#C5A880]' : 'border-transparent text-[#8A8D98] hover:text-white'}`}
                    onClick={() => setActiveTab('info')}
                >Thông tin</button>
                <button 
                    className={`py-4 px-5 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'images' ? 'border-[#C5A880] text-[#C5A880]' : 'border-transparent text-[#8A8D98] hover:text-white'}`}
                    onClick={() => setActiveTab('images')}
                >Hình ảnh {pendingFiles.length > 0 && <span className="ml-1 text-[10px] bg-[#C5A880] text-black px-1.5 rounded-full">{pendingFiles.length}</span>}</button>
                {!isCreate && (
                    <button 
                        className={`py-4 px-5 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'maintenance' ? 'border-[#C5A880] text-[#C5A880]' : 'border-transparent text-[#8A8D98] hover:text-white disabled:opacity-30'}`}
                        onClick={() => setActiveTab('maintenance')}
                    >
                        Bảo trì (Lịch sử)
                    </button>
                )}
            </div>
            <div className="rm-modal-body select-none">
                
                {activeTab === 'info' && (
                    <div className={`space-y-6 pr-0 md:pr-6`}>
                        <div className="flex justify-between items-center">
                            <h4 className={`text-sm font-semibold ${theme.textMuted} uppercase tracking-wider`}>Thông tin & Tiện ích</h4>
                            {!isCreate && (
                                <button
                                    className={`text-xs uppercase font-semibold px-3 py-1.5 rounded-sm border transition-all ${
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
                            )}
                        </div>

                        {/* Room Info Grid */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-xs ${theme.textMutedSoft} uppercase tracking-wider block mb-1.5`}>Mã số phòng</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="rm-input font-mono text-sm"
                                            value={form.roomNumber}
                                            onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))}
                                            placeholder="VD: P101"
                                        />
                                    ) : (
                                        <div className={`${theme.panel} px-4 py-2.5 rounded-sm border ${theme.divider} ${theme.title} font-mono text-base`}>
                                            {currentRoom.roomNumber}
                                        </div>
                                    )}
                                    {errors.roomNumber && <span className="text-xs text-[#E05252] mt-1 block">{errors.roomNumber}</span>}
                                </div>
                                <div>
                                    <label className={`text-xs ${theme.textMutedSoft} uppercase tracking-wider block mb-1.5`}>Tầng</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            className="rm-input font-mono text-sm"
                                            value={form.floor}
                                            onChange={e => setForm(p => ({ ...p, floor: e.target.value }))}
                                        />
                                    ) : (
                                        <div className={`${theme.panel} px-4 py-2.5 rounded-sm border ${theme.divider} ${theme.title} text-base`}>
                                            Tầng {currentRoom.floor}
                                        </div>
                                    )}
                                    {errors.floor && <span className="text-xs text-[#E05252] mt-1 block">{errors.floor}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-xs ${theme.textMutedSoft} uppercase tracking-wider block mb-1.5`}>Giá thuê (VNĐ/tháng)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            className="rm-input font-mono text-sm"
                                            value={form.basePrice}
                                            onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                                        />
                                    ) : (
                                        <div className={`${theme.panel} px-4 py-2.5 rounded-sm border ${theme.divider} text-[#C5A880] font-mono text-base font-semibold`}>
                                            {formatPrice(currentRoom.basePrice)}
                                        </div>
                                    )}
                                    {errors.basePrice && <span className="text-xs text-[#E05252] mt-1 block">{errors.basePrice}</span>}
                                </div>
                                <div>
                                    <label className={`text-xs ${theme.textMutedSoft} uppercase tracking-wider block mb-1.5`}>Sức chứa (người)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="1"
                                            className="rm-input font-mono text-sm"
                                            value={form.maxOccupants}
                                            onChange={e => setForm(p => ({ ...p, maxOccupants: e.target.value }))}
                                        />
                                    ) : (
                                        <div className={`${theme.panel} px-4 py-2.5 rounded-sm border ${theme.divider} ${theme.title} flex items-center gap-2 text-base`}>
                                            <Users size={16} strokeWidth={1.5} /> {currentRoom.maxOccupants ?? 'Không giới hạn'}
                                        </div>
                                    )}
                                    {errors.maxOccupants && <span className="text-xs text-[#E05252] mt-1 block">{errors.maxOccupants}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className={`text-xs ${theme.textMutedSoft} uppercase tracking-wider block mb-1.5`}>Trạng thái</label>
                                    {isEditing ? (
                                        <select
                                            className="rm-select text-sm"
                                            value={form.status}
                                            onChange={e => {
                                                setForm(p => ({ ...p, status: e.target.value }));
                                                if (e.target.value !== 'Maintenance') setMaintenanceReason('');
                                            }}
                                        >
                                            {ROOM_STATUSES.map(s => (
                                                <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className={`px-4 py-2.5 rounded-sm border ${theme.divider} w-max font-medium text-sm ${getStatusStyle(currentRoom.status, theme)}`}>
                                            {STATUS_LABELS[currentRoom.status] ?? currentRoom.status}
                                        </div>
                                    )}
                                </div>
                                
                                {/* HIỂN THỊ Ô LÝ DO BẢO TRÌ NẾU CHỌN TRẠNG THÁI BẢO TRÌ */}
                                {isEditing && form.status === 'Maintenance' && (
                                    <div className="mt-2 p-4 bg-[#E05252]/10 border border-[#522525] rounded-md">
                                        <label className={`text-xs text-[#E05252] font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-2`}>
                                            <AlertTriangle size={14} strokeWidth={2} /> Lý do bảo trì
                                        </label>
                                        <textarea
                                            rows="2"
                                            className="rm-input text-sm resize-none w-full"
                                            placeholder="Nhập lý do để tạo phiếu bảo trì (Bắt buộc)"
                                            value={maintenanceReason}
                                            onChange={e => setMaintenanceReason(e.target.value)}
                                        />
                                        {errors.maintenanceReason && <span className="text-xs text-[#E05252] mt-1 block font-semibold">{errors.maintenanceReason}</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#2C2D35]">
                            <h5 className={`text-xs font-semibold ${theme.textMutedSoft} uppercase tracking-wider mb-3`}>Tiện ích trang bị</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {AMENITIES_LIST.map(({ key, label, icon }) => {
                                    const isSelected = selectedAmenities.includes(key);
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => isEditing && toggleAmenity(key)}
                                            className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all ${
                                                isSelected
                                                    ? 'border-[#C5A880] bg-[#C5A880]/10 text-white'
                                                    : 'border-[#2C2D35] bg-[#16171E] text-[#8A8D98]'
                                            } ${isEditing ? 'cursor-pointer hover:border-[#C5A880]/50' : 'opacity-80'}`}
                                        >
                                            <span className="text-base">{icon}</span>
                                            <span className="text-sm font-medium">{label}</span>
                                            {isSelected && isEditing && (
                                                <div className="ml-auto bg-[#C5A880] text-black rounded-full p-0.5">
                                                    <Check size={10} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'images' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className={`text-sm font-semibold ${theme.textMuted} uppercase tracking-wider`}>Hình ảnh phòng</h4>
                                <p className={`text-xs ${theme.textMutedSoft} mt-1`}>Quản lý không gian và diện mạo phòng. Ảnh bìa sẽ được hiển thị chính.</p>
                            </div>

                            <div className="flex gap-2">
                                <label className={`flex items-center gap-2 px-4 py-2 bg-[#2C2D35] hover:bg-[#3E3F4A] ${theme.title} rounded-lg cursor-pointer transition-colors text-sm font-medium`}>
                                    <Image size={16} strokeWidth={1.5} /> Thêm ảnh
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleUploadImageFile}
                                        disabled={uploading}
                                    />
                                </label>
                                <label className={`flex items-center gap-2 px-4 py-2 bg-[#1F212A] hover:bg-[#2C2D35] border border-[#C5A880] text-[#C5A880] rounded-lg cursor-pointer transition-colors text-sm font-medium`}>
                                    <Upload size={16} strokeWidth={1.5} /> Thêm ảnh bìa
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            setIsCover(true);
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                if (isCreate) {
                                                    setPendingFiles(prev => [...prev, { file, isCover: true, preview: URL.createObjectURL(file) }]);
                                                    setIsCover(false);
                                                } else {
                                                    setUploading(true);
                                                    uploadRoomImage(currentRoom.id, file, true)
                                                    .then(() => {
                                                        showToast('Đã cập nhật ảnh bìa!', 'success');
                                                        getRooms({ propertyId: currentRoom.propertyId }).then(data => {
                                                            const roomsArray = data?.items || data?.data || data || [];
                                                            const updated = roomsArray.find(r => r.id === currentRoom.id);
                                                            if (updated) updateLocalRoomState(updated);
                                                        });
                                                    })
                                                    .catch(err => showToast(err.message, 'error'))
                                                    .finally(() => { setUploading(false); setIsCover(false); });
                                                }
                                            }
                                        }}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>

                        {uploading && (
                            <div className="flex items-center justify-center p-8 bg-[#1F212A] rounded-2xl border border-[#2C2D35] border-dashed">
                                <RefreshCw size={24} className={`animate-spin text-[#C5A880] mr-3`} />
                                <span className={theme.title}>Đang tải ảnh lên máy chủ...</span>
                            </div>
                        )}

                        {!uploading && (allImages.length === 0 && pendingFiles.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-[#0F1016] rounded-2xl border border-[#2C2D35] border-dashed">
                                <div className="w-16 h-16 rounded-full bg-[#1F212A] flex items-center justify-center mb-4 text-[#8A8D98]">
                                    <ImageIcon size={32} strokeWidth={1.5} />
                                </div>
                                <h5 className={`text-base font-medium ${theme.title} mb-2`}>Chưa có hình ảnh nào</h5>
                                <p className={`text-sm ${theme.textMutedSoft} text-center max-w-sm`}>Hãy tải lên hình ảnh không gian phòng để người thuê dễ dàng hình dung.</p>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className={`mt-6 px-6 py-2.5 bg-[#C5A880] text-black font-semibold rounded-lg hover:bg-[#D4AF37] transition-colors text-sm`}>
                                    Tải ảnh ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {coverImage && (
                                    <div>
                                        <h5 className={`text-xs font-semibold ${theme.textMutedSoft} uppercase tracking-wider mb-3 flex items-center gap-2`}><Sparkles size={14} className="text-[#C5A880]"/> Ảnh bìa chính</h5>
                                        <div className="h-56 relative rounded-2xl overflow-hidden border border-[#C5A880]/30 group cursor-pointer" onClick={() => setLightboxImage(coverImage.isPending ? coverImage.imageUrl : formatImageUrl(coverImage.imageUrl))}>
                                            <img src={coverImage.isPending ? coverImage.imageUrl : formatImageUrl(coverImage.imageUrl)} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {coverImage.isPending && (
                                                <span className={`absolute top-4 left-4 bg-yellow-500/80 text-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-semibold backdrop-blur-sm shadow-md`}>Chờ lưu</span>
                                            )}
                                            <button
                                                className={`absolute top-4 right-4 bg-black/70 hover:bg-[#E05252] ${theme.title} p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-lg transform translate-y-2 group-hover:translate-y-0`}
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if (coverImage.isPending) {
                                                        const idx = pendingFiles.findIndex(p => p.preview === coverImage.imageUrl);
                                                        handleDeleteImage(null, true, idx);
                                                    } else {
                                                        handleDeleteImage(coverImage.id); 
                                                    }
                                                }}
                                                disabled={deletingImageId === coverImage.id}
                                                title="Xóa ảnh bìa"
                                            >
                                                {deletingImageId === coverImage.id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={1.5} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {(otherImages.length > 0 || otherPending.length > 0) && (
                                    <div className="pt-4">
                                        <h5 className={`text-xs font-semibold ${theme.textMutedSoft} uppercase tracking-wider mb-3`}>Ảnh khác ({otherImages.length + otherPending.length})</h5>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {otherImages.map((img) => (
                                                <div key={img.id} className="h-32 relative rounded-xl overflow-hidden border border-[#2C2D35] group cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => setLightboxImage(formatImageUrl(img.imageUrl))}>
                                                    <img src={formatImageUrl(img.imageUrl)} alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <button
                                                        className={`absolute top-2 right-2 bg-black/70 hover:bg-[#E05252] ${theme.title} p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0`}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                                                        disabled={deletingImageId === img.id}
                                                    >
                                                        {deletingImageId === img.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={1.5} />}
                                                    </button>
                                                </div>
                                            ))}
                                            {otherPending.map((p, idx) => (
                                                <div key={`pending-${idx}`} className="h-32 relative rounded-xl overflow-hidden border border-yellow-500/50 group cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => setLightboxImage(p.preview)}>
                                                    <img src={p.preview} alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <span className={`absolute bottom-2 left-2 bg-yellow-500/80 text-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold backdrop-blur-sm`}>Chờ lưu</span>
                                                    <button
                                                        className={`absolute top-2 right-2 bg-black/70 hover:bg-[#E05252] ${theme.title} p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0`}
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            const realIdx = pendingFiles.findIndex(pf => pf.preview === p.preview);
                                                            handleDeleteImage(null, true, realIdx); 
                                                        }}
                                                    >
                                                        <Trash2 size={14} strokeWidth={1.5} />
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

                {activeTab === 'maintenance' && !isCreate && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className={`text-sm font-semibold ${theme.textMuted} uppercase tracking-wider`}>Lịch sử bảo trì</h4>
                                <p className={`text-xs ${theme.textMutedSoft} mt-1`}>Quản lý các sự cố và tình trạng bảo dưỡng của phòng.</p>
                            </div>
                            
                            {currentRoom.status !== 'Maintenance' ? (
                                <button
                                    onClick={() => setMaintenancePrompt('Maintenance')}
                                    className={`flex items-center gap-2 px-4 py-2.5 bg-[#E05252]/10 border border-[#E05252]/30 text-[#E05252] rounded-lg hover:bg-[#E05252]/20 transition-colors text-sm font-semibold`}
                                >
                                    <AlertTriangle size={16} strokeWidth={2} /> Báo bảo trì
                                </button>
                            ) : (
                                <button
                                    onClick={() => setMaintenancePrompt('Available')}
                                    className={`flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-semibold`}
                                >
                                    <CheckCircle size={16} strokeWidth={2} /> Hoàn tất bảo trì
                                </button>
                            )}
                        </div>

                        {maintenancePrompt && (
                            <div className="p-5 rounded-xl border border-[#2C2D35] bg-[#1F212A] shadow-lg animate-fade-in">
                                <h5 className={`text-sm font-semibold ${theme.title} mb-3`}>
                                    {maintenancePrompt === 'Maintenance' ? 'Chuyển sang trạng thái Bảo Trì' : 'Đánh dấu đã Hoàn Tất'}
                                </h5>
                                <textarea
                                    id="maintenance-desc-input"
                                    className="rm-input text-sm w-full min-h-[100px] resize-none mb-4"
                                    placeholder={maintenancePrompt === 'Maintenance' ? 'Nhập mô tả sự cố (VD: Hỏng vòi nước, Điều hòa rỉ nước...)' : 'Ghi chú hoàn tất (VD: Đã thay ống nước mới...)'}
                                />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setMaintenancePrompt(null)} className="px-4 py-2 rounded-lg text-[#8A8D98] hover:bg-[#2C2D35] transition-colors text-sm">Hủy</button>
                                    <button
                                        onClick={() => handleMarkMaintenance(maintenancePrompt, document.getElementById('maintenance-desc-input').value)}
                                        className={`px-5 py-2 rounded-lg font-semibold text-white shadow-md transition-colors text-sm ${
                                            maintenancePrompt === 'Maintenance' ? 'bg-[#E05252] hover:bg-[#C94A4A]' : 'bg-emerald-600 hover:bg-emerald-700'
                                        }`}
                                        disabled={saving}
                                    >
                                        {saving ? <RefreshCw size={16} className="animate-spin inline mr-2" /> : null}
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {loadingMaintenance ? (
                                <div className="py-12 flex flex-col items-center justify-center">
                                    <RefreshCw size={24} className={`animate-spin text-[#C5A880] mb-3`} />
                                    <span className={`text-sm ${theme.textMutedSoft}`}>Đang tải lịch sử...</span>
                                </div>
                            ) : maintenanceTickets.length === 0 ? (
                                <div className="py-12 text-center bg-[#0F1016] rounded-xl border border-[#2C2D35]">
                                    <div className="w-12 h-12 rounded-full bg-[#1F212A] flex items-center justify-center mx-auto mb-3 text-[#8A8D98]">
                                        <Activity size={24} strokeWidth={1.5} />
                                    </div>
                                    <p className={`text-sm ${theme.textMutedSoft}`}>Chưa có lịch sử bảo trì nào.</p>
                                </div>
                            ) : (
                                <>
                                    {maintenanceTickets.map(ticket => (
                                        <div key={ticket.id} className="p-4 rounded-xl border border-[#2C2D35] bg-[#16171E] flex gap-4 hover:border-[#414352] transition-colors">
                                            <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {ticket.status === 'Resolved' ? <CheckCircle size={16} strokeWidth={2}/> : <Clock size={16} strokeWidth={2}/>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h5 className={`text-sm font-semibold ${theme.title}`}>{ticket.userDescription || 'Không có mô tả'}</h5>
                                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase ${
                                                        ticket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    }`}>{ticket.status === 'Resolved' ? 'Đã xử lý' : 'Đang xử lý'}</span>
                                                </div>
                                                <div className={`text-[10px] uppercase tracking-wider ${theme.textMutedSoft} flex items-center gap-3 mt-2`}>
                                                    <span>Tạo: {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    {ticket.completedAt && (
                                                        <span>• Hoàn tất: {new Date(ticket.completedAt).toLocaleDateString('vi-VN')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Pagination */}
                                    {maintenanceTotalPages > 1 && (
                                        <div className="flex justify-center items-center gap-4 pt-4">
                                            <button
                                                className={`p-2 rounded-lg border border-[#2C2D35] bg-[#1F212A] hover:bg-[#2C2D35] ${theme.title} disabled:opacity-50`}
                                                disabled={maintenancePage === 1}
                                                onClick={() => fetchMaintenance(maintenancePage - 1)}
                                            >
                                                <ChevronDown size={16} className="rotate-90" />
                                            </button>
                                            <span className={`text-xs font-mono ${theme.textMutedSoft}`}>Trang {maintenancePage} / {maintenanceTotalPages}</span>
                                            <button
                                                className={`p-2 rounded-lg border border-[#2C2D35] bg-[#1F212A] hover:bg-[#2C2D35] ${theme.title} disabled:opacity-50`}
                                                disabled={maintenancePage === maintenanceTotalPages}
                                                onClick={() => fetchMaintenance(maintenancePage + 1)}
                                            >
                                                <ChevronDown size={16} className="-rotate-90" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="rm-modal-footer flex justify-between items-center bg-[#0F1016] border-t border-[#2C2D35] p-5">
                <div>
                    {!isCreate && (
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[#E05252] hover:bg-[#E05252]/10 transition-colors text-sm font-semibold"
                            onClick={handleDeleteRoom}
                            disabled={deletingRoom}
                        >
                            {deletingRoom ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2} />} Xóa Phòng
                        </button>
                    )}
                </div>
                <div className="flex gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#8A8D98] hover:text-white hover:bg-[#2C2D35] transition-colors" onClick={onClose}>Đóng</button>
                    {(isEditing || isCreate) && (
                        <button
                            type="button"
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all ${
                                saving ? 'bg-[#C5A880]/70 cursor-not-allowed' : 'bg-[#C5A880] hover:bg-[#D4AF37] text-black hover:shadow-[#C5A880]/20'
                            }`}
                            onClick={handleSaveChanges}
                            disabled={saving}
                        >
                            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                            {isCreate ? 'Lưu phòng mới' : 'Lưu thông tin'}
                        </button>
                    )}
                </div>
            </div>
        </Modal>

        {lightboxImage && (
            <div className="rm-lightbox" onClick={() => setLightboxImage(null)}>
                <button className="rm-lightbox-close"><X size={24} /></button>
                <img src={lightboxImage} alt="Fullscreen View" className="rm-lightbox-img" onClick={(e) => e.stopPropagation()} />
            </div>
        )}
        </>
    );
}


// ─── ROOM CARD ───────────────────────────────────────────────
function RoomCard({ room, onViewDetails, theme, viewMode = 'grid' }) {
    const coverImage = room.images?.find(i => i.isCover) ?? room.images?.[0];

    if (viewMode === 'list') {
        return (
            <div className={`${theme.panel} hover:border-[#414352] rounded-2xl transition-all duration-300 flex flex-row items-center justify-between p-4 group relative shadow-md`}>
                <div className="flex items-center gap-4">
                    <div
                        className="w-16 h-16 rounded-xl bg-[#0F1016] overflow-hidden cursor-pointer relative shrink-0"
                        onClick={() => onViewDetails(room)}
                    >
                        {coverImage ? (
                            <img
                                src={formatImageUrl(coverImage.imageUrl)}
                                alt={`Room ${room.roomNumber}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full opacity-30">
                                <ImageIcon size={20} color="#C5A880" strokeWidth={1.5} />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col">
                        <span className={`text-xs font-mono ${theme.textMutedSoft} tracking-wider`}>
                            Tầng {room.floor}
                        </span>
                        <h3 className={`text-base font-semibold ${theme.title} group-hover:${theme.goldText} transition-colors mt-0.5`}>
                            Phòng {room.roomNumber}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[10px]`}>Giá thuê</span>
                        <span className={`font-mono font-medium ${theme.goldText} text-base`}>
                            {formatPrice(room.basePrice)}<span className={`text-xs ${theme.textMutedSoft} font-sans`}> / thg</span>
                        </span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[10px]`}>Sức chứa</span>
                        <span className={`${theme.title} font-light flex items-center gap-1 text-sm`}>
                            <Users size={14} strokeWidth={1.5} />
                            {room.maxOccupants ?? '—'}
                        </span>
                    </div>

                    <span className={`px-2.5 py-1 text-xs tracking-wider uppercase font-medium border rounded-md w-24 text-center ${getStatusStyle(room.status, theme)}`}>
                        {STATUS_LABELS[room.status] ?? room.status}
                    </span>

                    <button
                        onClick={() => onViewDetails(room)}
                        className={`p-2 rounded-lg ${theme.textMuted} hover:text-[#5294E2] border border-[#2C2D35] hover:border-[#5294E2] bg-[#1F212A] transition-all`}
                        title="Xem chi tiết"
                    >
                        <Eye size={16} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${theme.panel} hover:border-[#414352] rounded-2xl transition-all duration-300 flex flex-col group relative overflow-hidden shadow-xl`}>

            {/* Image strip */}
            <div
                className="h-[160px] bg-[#0F1016] overflow-hidden cursor-pointer relative flex items-center justify-center"
                onClick={() => onViewDetails(room)}
            >
                {coverImage ? (
                    <img
                        src={formatImageUrl(coverImage.imageUrl)}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-1 opacity-30">
                        <ImageIcon size={24} color="#C5A880" strokeWidth={1.5} />
                        <span className={`text-[10px] ${theme.textMutedSoft} uppercase tracking-wider`}>Không có ảnh</span>
                    </div>
                )}
                {room.images?.length > 0 && (
                    <div className={`absolute bottom-1 right-1 bg-black/60 ${theme.goldText} text-[10px] px-1.5 py-0.5 rounded-sm font-mono`}>
                        {room.images.length} ảnh
                    </div>
                )}
            </div>

            {/* Header */}
            <div className={`p-4 border-b ${theme.divider}`}>
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <span className={`text-xs font-mono ${theme.textMutedSoft} block tracking-wider`}>
                            Tầng {room.floor}
                        </span>
                        <h3 className={`text-base font-semibold tracking-wide ${theme.title} group-hover:${theme.goldText} transition-colors mt-0.5`}>
                            Phòng {room.roomNumber}
                        </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(room.status, theme)}`}>
                        {STATUS_LABELS[room.status] ?? room.status}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className={`p-4 ${theme.subBg} border-b space-y-2 flex-1 text-sm`}>
                {/* Price row */}
                <div className="flex justify-between items-center">
                    <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[10px]`}>Giá thuê</span>
                    <span className={`font-mono font-medium ${theme.goldText} text-base`}>
                        {formatPrice(room.basePrice)}<span className={`text-xs ${theme.textMutedSoft} font-sans`}> / thg</span>
                    </span>
                </div>

                {/* Occupants row */}
                <div className="flex justify-between items-center">
                    <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[10px]`}>Sức chứa</span>
                    <span className={`${theme.title} font-light flex items-center gap-1`}>
                        <Users size={14} strokeWidth={1.5} />
                        {room.maxOccupants ?? '—'} người
                    </span>
                </div>
            </div>

            {/* Footer actions */}
            <div className={`p-3 ${theme.cardFooterBg} border-t flex`}>
                <button
                    onClick={() => onViewDetails(room)}
                    className={`w-full flex items-center justify-center gap-1.5 ${theme.textMuted} hover:text-[#5294E2] border border-[#2C2D35] hover:border-[#5294E2] bg-[#1F212A] text-xs uppercase font-semibold py-2 rounded-sm transition-all`}
                >
                    <Eye size={12} /> Xem Chi Tiết
                </button>
            </div>
        </div>
    );
}

// ─── SKELETON LOADER ─────────────────────────────────────────
function SkeletonCard({ theme }) {
    return (
        <div className={`${theme.panel} rounded-2xl overflow-hidden shadow-xl`}>
            <div className="rm-skeleton h-[160px]" />
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

    const theme = isDarkMode ? {
        bg: 'bg-[#0F1016] text-[#E4E6EB]',
        panel: 'bg-[#16171E] border-[#2C2D35]',
        input: 'bg-[#1F212A] border-[#2C2D35] text-white placeholder-[#5A5C66]',
        textMuted: 'text-[#8A8D98]',
        textMutedSoft: 'text-[#5A5C66]',
        title: 'text-white',
        border: 'border-[#2C2D35]',
        subBg: 'bg-[#12131A]/40 border-[#2C2D35]/30',
        textMainSoft: 'text-[#E4E6EB]',
        buttonOutline: 'text-[#C9CBD3] bg-[#1F212A] border border-[#2C2D35] hover:text-white hover:border-[#C5A880]',
        modalBg: 'bg-[#16171E] border-[#3E3F4A]',
        modalInput: 'bg-[#1F212A] border-[#2C2D35] text-white focus:border-[#C5A880]',
        cardFooterBg: 'bg-[#1B1C24] border-[#2C2D35]',
        emptyBg: 'bg-[#16171E] border-[#2C2D35]',
        cardIdle: 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white',
        cardActive: 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]',
        certDetailsBg: 'bg-[#1F212A]/60 border-[#2C2D35]',
        certDetailsSubBg: 'bg-[#12131A] border-[#2C2D35]/60',
        divider: 'border-[#2C2D35]/60',
        goldText: 'text-[#C5A880]',
        goldBg: 'bg-[#C5A880]',
        goldBorder: 'border-[#C5A880]',
        goldFocus: 'focus:border-[#C5A880]',
        goldTextHover: 'hover:text-[#C5A880]',
        goldTextGroupHover: 'group-hover:text-[#C5A880]',
        textMutedHover: 'hover:text-white',
        priceText: 'text-[#EAD0A8]',
        certAlertBg: 'bg-[#2D1B1B]/30 border-[#522525]/40 text-[#E05252]',
        statusOccupied: 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]',
        statusAvailable: 'bg-[#1A2438] text-[#5294E2] border-[#243B61]',
        statusReserved: 'bg-[#312519] text-[#C5A880] border-[#523F26]',
        statusMaintenance: 'bg-[#2D1B1B] text-[#E05252] border-[#522525]',
        statusDefault: 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]'
    } : {
        bg: 'bg-[#F8F4EA] text-slate-900',
        panel: 'bg-white border-[#E5D4AD] shadow-sm',
        input: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400',
        textMuted: 'text-slate-500',
        textMutedSoft: 'text-slate-400',
        title: 'text-slate-950',
        border: 'border-[#E5D4AD]',
        subBg: 'bg-amber-50/20 border-[#E5D4AD]/45',
        textMainSoft: 'text-slate-800',
        buttonOutline: 'text-slate-600 bg-[#FFF9EC] border border-[#E5D4AD] hover:text-slate-950 hover:border-[#A98446]',
        modalBg: 'bg-white border-[#E5D4AD]',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]',
        cardFooterBg: 'bg-[#FFFDF9] border-[#E5D4AD]',
        emptyBg: 'bg-white border-[#E5D4AD]',
        cardIdle: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-600 hover:text-slate-950',
        cardActive: 'bg-[#FFF1C7] border-[#D4AF37] text-[#8A6212]',
        certDetailsBg: 'bg-[#FFF9EC]/80 border-[#E5D4AD]',
        certDetailsSubBg: 'bg-white border-[#E5D4AD]/60',
        divider: 'border-[#E5D4AD]/60',
        goldText: 'text-[#8A6212]',
        goldBg: 'bg-[#8A6212]',
        goldBorder: 'border-[#D4AF37]',
        goldFocus: 'focus:border-[#D4AF37]',
        goldTextHover: 'hover:text-[#8A6212]',
        goldTextGroupHover: 'group-hover:text-[#8A6212]',
        textMutedHover: 'hover:text-slate-950',
        priceText: 'text-[#8A6212]',
        certAlertBg: 'bg-red-50/50 border-red-200/50 text-red-600',
        statusOccupied: 'bg-green-50 text-green-700 border-green-200',
        statusAvailable: 'bg-blue-50 text-blue-700 border-blue-200',
        statusReserved: 'bg-[#FFF1C7] text-[#8A6212] border-[#D4AF37]',
        statusMaintenance: 'bg-red-50 text-red-700 border-red-200',
        statusDefault: 'bg-slate-100 text-slate-500 border-slate-200'
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
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [totalRooms, setTotalRooms] = useState(0);

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
                        setProperties(data?.items || []);
                        if (data?.items?.length > 0 && !selectedPropertyId) {
                            setSelectedPropertyId(data.items[0].id);
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
    const fetchRooms = useCallback(async (currentPage = 1) => {
        if (!selectedPropertyId) return;
        setLoading(true);
        try {
            const data = await getRooms({
                propertyId: selectedPropertyId,
                search: searchTerm,
                status: statusFilter !== 'All' ? statusFilter : '',
                pageIndex: currentPage,
                pageSize: 12
            });
            setRooms(data?.items || []);
            setTotalPages(data?.totalPages || 1);
            setTotalRooms(data?.totalCount || 0);
            setPage(currentPage);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedPropertyId, searchTerm, statusFilter, showToast]);

    // TASK-012 & 013: Debounce search + filter
    useEffect(() => {
        const timer = setTimeout(() => fetchRooms(1), 350);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, selectedPropertyId]);

    // Stats
    const total = totalRooms;
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
        <div className={`rm-container ${isDarkMode ? "rm-theme-dark" : "rm-theme-light"} w-full h-full max-h-screen ${theme.bg} font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden`}>

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
            <div className={`shrink-0 ${theme.panel} rounded-sm p-6 mb-6 relative overflow-hidden shadow-2xl`}>
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
                                <span className={`text-[10px] ${theme.textMuted} uppercase font-mono tracking-wider font-medium`}>{sub}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CONTROL BAR */}
            <div className={`shrink-0 ${theme.panel} rounded-sm p-4 mb-6`}>
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* TASK-012: Search */}
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full lg:w-80">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Tìm nhanh số phòng..."
                                className={`w-full ${theme.input} text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors`}
                            />
                            <Search size={14} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className={`absolute right-3 top-2.5 ${theme.textMutedSoft} hover:${theme.title}`}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* View Toggle */}
                        <div className={`flex items-center ${theme.input} p-1 rounded-sm shrink-0`}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? theme.cardActive : theme.cardIdle}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? theme.cardActive : theme.cardIdle}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
                        {/* TASK-013: Status filter tabs */}
                        <div className="flex gap-1.5 overflow-x-auto">
                            {['All', ...ROOM_STATUSES].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 text-[10px] tracking-wider font-semibold border transition-all rounded-sm uppercase whitespace-nowrap ${statusFilter === s
                                        ? theme.cardActive
                                        : `${theme.cardIdle} hover:${theme.title}`
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
                        <h3 className={`text-sm font-medium ${theme.title} tracking-wide`}>Chọn cơ sở để xem phòng</h3>
                        <p className={`text-xs ${theme.textMutedSoft} mt-1`}>Nhập PropertyId hoặc chọn từ danh sách cơ sở</p>
                    </div>
                ) : loading ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} theme={theme} />)}
                    </div>
                ) : rooms.length > 0 ? (
                    <>
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {rooms.map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    onViewDetails={r => setModal({ type: 'details', room: r })}
                                    theme={theme}
                                    viewMode={viewMode}
                                    hideImage={viewMode === 'list'}
                                />
                            ))}
                        </div>

                        {/* Pagination always visible */}
                        <div className="flex justify-center items-center mt-8 gap-2">
                            <button
                                onClick={() => fetchRooms(page - 1)}
                                disabled={page === 1}
                                className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed bg-[#1F212A] text-[#5A5C66]' : 'bg-[#1F212A] hover:bg-[#2C2D35] text-[#8A8D98] hover:text-white'}`}
                            >
                                Trước
                            </button>
                            <span className={`text-[11px] uppercase tracking-wider font-mono ${theme.textMutedSoft} px-3`}>
                                Trang <span className="text-white">{page}</span> / {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={() => fetchRooms(page + 1)}
                                disabled={page === totalPages || totalPages === 0}
                                className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all ${page === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed bg-[#1F212A] text-[#5A5C66]' : 'bg-[#1F212A] hover:bg-[#2C2D35] text-[#8A8D98] hover:text-white'}`}
                            >
                                Sau
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="py-16 text-center border border-dashed border-[#2C2D35] bg-[#16171E] rounded-sm flex flex-col items-center justify-center min-h-[300px]">
                        <Home size={32} className="text-[#3E404C] mb-2" />
                        <h3 className={`text-sm font-medium ${theme.title} tracking-wide`}>Không tìm thấy phòng phù hợp</h3>
                        <p className={`text-xs ${theme.textMutedSoft} mt-1`}>Thử thay đổi bộ lọc hoặc thêm phòng mới</p>
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
                    theme={theme}
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