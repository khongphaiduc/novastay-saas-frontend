import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Users,
    Search,
    Plus,
    X,
    User,
    UserX,
    Layers,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Phone,
    MapPin,
    CreditCard,
    CheckCircle,
    Edit,
    History,
    Mail,
    Camera,
    Eye
} from 'lucide-react';

export default function ResidentManagementSubPage({ isDarkMode = true }) {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    // States quản lý dữ liệu
    const [residents, setResidents] = useState([]);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [viewMode, setViewMode] = useState('list'); // 'grid' | 'list'

    // Thêm các state cho tính năng Sửa & Xem Lịch sử
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editResidentData, setEditResidentData] = useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedResidentForDetail, setSelectedResidentForDetail] = useState(null);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedResidentForHistory, setSelectedResidentForHistory] = useState(null);
    const [historyContracts, setHistoryContracts] = useState([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const fetchResidents = async () => {
        setLoading(true);
        setError('');
        try {
            const accountData = localStorage.getItem('ns_account');
            let organizationId = '';
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    organizationId = parsed.organizationId || '';
                    accessToken = parsed.accessToken || '';
                } catch (e) {}
            }

            if (!organizationId) {
                organizationId = '412A98E1-5EFA-4109-BE90-83DB01CD05C5';
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const searchParam = globalSearchTerm.trim() ? `&search=${encodeURIComponent(globalSearchTerm.trim())}` : '';
            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/residents?page=${currentPage}&pageSize=${pageSize}${searchParam}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                }
            });

            if (!res.ok) {
                throw new Error('Không thể tải danh sách cư dân');
            }

            const data = await res.json();
            const rawList = Array.isArray(data) ? data : (data?.items || data?.data || data?.residents || []);
            setTotalRecords(data?.totalCount || data?.totalRecords || rawList.length);

            const mappedResidents = rawList.map((item) => ({
                id: item.membershipCode || item.membershipId || '',
                residentId: item.resident?.id || item.residentId,
                name: item.resident?.fullName || item.residentName || item.fullName || 'Không rõ tên',
                room: 'Chưa xếp phòng',
                phone: item.resident?.phone || item.residentPhone || item.phone || 'N/A',
                idCard: item.resident?.identityCardNumber || item.identityCardNumber || 'N/A',
                gender: item.resident?.sex || 'N/A',
                address: item.resident?.address || item.address || '',
                email: item.resident?.email || item.email || '',
                profileImageUrl: item.resident?.profileImageUrl || item.profileImageUrl || '',
                status: (item.status === 'ACTIVE' || item.membershipStatus === 'ACTIVE')
                    ? 'Đang cư trú'
                    : (item.status === 'PENDING' || item.membershipStatus === 'PENDING' ? 'Chờ xác nhận' : 'Chưa xác định')
            }));

            setResidents(mappedResidents);
        } catch (err) {
            console.error('Fetch residents error:', err);
            setError(err.message || 'Lỗi khi kết nối với máy chủ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, [currentPage, pageSize]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setCurrentPage(1);
        fetchResidents();
    };

    const handleClearSearch = () => {
        setGlobalSearchTerm('');
        setCurrentPage(1);
        // Will be handled by the next useEffect trigger or manual fetch
        setTimeout(() => fetchResidents(), 0);
    };

    const handleRemoveResident = async (residentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa cư dân này khỏi tòa nhà?')) return;
        
        try {
            const accountData = localStorage.getItem('ns_account');
            let organizationId = '412A98E1-5EFA-4109-BE90-83DB01CD05C5';
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    if (parsed.organizationId) organizationId = parsed.organizationId;
                    accessToken = parsed.accessToken || '';
                } catch (e) {}
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/residents/${residentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                }
            });

            if (res.status === 204 || res.ok) {
                showToast('Xóa cư dân thành công!', 'success');
                fetchResidents();
            } else {
                let errMsg = 'Xóa cư dân thất bại';
                try {
                    const errorData = await res.json();
                    errMsg = errorData?.message || errorData?.error || errMsg;
                } catch (_) {}
                showToast(errMsg, 'error');
            }
        } catch (err) {
            console.error('Remove resident error:', err);
            showToast('Lỗi khi kết nối với máy chủ', 'error');
        }
    };

    const [newResident, setNewResident] = useState({
        name: '',
        phone: '',
        address: '',
        idCard: '',
        gender: 'Nam'
    });

    const handleCreateResident = async (e) => {
        e.preventDefault();
        if (!newResident.name) return;

        try {
            const accountData = localStorage.getItem('ns_account');
            let accessToken = '';
            let organizationId = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    accessToken = parsed.accessToken || '';
                    organizationId = parsed.organizationId || '';
                } catch (e) {}
            }

            if (!organizationId) {
                organizationId = '412A98E1-5EFA-4109-BE90-83DB01CD05C5';
            }

            const payload = {
                name: newResident.name,
                sdt: newResident.phone,
                identityCardNumber: newResident.idCard,
                sex: newResident.gender === 'Nam' ? 'Male' : (newResident.gender === 'Nữ' ? 'Female' : 'Other'),
                address: newResident.address
            };

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/residents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 201) {
                showToast('Khởi tạo và tự động thêm vào nhà trọ thành công!', 'success');
                setIsModalOpen(false);
                setNewResident({ name: '', phone: '', address: '', idCard: '', gender: 'Nam' });
                setGlobalSearchTerm('');
                setCurrentPage(1);
                fetchResidents();
            } else {
                let errMsg = 'Đăng ký cư dân thất bại';
                try {
                    const errorData = await res.json();
                    if (errorData?.message === 'Phone already exists.') {
                        errMsg = 'Số điện thoại này đã tồn tại trên hệ thống.';
                    } else {
                        errMsg = errorData?.message || errorData?.error || errMsg;
                    }
                } catch (_) { }
                showToast(errMsg, 'error');
            }
        } catch (err) {
            console.error('Create resident error:', err);
            showToast(err.message || 'Lỗi khi kết nối với máy chủ', 'error');
        }
    };

    const handleViewDetail = (resident) => {
        setSelectedResidentForDetail(resident);
        setIsDetailModalOpen(true);
    };

    const handleEditClick = (resident) => {
        setEditResidentData({
            id: resident.residentId,
            name: resident.name || '',
            phone: resident.phone || '',
            address: resident.address || '',
            idCard: resident.idCard || '',
            gender: 'Nam', // Temporary fallback
            email: resident.email || '',
            profileImageUrl: resident.profileImageUrl || ''
        });
        setIsEditModalOpen(true);
    };

    const handleUploadAvatar = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !editResidentData?.id) return;

        try {
            const accountData = localStorage.getItem('ns_account');
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    accessToken = parsed.accessToken || '';
                } catch (err) {}
            }

            const formData = new FormData();
            formData.append('file', file);

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/residents/${editResidentData.id}/images/profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setEditResidentData({ ...editResidentData, profileImageUrl: data.profileImageUrl });
                showToast('Tải ảnh nhận diện thành công!', 'success');
                fetchResidents(); // Cập nhật lại danh sách bên ngoài
            } else {
                let errMsg = 'Tải ảnh thất bại';
                try {
                    const errorData = await res.json();
                    errMsg = errorData?.message || errorData?.error || errMsg;
                } catch (_) {}
                showToast(errMsg, 'error');
            }
        } catch (err) {
            console.error('Upload avatar error:', err);
            showToast('Lỗi khi tải ảnh lên', 'error');
        }
    };

    const submitEditResident = async (e) => {
        e.preventDefault();
        if (!editResidentData.name) return;

        try {
            const accountData = localStorage.getItem('ns_account');
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    accessToken = parsed.accessToken || '';
                } catch (e) {}
            }

            const payload = {
                name: editResidentData.name,
                sdt: editResidentData.phone,
                identityCardNumber: editResidentData.idCard,
                sex: editResidentData.gender === 'Nam' ? 'Male' : (editResidentData.gender === 'Nữ' ? 'Female' : 'Other'),
                address: editResidentData.address,
                email: editResidentData.email
            };

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/residents/${editResidentData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast('Cập nhật cư dân thành công!', 'success');
                setIsEditModalOpen(false);
                fetchResidents();
            } else {
                let errMsg = 'Cập nhật thất bại';
                try {
                    const errorData = await res.json();
                    errMsg = errorData?.message || errorData?.error || errMsg;
                } catch (_) { }
                showToast(errMsg, 'error');
            }
        } catch (err) {
            console.error('Edit resident error:', err);
            showToast('Lỗi khi kết nối với máy chủ', 'error');
        }
    };

    const handleViewHistory = async (resident) => {
        setSelectedResidentForHistory(resident);
        setIsHistoryModalOpen(true);
        setIsFetchingHistory(true);
        setHistoryContracts([]);
        try {
            const accountData = localStorage.getItem('ns_account');
            let accessToken = '';
            let organizationId = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    accessToken = parsed.accessToken || '';
                    organizationId = parsed.organizationId || '';
                } catch (e) {}
            }

            if (!organizationId) {
                organizationId = '412A98E1-5EFA-4109-BE90-83DB01CD05C5';
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/contracts?organizationId=${organizationId}&residentId=${resident.residentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                }
            });

            if (res.ok) {
                const data = await res.json();
                setHistoryContracts(data);
            } else {
                showToast('Lấy lịch sử thất bại', 'error');
            }
        } catch (err) {
            console.error('View history error:', err);
            showToast('Lỗi khi kết nối với máy chủ', 'error');
        } finally {
            setIsFetchingHistory(false);
        }
    };

    const totalPages = Math.ceil(totalRecords / pageSize);

    const theme = isDarkMode ? {
        bg: 'bg-[#0F1016] text-[#E4E6EB]',
        panel: 'bg-[#16171E] border-[#2C2D35]',
        input: 'bg-[#1F212A] border-[#2C2D35] text-white placeholder-[#5A5C66]',
        textMuted: 'text-[#8A8D98]',
        textMutedSoft: 'text-[#5A5C66]',
        title: 'text-white',
        border: 'border-[#2C2D35]',
        subBg: 'bg-[#111218] border-[#23242B]',
        rowHover: 'hover:bg-[#1C1E26]',
        divide: 'divide-[#1F212A]',
        buttonOutline: 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white',
        modalBg: 'bg-[#16171E] border-[#3E3F4A]',
        modalInput: 'bg-[#1F212A] border-[#2C2D35] text-white focus:border-[#C5A880]',
        goldText: 'text-[#C5A880]',
        goldBg: 'bg-[#C5A880]',
        goldFocus: 'focus:border-[#C5A880]',
        goldTextHover: 'hover:text-[#C5A880]',
        statusOk: 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]'
    } : {
        bg: 'bg-[#F8F4EA] text-slate-900',
        panel: 'bg-white border-[#E5D4AD] shadow-sm',
        input: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400',
        textMuted: 'text-slate-500',
        textMutedSoft: 'text-slate-400',
        title: 'text-slate-950',
        border: 'border-[#E5D4AD]',
        subBg: 'bg-[#FFF9EC] border-[#E5D4AD]',
        rowHover: 'hover:bg-amber-50/70',
        divide: 'divide-[#FFF9EC]',
        buttonOutline: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-600 hover:text-slate-950',
        modalBg: 'bg-white border-[#E5D4AD]',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]',
        goldText: 'text-[#8A6212]',
        goldBg: 'bg-[#8A6212]',
        goldFocus: 'focus:border-[#D4AF37]',
        goldTextHover: 'hover:text-[#8A6212]',
        statusOk: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
    };

    return (
        <div className={`w-full min-h-full transition-colors duration-300 ${theme.bg} font-sans antialiased selection:bg-[#C5A880] selection:text-black p-6 lg:p-8 relative`}>

            {/* PAGE SUB-HEADER */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b ${theme.border} pb-6 mb-6`}>
                <div>
                    <span className={`text-[10px] tracking-[0.3em] ${theme.goldText} uppercase font-semibold`}>Phân khu cao cấp</span>
                    <h1 className={`text-xl font-light tracking-wide ${theme.title} mt-0.5`}>Quản Lý Cư Dân</h1>
                </div>
                <div className={`text-xs ${theme.textMuted} tracking-widest font-mono ${theme.panel} px-3 py-1.5 border`}>
                    Khu vực: <span className={`${theme.goldText}`}>THE GRAND</span>
                </div>
            </div>

            {/* CHỨA NỘI DUNG CHÍNH */}
            <div className={`${theme.panel} border shadow-xl rounded-sm p-5 lg:p-6`}>
                <div className={`mb-8 p-6 ${theme.subBg} border rounded-sm`}>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className={`text-[9px] tracking-[0.2em] ${theme.goldText} uppercase font-semibold block mb-2`}>Resident Management</span>
                            <h2 className={`text-base font-light tracking-wide ${theme.title}`}>Danh Cư Dân Hiện Tại</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-6 py-3 rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap uppercase tracking-wider"
                        >
                            <UserPlus size={15} /> YÊU CẦU TẠO MỚI CƯ DÂN
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-stretch w-full">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={globalSearchTerm}
                                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm cư dân theo tên hoặc số điện thoại..."
                                    className={`w-full ${theme.input} border text-xs px-4 py-3 pl-11 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                />
                                <Search size={16} className={`absolute left-4 top-3 ${theme.goldText}`} />
                                {globalSearchTerm && (
                                    <button type="button" onClick={handleClearSearch} className={`absolute right-4 top-3 ${theme.textMuted} ${theme.goldTextHover} text-xs`}>✕</button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-black transition-colors text-xs font-bold px-6 py-3 rounded-sm whitespace-nowrap uppercase tracking-wider shrink-0"
                            >
                                <Search size={15} /> TÌM KIẾM
                            </button>
                        </form>
                        
                        {/* View Toggle */}
                        <div className={`flex items-center ${theme.input} p-1 rounded-sm shrink-0`}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-sm transition-all ${viewMode === 'grid' ? theme.cardActive : theme.cardIdle}`}
                                title="Lưới"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-sm transition-all ${viewMode === 'list' ? theme.cardActive : theme.cardIdle}`}
                                title="Danh sách"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>

                <div>
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <svg className="animate-spin h-8 w-8 text-[#C5A880] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className={`text-xs ${theme.textMuted}`}>Đang tải danh sách cư dân...</span>
                        </div>
                    ) : error ? (
                        <div className={`py-12 text-center text-red-500 border border-dashed border-red-500/20 rounded-sm`}>
                            <p className="text-xs">{error}</p>
                            <button
                                onClick={fetchResidents}
                                className={`mt-3 border ${isDarkMode ? 'border-[#C5A880] text-[#C5A880]' : 'border-[#8A6212] text-[#8A6212]'} text-[10px] px-3 py-1.5 rounded-sm`}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : residents.length === 0 ? (
                        <div className={`py-12 text-center ${theme.textMutedSoft} border border-dashed ${theme.border} rounded-sm flex flex-col items-center justify-center`}>
                            <Users size={24} className={`mb-2 ${theme.textMutedSoft}`} />
                            <p className="text-xs font-light">Không có cư dân nào trong danh sách.</p>
                        </div>
                    ) : (
                        <div className="w-full">
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                                    {residents.map((res) => (
                                        <div key={res.id} className={`${theme.panel} rounded-2xl overflow-hidden hover:border-[#C5A880] transition-colors group shadow-lg flex flex-col`}>
                                            <div className="h-40 bg-[#0F1016] relative overflow-hidden flex items-center justify-center">
                                                {res.profileImageUrl ? (
                                                    <img src={res.profileImageUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                                        <User size={32} color="#C5A880" />
                                                        <span className="text-[10px] text-[#8A8D98] uppercase tracking-wider">Chưa có ảnh</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <span className={`inline-block ${theme.statusOk} text-[9px] px-2 py-0.5 tracking-wider uppercase font-medium rounded-sm shadow-md`}>
                                                        {res.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className={`text-sm font-semibold ${theme.title} mb-1 group-hover:${theme.goldText} transition-colors line-clamp-1`}>{res.name}</h3>
                                                <div className="flex items-center gap-1.5 text-[11px] text-[#8A8D98] font-mono mb-3">
                                                    <CreditCard size={12} className="shrink-0" />
                                                    {res.idCard}
                                                </div>
                                                <div className="space-y-1.5 mt-auto bg-[#12131A]/40 p-3 rounded-lg border border-[#2C2D35]/30">
                                                    <div className="flex items-center gap-2 text-xs text-[#8A8D98]">
                                                        <Phone size={12} className="shrink-0 text-[#C5A880]/70" />
                                                        <span className="font-mono">{res.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-[#8A8D98]">
                                                        <Mail size={12} className="shrink-0 text-[#C5A880]/70" />
                                                        <span className="truncate">{res.email || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t border-[#2C2D35]/60 bg-[#1B1C24] p-2.5 flex justify-between items-center gap-1">
                                                <button onClick={() => handleViewDetail(res)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors flex-1 flex justify-center" title="Chi tiết"><Eye size={14} /></button>
                                                <button onClick={() => handleViewHistory(res)} className="p-2 text-[#C5A880] hover:bg-[#C5A880]/10 rounded-lg transition-colors flex-1 flex justify-center" title="Lịch sử"><History size={14} /></button>
                                                <button onClick={() => handleEditClick(res)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors flex-1 flex justify-center" title="Sửa"><Edit size={14} /></button>
                                                <button onClick={() => handleRemoveResident(res.residentId)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-1 flex justify-center" title="Xóa"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className={`border-b ${theme.border} tracking-widest ${theme.textMuted} uppercase font-semibold`}>
                                                <th className="pb-3 pl-4">Cư Dân</th>
                                                <th className="pb-3">Liên Hệ</th>
                                                <th className="pb-3">CMND/CCCD</th>
                                                <th className="pb-3 text-right">Trạng Thái</th>
                                                <th className="pb-3 text-right pr-4">Hành Động</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${theme.divide}`}>
                                            {residents.map((res) => (
                                                <tr key={res.id} className={`${theme.rowHover} transition-colors group`}>
                                                    <td className={`py-3.5 pl-4 font-medium ${theme.title}`}>{res.name}</td>
                                                    <td className={`py-3.5 ${theme.textMuted}`}>
                                                        <div className="flex items-center gap-1.5 font-mono"><Phone size={11} className={`${theme.textMutedSoft}`} />{res.phone || 'N/A'}</div>
                                                        <div className="flex items-center gap-1.5 text-[10px] mt-0.5"><Mail size={11} className={`${theme.textMutedSoft}`} />{res.email || 'N/A'}</div>
                                                    </td>
                                                    <td className={`py-3.5 ${theme.textMuted} font-mono`}>{res.idCard}</td>
                                                    <td className="py-3.5 text-right">
                                                        <span className={`inline-block ${theme.statusOk} text-[10px] px-2 py-0.5 tracking-wider uppercase font-medium rounded-sm`}>
                                                            {res.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 text-right flex justify-end gap-2 pr-4">
                                                        <button onClick={() => handleViewDetail(res)} className="text-green-500 hover:text-green-400 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1">
                                                            <Eye size={13} /> Chi tiết
                                                        </button>
                                                        <button onClick={() => handleViewHistory(res)} className="text-[#C5A880] hover:text-[#D4AF37] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1">
                                                            <History size={13} /> Lịch sử
                                                        </button>
                                                        <button onClick={() => handleEditClick(res)} className="text-blue-500 hover:text-blue-400 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1">
                                                            <Edit size={13} /> Sửa
                                                        </button>
                                                        <button onClick={() => handleRemoveResident(res.residentId)} className="text-red-500 hover:text-red-400 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1">
                                                            <Trash2 size={13} /> Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Phân trang */}
                            <div className={`flex items-center justify-between pt-4 border-t ${theme.border}`}>
                                <div className={`text-[10px] ${theme.textMuted} tracking-widest uppercase`}>
                                    Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalRecords)} trong {totalRecords} cư dân
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={`p-1.5 rounded-sm border ${theme.border} ${theme.textMuted} hover:text-white hover:border-[#C5A880] disabled:opacity-30 disabled:hover:border-[#2C2D35] disabled:hover:text-[#8A8D98] transition-colors`}
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className={`px-3 py-1.5 text-xs font-mono border ${theme.border} rounded-sm bg-[#1F212A]`}>
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className={`p-1.5 rounded-sm border ${theme.border} ${theme.textMuted} hover:text-white hover:border-[#C5A880] disabled:opacity-30 disabled:hover:border-[#2C2D35] disabled:hover:text-[#8A8D98] transition-colors`}
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

            {/* --- LUXURY MODAL FORM: THÊM CƯ DÂN MỚI --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-xl w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${theme.goldBg} animate-pulse`}></div>
                                <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>Hồ Sơ Khởi Tạo Cư Dân</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateResident} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Họ và tên *</label>
                                    <div className="relative">
                                        <input
                                            type="text" required placeholder="Nguyễn Văn A..." value={newResident.name}
                                            onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                        />
                                        <User size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Số điện thoại</label>
                                    <div className="relative">
                                        <input
                                            type="tel" placeholder="09xx.xxx.xxx" value={newResident.phone}
                                            onChange={(e) => setNewResident({ ...newResident, phone: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                        />
                                        <Phone size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Số CMND / CCCD</label>
                                    <div className="relative">
                                        <input
                                            type="text" placeholder="Định danh cư dân..." value={newResident.idCard}
                                            onChange={(e) => setNewResident({ ...newResident, idCard: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                        />
                                        <CreditCard size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Giới tính</label>
                                    <div className="grid grid-cols-3 gap-2 h-9">
                                        {['Nam', 'Nữ', 'Khác'].map((g) => (
                                            <button
                                                key={g} type="button" onClick={() => setNewResident({ ...newResident, gender: g })}
                                                className={`text-xs border transition-all rounded-sm font-medium ${newResident.gender === g ? (isDarkMode ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]' : 'bg-[#8A6212]/10 border-[#8A6212] text-[#8A6212]') : theme.buttonOutline}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Địa chỉ thường trú / Nguyên quán</label>
                                <div className="relative">
                                    <input
                                        type="text" placeholder="Tỉnh/Thành phố, Quận/Huyện..." value={newResident.address}
                                        onChange={(e) => setNewResident({ ...newResident, address: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                    />
                                    <MapPin size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                </div>
                            </div>

                            <div className={`flex gap-3 justify-end pt-4 border-t ${theme.border} mt-6`}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 text-xs font-semibold tracking-wider ${theme.textMuted} ${theme.textMutedHover} uppercase`}>Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase">Lưu hồ sơ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- FLOATING TOAST NOTIFICATION --- */}
            {toast && (
                <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm ${toast.type === 'success'
                        ? (isDarkMode
                            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200 shadow-emerald-950/20'
                            : 'bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-emerald-100/50')
                        : (isDarkMode
                            ? 'bg-red-950/90 border-red-500/30 text-red-200 shadow-red-950/20'
                            : 'bg-red-50/90 border-red-200 text-red-800 shadow-red-100/50')
                        }`}>
                        <div className={`p-1.5 rounded-lg ${toast.type === 'success'
                            ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                            : (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600')
                            }`}>
                            {toast.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-semibold uppercase tracking-wider">
                                {toast.type === 'success' ? 'Thành công' : 'Đã xảy ra lỗi'}
                            </h4>
                            <p className="text-[11px] font-medium opacity-90 mt-0.5">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity p-1">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODAL EDIT CƯ DÂN --- */}
            {isEditModalOpen && editResidentData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-xl w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <div className="flex items-center gap-2">
                                <Edit className={`${theme.goldText}`} size={18} />
                                <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>Cập Nhật Thông Tin Cư Dân</h3>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submitEditResident} className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Cột Trái: Ảnh Đại Diện */}
                                <div className="w-full sm:w-1/3 flex flex-col items-center gap-3">
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-[#C5A880]/30 bg-black/10 flex items-center justify-center group">
                                        {editResidentData.profileImageUrl ? (
                                            <img src={editResidentData.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} className={`${theme.textMutedSoft}`} />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <label htmlFor="avatar-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                                <Camera size={20} className="text-white" />
                                                <span className="text-[9px] text-white tracking-wider uppercase">Tải Ảnh Lên</span>
                                            </label>
                                            <input 
                                                type="file" 
                                                id="avatar-upload" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleUploadAvatar}
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-[10px] tracking-widest ${theme.textMutedSoft} uppercase`}>Ảnh Nhận Diện</span>
                                </div>

                                {/* Cột Phải: Các trường thông tin */}
                                <div className="w-full sm:w-2/3 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Họ và tên *</label>
                                            <div className="relative">
                                                <input
                                                    type="text" required value={editResidentData.name}
                                                    onChange={(e) => setEditResidentData({ ...editResidentData, name: e.target.value })}
                                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                                />
                                                <User size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Số điện thoại</label>
                                            <div className="relative">
                                                <input
                                                    type="tel" value={editResidentData.phone}
                                                    onChange={(e) => setEditResidentData({ ...editResidentData, phone: e.target.value })}
                                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                                />
                                                <Phone size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Số CMND / CCCD</label>
                                            <div className="relative">
                                                <input
                                                    type="text" value={editResidentData.idCard}
                                                    onChange={(e) => setEditResidentData({ ...editResidentData, idCard: e.target.value })}
                                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                                />
                                                <CreditCard size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Giới tính</label>
                                            <div className="grid grid-cols-3 gap-2 h-9">
                                                {['Nam', 'Nữ', 'Khác'].map((g) => (
                                                    <button
                                                        key={g} type="button" onClick={() => setEditResidentData({ ...editResidentData, gender: g })}
                                                        className={`text-xs border transition-all rounded-sm font-medium ${editResidentData.gender === g ? (isDarkMode ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]' : 'bg-[#8A6212]/10 border-[#8A6212] text-[#8A6212]') : theme.buttonOutline}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Email</label>
                                            <div className="relative">
                                                <input
                                                    type="email" value={editResidentData.email}
                                                    onChange={(e) => setEditResidentData({ ...editResidentData, email: e.target.value })}
                                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                                />
                                                <Mail size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Địa chỉ thường trú</label>
                                            <div className="relative">
                                                <input
                                                    type="text" value={editResidentData.address}
                                                    onChange={(e) => setEditResidentData({ ...editResidentData, address: e.target.value })}
                                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none`}
                                                />
                                                <MapPin size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <div className={`flex gap-3 justify-end pt-4 border-t ${theme.border} mt-6`}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className={`px-4 py-2 text-xs font-semibold tracking-wider ${theme.textMuted} ${theme.textMutedHover} uppercase`}>Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* --- MODAL LỊCH SỬ LƯU TRÚ --- */}
            {isHistoryModalOpen && selectedResidentForHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-4xl w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <div className="flex items-center gap-2">
                                <History className={`${theme.goldText}`} size={18} />
                                <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>
                                    Lịch Sử Cư Trú - <span className={theme.goldText}>{selectedResidentForHistory.name}</span>
                                </h3>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                <X size={18} />
                            </button>
                        </div>

                        {isFetchingHistory ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-[#C5A880] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className={`text-xs ${theme.textMuted}`}>Đang tải lịch sử...</span>
                            </div>
                        ) : historyContracts.length === 0 ? (
                            <div className={`py-12 text-center ${theme.textMutedSoft} border border-dashed ${theme.border} rounded-sm flex flex-col items-center justify-center`}>
                                <Layers size={24} className={`mb-2 ${theme.textMutedSoft}`} />
                                <p className="text-xs font-light">Chưa có lịch sử hợp đồng nào.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-4">
                                    {historyContracts.map((contract) => (
                                        <div key={contract.id} className={`p-4 border ${theme.border} rounded-sm ${theme.cardBg}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className={`text-sm font-semibold ${theme.title} mb-1 flex items-center gap-2`}>
                                                        Hợp đồng: {contract.id.split('-')[0].toUpperCase()}
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider uppercase ${
                                                            contract.status?.value === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                                            contract.status?.value === 'Terminated' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                        }`}>
                                                            {contract.status?.value === 'Active' ? 'Đang hiệu lực' : 
                                                             contract.status?.value === 'Terminated' ? 'Đã thanh lý' : contract.status?.value}
                                                        </span>
                                                    </h4>
                                                    <div className={`text-[11px] ${theme.textMutedSoft} flex items-center gap-3`}>
                                                        <span className="flex items-center gap-1"><MapPin size={11} /> P.{contract.roomNumber || 'N/A'} - {contract.propertyName || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                                                <div>
                                                    <span className={`block text-[9px] ${theme.textMutedSoft} uppercase tracking-wider mb-1`}>Ngày bắt đầu</span>
                                                    <span className={`text-xs ${theme.textMuted} font-mono`}>{contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className={`block text-[9px] ${theme.textMutedSoft} uppercase tracking-wider mb-1`}>Ngày kết thúc</span>
                                                    <span className={`text-xs ${theme.textMuted} font-mono`}>{contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className={`block text-[9px] ${theme.textMutedSoft} uppercase tracking-wider mb-1`}>Giá thuê</span>
                                                    <span className={`text-xs ${theme.goldText} font-mono`}>{contract.basePrice ? contract.basePrice.toLocaleString() + ' đ' : 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className={`block text-[9px] ${theme.textMutedSoft} uppercase tracking-wider mb-1`}>Tiền cọc</span>
                                                    <span className={`text-xs ${theme.textMuted} font-mono`}>{contract.depositAmount ? contract.depositAmount.toLocaleString() + ' đ' : '0 đ'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className={`flex justify-end pt-4 border-t ${theme.border} mt-6`}>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="bg-[#2A2B35] hover:bg-[#353644] text-white text-xs font-semibold px-5 py-2.5 rounded-sm tracking-wider uppercase transition-colors border border-white/10">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CHI TIẾT CƯ DÂN --- */}
            {isDetailModalOpen && selectedResidentForDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-xl w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <div className="flex items-center gap-2">
                                <User className={`${theme.goldText}`} size={18} />
                                <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>Hồ Sơ Cư Dân</h3>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Cột Trái: Avatar */}
                            <div className="w-full sm:w-1/3 flex flex-col items-center gap-3">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#C5A880]/30 bg-black/10 flex items-center justify-center">
                                    {selectedResidentForDetail.profileImageUrl ? (
                                        <img src={selectedResidentForDetail.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className={`${theme.textMutedSoft}`} />
                                    )}
                                </div>
                                <span className={`text-[11px] tracking-widest ${theme.goldText} uppercase font-semibold text-center mt-2`}>
                                    {selectedResidentForDetail.name}
                                </span>
                                <span className={`inline-block ${theme.statusOk} text-[9px] px-2 py-0.5 tracking-wider uppercase font-medium rounded-sm`}>
                                    {selectedResidentForDetail.status}
                                </span>
                            </div>

                            {/* Cột Phải: Details */}
                            <div className="w-full sm:w-2/3 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className={`block text-[9px] tracking-widest ${theme.textMutedSoft} mb-1 uppercase font-medium`}>Số điện thoại</span>
                                        <div className={`flex items-center gap-2 text-xs font-mono ${theme.title}`}>
                                            <Phone size={12} className={theme.textMutedSoft}/>
                                            {selectedResidentForDetail.phone || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`block text-[9px] tracking-widest ${theme.textMutedSoft} mb-1 uppercase font-medium`}>Giới tính</span>
                                        <div className={`flex items-center gap-2 text-xs font-medium ${theme.title}`}>
                                            <User size={12} className={theme.textMutedSoft}/>
                                            {selectedResidentForDetail.gender === 'Male' ? 'Nam' : selectedResidentForDetail.gender === 'Female' ? 'Nữ' : 'Khác'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className={`block text-[9px] tracking-widest ${theme.textMutedSoft} mb-1 uppercase font-medium`}>Email</span>
                                        <div className={`flex items-center gap-2 text-xs font-mono ${theme.title} break-all`}>
                                            <Mail size={12} className={theme.textMutedSoft}/>
                                            {selectedResidentForDetail.email || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`block text-[9px] tracking-widest ${theme.textMutedSoft} mb-1 uppercase font-medium`}>CMND / CCCD</span>
                                        <div className={`flex items-center gap-2 text-xs font-mono ${theme.title}`}>
                                            <CreditCard size={12} className={theme.textMutedSoft}/>
                                            {selectedResidentForDetail.idCard || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className={`block text-[9px] tracking-widest ${theme.textMutedSoft} mb-1 uppercase font-medium`}>Địa chỉ thường trú</span>
                                    <div className={`flex items-start gap-2 text-xs font-medium ${theme.title}`}>
                                        <MapPin size={12} className={`${theme.textMutedSoft} mt-0.5 shrink-0`}/>
                                        <span className="leading-relaxed">{selectedResidentForDetail.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`flex justify-end pt-4 border-t ${theme.border} mt-6`}>
                            <button onClick={() => setIsDetailModalOpen(false)} className="bg-[#2A2B35] hover:bg-[#353644] text-white text-xs font-semibold px-5 py-2.5 rounded-sm tracking-wider uppercase transition-colors border border-white/10">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}