import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Link2,
    User,
    Phone,
    MapPin,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    X,
    Layers,
    RefreshCw,
    Building,
    Filter,
    Sparkles,
    Home,
    Check,
    Plus,
    UserX
} from 'lucide-react';
import InvitationLinkManager from './InvitationLinkManager';
import { getContracts } from '../api/contractApi';
import { getPendingApprovals } from '../api/invitationLinkApi';
import { getResidentsPaged } from '../api/residentApi';

export default function ResidentManagementSubPage({ isDarkMode = true }) {
    const [organizationId] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ns_account') || '{}').organizationId || '';
        } catch {
            return '';
        }
    });

    const [businessName] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ns_account') || '{}').businessName || 'Hệ Thống NovaStay';
        } catch {
            return 'Hệ Thống NovaStay';
        }
    });

    // Mặc định mở tab Danh sách cư dân (thay vì tab tìm kiếm toàn cục)
    const [activeTab, setActiveTab] = useState('list');
    const [toast, setToast] = useState(null);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

    const loadPendingCount = useCallback(async () => {
        if (!organizationId) return;
        try {
            const data = await getPendingApprovals(organizationId);
            if (Array.isArray(data)) setPendingApprovalsCount(data.length);
        } catch {
            // ignore
        }
    }, [organizationId]);

    useEffect(() => {
        loadPendingCount();
    }, [loadPendingCount, activeTab]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    // States quản lý dữ liệu cư dân (Khởi tạo mảng rỗng, KHÔNG dùng mock data)
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Phân trang danh sách cư dân (Backend Pagination)
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Bộ lọc và tìm kiếm cho danh sách cư dân hiện tại
    const [listSearchTerm, setListSearchTerm] = useState('');
    const [listFilter, setListFilter] = useState('ALL'); // ALL, ACTIVE, PENDING, NO_ROOM

    // Reset về trang 1 khi đổi tìm kiếm hoặc bộ lọc
    useEffect(() => {
        setPageIndex(1);
    }, [listSearchTerm, listFilter]);

    // States cho tab Tìm kiếm toàn nền tảng (Search Hub)
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // States cho xác nhận và mời cư dân
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedResidentForInvite, setSelectedResidentForInvite] = useState(null);
    const [inviteLoading, setInviteLoading] = useState(false);

    // States cho Modal tạo mới cư dân
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newResident, setNewResident] = useState({
        name: '',
        phone: '',
        address: '',
        idCard: '',
        gender: 'Nam'
    });

    // States cho danh sách lời mời từ API invitations
    const [invitations, setInvitations] = useState([]);
    const [invitationsLoading, setInvitationsLoading] = useState(false);
    const [invitationsError, setInvitationsError] = useState('');
    const [inviteStatusFilter, setInviteStatusFilter] = useState('ALL'); // ALL, ACTIVE, PENDING

    // Hàm gọi API đồng bộ để lấy danh sách cư dân từ hệ thống có phân trang backend
    const fetchResidents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const accountData = localStorage.getItem('ns_account');
            let orgId = '';
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    orgId = parsed.organizationId || '';
                    accessToken = parsed.accessToken || '';
                } catch (e) {
                    console.warn('Failed to parse ns_account from localStorage', e);
                }
            }

            if (!orgId) {
                orgId = organizationId || 'a31bfed6-ab82-44ac-9bd1-91a5c8fce4bb';
            }

            const statusParam = listFilter === 'ACTIVE' ? 'ACTIVE' : listFilter === 'PENDING' ? 'PENDING' : null;
            const searchParam = listSearchTerm.trim() || null;

            // 1. Gọi API lấy danh sách cư dân phân trang từ backend (TASK-055 / Pagination)
            // 2. Gọi API lấy danh sách hợp đồng (để ghép số phòng thực tế của cư dân)
            const [pagedRes, contractsData] = await Promise.all([
                getResidentsPaged(orgId, {
                    pageIndex,
                    pageSize,
                    status: statusParam,
                    search: searchParam
                }).catch(() => null),
                getContracts({ organizationId: orgId, pageIndex: 1, pageSize: 200 }).catch(() => null)
            ]);

            let rawList = [];
            let total = 0;
            if (pagedRes && (pagedRes.items || Array.isArray(pagedRes))) {
                rawList = Array.isArray(pagedRes) ? pagedRes : (pagedRes.items || []);
                total = pagedRes.totalCount ?? rawList.length;
                setTotalCount(total);
                setTotalPages(pagedRes.totalPages || Math.ceil(total / pageSize) || 1);
            } else {
                setTotalCount(0);
                setTotalPages(1);
            }

            const contractsList = Array.isArray(contractsData) ? contractsData : (contractsData?.items || contractsData?.data || []);

            // Xây dựng bản đồ ánh xạ số phòng từ hợp đồng
            const roomMap = new Map();
            contractsList.forEach(c => {
                const roomStr = c.roomNumber ? `Phòng ${c.roomNumber}${c.propertyName ? ` · ${c.propertyName}` : ''}` : '';
                if (c.residentId && roomStr) roomMap.set(String(c.residentId).toLowerCase(), roomStr);
                if (c.residentPhone && roomStr) roomMap.set(c.residentPhone.trim(), roomStr);
                if (c.residentName && roomStr) roomMap.set(c.residentName.trim().toLowerCase(), roomStr);
            });

            // Map danh sách cư dân trả về từ backend paged
            const mappedResidents = rawList.map((item, idx) => {
                const phone = item.phone || item.residentPhone || '';
                const name = item.fullName || item.residentName || 'Không rõ tên';
                const idCard = item.identityCardNumber || item.idCard || '';
                const email = item.email || item.residentEmail || '';

                const room = roomMap.get((item.residentId || '').toString().toLowerCase())
                    || (phone ? roomMap.get(phone.trim()) : null)
                    || roomMap.get(name.trim().toLowerCase())
                    || 'Chưa xếp phòng';

                const rawStatus = (item.membershipStatus || item.status || '').toUpperCase();
                const isAct = rawStatus === 'ACTIVE' || rawStatus === 'ĐANG CƯ TRÚ';
                const isPend = rawStatus === 'PENDING' || rawStatus === 'CHỜ XÁC NHẬN';

                return {
                    id: item.membershipCode || item.membershipId || (item.residentId ? String(item.residentId).substring(0, 8).toUpperCase() : `CD-${(pageIndex - 1) * pageSize + idx + 1}`),
                    membershipId: item.membershipId,
                    residentId: item.residentId,
                    name,
                    phone: phone || 'N/A',
                    idCard: idCard || 'N/A',
                    email: email || 'N/A',
                    room,
                    status: isAct ? 'Đang cư trú' : (isPend ? 'Chờ xác nhận' : 'Đang cư trú'),
                    joinedAt: item.joinedAt || item.activatedAt || item.invitedAt || null,
                    rawStatus
                };
            });

            setResidents(mappedResidents);
        } catch (err) {
            console.error('Fetch residents error:', err);
            setError(err.message || 'Lỗi khi kết nối với máy chủ');
        } finally {
            setLoading(false);
        }
    }, [organizationId, pageIndex, pageSize, listFilter, listSearchTerm]);

    // Tải danh sách lời mời trực tiếp
    const fetchInvitations = useCallback(async () => {
        setInvitationsLoading(true);
        setInvitationsError('');
        try {
            const accountData = localStorage.getItem('ns_account');
            let orgId = '';
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    orgId = parsed.organizationId || '';
                    accessToken = parsed.accessToken || '';
                } catch (e) {
                    console.warn('Failed to parse ns_account', e);
                }
            }

            if (!orgId) {
                orgId = organizationId || 'a31bfed6-ab82-44ac-9bd1-91a5c8fce4bb';
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/organizations/${orgId}/residents/invitations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                }
            });

            if (!res.ok) {
                throw new Error('Không thể tải danh sách lời mời');
            }

            const data = await res.json();
            const rawList = Array.isArray(data) ? data : (data?.data || []);

            const mappedInvitations = rawList.map((item) => ({
                id: item.membershipId || item.id || '',
                name: item.residentName || item.fullName || 'Khách mời',
                phone: item.residentPhone || item.phone || 'N/A',
                idCard: item.identityCardNumber || 'N/A',
                status: (item.status === 'ACTIVE' || item.membershipStatus === 'ACTIVE')
                    ? 'Đang cư trú'
                    : (item.status === 'PENDING' || item.membershipStatus === 'PENDING' ? 'Chờ xác nhận' : (item.status || item.membershipStatus || 'Chưa xác định')),
                invitedAt: item.invitedAt || null
            }));

            setInvitations(mappedInvitations);
        } catch (err) {
            console.error('Fetch invitations error:', err);
            setInvitationsError(err.message || 'Lỗi khi kết nối với máy chủ');
        } finally {
            setInvitationsLoading(false);
        }
    }, [organizationId]);

    // Tự động tải dữ liệu khi chuyển tab hoặc đổi trang, bộ lọc, từ khóa (debounce 300ms)
    useEffect(() => {
        if (activeTab === 'list') {
            const timer = setTimeout(() => {
                fetchResidents();
            }, 300);
            return () => clearTimeout(timer);
        } else if (activeTab === 'invite') {
            fetchInvitations();
        }
    }, [activeTab, fetchResidents, fetchInvitations]);

    // Lọc danh sách cư dân (nếu người dùng lọc Chưa xếp phòng)
    const filteredResidents = useMemo(() => {
        if (listFilter === 'NO_ROOM') {
            return residents.filter(r => r.room === 'Chưa xếp phòng');
        }
        return residents;
    }, [residents, listFilter]);

    // Tra cứu cư dân toàn hệ thống theo số điện thoại
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!globalSearchTerm.trim()) return;

        setSearchLoading(true);
        setSearchError('');
        setHasSearched(true);
        try {
            const accountData = localStorage.getItem('ns_account');
            let accessToken = '';
            if (accountData) {
                const parsed = JSON.parse(accountData);
                accessToken = parsed.accessToken || '';
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/residents/search?phone=${encodeURIComponent(globalSearchTerm.trim())}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                }
            });

            if (!res.ok) {
                throw new Error('Không tìm thấy thông tin cư dân hoặc lỗi truy vấn');
            }

            const data = await res.json();
            const list = Array.isArray(data) ? data : [];

            const mappedResults = list.map((item) => ({
                id: item.id || '',
                name: item.fullName || 'Không rõ tên',
                room: 'Chưa xếp phòng',
                phone: item.phone || 'N/A',
                idCard: item.identityCardNumber || 'N/A',
                gender: 'N/A',
                address: item.email || 'N/A',
                status: item.accountId ? 'Đang hoạt động' : 'Chưa kích hoạt'
            }));

            setSearchResults(mappedResults);
        } catch (err) {
            console.error('Search residents error:', err);
            setSearchError(err.message || 'Lỗi khi kết nối với máy chủ');
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClearSearch = () => {
        setGlobalSearchTerm('');
        setSearchResults([]);
        setHasSearched(false);
        setSearchError('');
    };

    // Tạo mới cư dân
    const handleCreateResident = async (e) => {
        e.preventDefault();
        if (!newResident.name) return;

        try {
            const accountData = localStorage.getItem('ns_account');
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    accessToken = parsed.accessToken || '';
                } catch (e) {
                    console.warn('Failed to parse ns_account', e);
                }
            }

            const payload = {
                name: newResident.name,
                sdt: newResident.phone,
                identityCardNumber: newResident.idCard,
                sex: newResident.gender === 'Nam' ? 'Male' : (newResident.gender === 'Nữ' ? 'Female' : 'Other'),
                address: newResident.address
            };

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/residents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 201) {
                showToast('Khởi tạo hồ sơ cư dân thành công!', 'success');
                setIsModalOpen(false);
                setNewResident({ name: '', phone: '', address: '', idCard: '', gender: 'Nam' });
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

    // Mời cư dân gia nhập tổ chức
    const handleInviteConfirm = async () => {
        if (!selectedResidentForInvite) return;
        setInviteLoading(true);
        try {
            const accountData = localStorage.getItem('ns_account');
            let orgId = '';
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    orgId = parsed.organizationId || '';
                    accessToken = parsed.accessToken || '';
                } catch (e) {
                    console.warn('Failed to parse ns_account', e);
                }
            }

            if (!orgId) {
                orgId = organizationId || 'a31bfed6-ab82-44ac-9bd1-91a5c8fce4bb';
            }

            const payload = {
                ResidentId: selectedResidentForInvite.id
            };

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/organizations/${orgId}/residents/invitations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 201) {
                showToast(`Gửi lời mời thành công đến cư dân ${selectedResidentForInvite.name}!`, 'success');
                setIsConfirmModalOpen(false);
                setSelectedResidentForInvite(null);
                fetchResidents();
            } else {
                let errMsg = 'Gửi lời mời thất bại';
                try {
                    const errorData = await res.json();
                    errMsg = errorData?.message || errorData?.error || errMsg;
                } catch (_) { }
                showToast(errMsg, 'error');
            }
        } catch (err) {
            console.error('Invite resident error:', err);
            showToast(err.message || 'Lỗi khi kết nối với máy chủ', 'error');
        } finally {
            setInviteLoading(false);
        }
    };

    // Định nghĩa Theme đồng bộ chuẩn với Luxury Dashboard và Accounting Management
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

    return (
        <div className={`w-full min-h-full transition-colors duration-300 ${theme.bg} font-sans p-6 lg:p-8 space-y-6 relative`}>
            {/* Header phân hệ quản lý cư dân */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${theme.border} pb-5`}>
                <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> HỆ THỐNG QUẢN LÝ CƯ DÂN & LƯU TRÚ
                    </span>
                    <h2 className={`text-2xl font-black tracking-tight ${theme.title} mt-0.5`}>
                        Danh Bộ Cư Dân & Tiếp Nhận Khách Thuê
                    </h2>
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border ${theme.panelSoft}`}>
                    <Building className="w-4 h-4 text-[#D4AF37]" />
                    <span className={theme.textMuted}>Cơ sở vận hành:</span>
                    <span className="text-[#D4AF37] font-black">{businessName}</span>
                </div>
            </div>

            {/* Thanh Tab điều hướng chính (ĐÃ LOẠI BỎ LỊCH SỬ BIẾN ĐỘNG VÌ KHÔNG PHẢI CHỨC NĂNG THẬT) */}
            <div className={`flex flex-wrap gap-2 p-1.5 border rounded-2xl ${theme.panelSoft}`}>
                {[
                    { id: 'list', label: 'Danh Sách Cư Dân', icon: <Users className="w-4 h-4" />, count: residents.length },
                    { id: 'search-hub', label: 'Tra Cứu & Thêm Cư Dân', icon: <Search className="w-4 h-4" /> },
                    { 
                        id: 'invitation-links', 
                        label: 'Tạo Link Mời & Duyệt', 
                        icon: <Link2 className="w-4 h-4" />,
                        count: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
                        isAlert: pendingApprovalsCount > 0
                    },
                    { id: 'invite', label: 'Lời Mời Trực Tiếp', icon: <Mail className="w-4 h-4" /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-wider ${activeTab === tab.id ? theme.cardActive : theme.cardIdle}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {typeof tab.count === 'number' && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                tab.isAlert
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : (activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-[#D4AF37]')
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ---------------- 1. TAB DANH SÁCH CƯ DÂN ĐẦY ĐỦ ---------------- */}
            {activeTab === 'list' && (
                <div className={`rounded-2xl border p-5 md:p-6 shadow-sm space-y-5 ${theme.panel}`}>
                    {/* Thanh tìm kiếm & Lọc trạng thái cư dân */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className={`flex items-center border rounded-xl px-3.5 py-2.5 w-full md:w-96 ${theme.input}`}>
                            <Search className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, SĐT, số phòng, CCCD..."
                                value={listSearchTerm}
                                onChange={(e) => setListSearchTerm(e.target.value)}
                                className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:inherit"
                            />
                            {listSearchTerm && (
                                <button type="button" onClick={() => setListSearchTerm('')} className="text-gray-400 hover:text-white text-xs ml-1">✕</button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${theme.textMutedSoft}`}>
                                    <Filter className="w-3.5 h-3.5 inline mr-1 text-[#D4AF37]" /> Trạng thái:
                                </span>
                                <div className="flex rounded-xl border overflow-hidden text-xs font-bold border-inherit">
                                    {[
                                        { id: 'ALL', label: 'Tất cả' },
                                        { id: 'ACTIVE', label: 'Đang cư trú' },
                                        { id: 'PENDING', label: 'Chờ xác nhận' },
                                        { id: 'NO_ROOM', label: 'Chưa xếp phòng' }
                                    ].map((flt) => (
                                        <button
                                            key={flt.id}
                                            type="button"
                                            onClick={() => setListFilter(flt.id)}
                                            className={`px-3 py-1.5 text-[11px] font-bold transition-colors border-r last:border-none ${listFilter === flt.id
                                                ? 'bg-[#D4AF37] text-black font-black'
                                                : isDarkMode
                                                    ? 'bg-[#161622] text-gray-400 hover:text-white hover:bg-white/5'
                                                    : 'bg-white text-slate-600 hover:bg-amber-50'
                                                }`}
                                        >
                                            {flt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={fetchResidents}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${isDarkMode
                                    ? 'border-[#2A2518] text-gray-300 hover:bg-white/5'
                                    : 'border-[#E5D4AD] text-slate-700 hover:bg-amber-50'
                                    }`}
                                title="Làm mới danh sách"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                                <span className="hidden sm:inline">Tải lại</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-[1.02]"
                            >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Thêm Cư Dân
                            </button>
                        </div>
                    </div>

                    {/* Bảng danh sách cư dân */}
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-[#D4AF37]" />
                            <span className="text-xs font-bold text-gray-400">Đang tổng hợp danh bộ cư dân và hợp đồng lưu trú...</span>
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center p-6 rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 space-y-3">
                            <p className="text-xs font-semibold text-rose-400">{error}</p>
                            <button
                                type="button"
                                onClick={fetchResidents}
                                className="px-4 py-1.5 rounded-xl border border-rose-500/40 text-xs font-bold text-rose-300 hover:bg-rose-500/10"
                            >
                                Thử kết nối lại
                            </button>
                        </div>
                    ) : filteredResidents.length === 0 ? (
                        <div className={`py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2.5 ${theme.panelSoft}`}>
                            <UserX className="w-10 h-10 text-gray-500 stroke-[1.5]" />
                            <h4 className={`text-sm font-bold ${theme.title}`}>Không tìm thấy cư dân nào</h4>
                            <p className="text-xs text-gray-400 max-w-sm">
                                {listSearchTerm || listFilter !== 'ALL'
                                    ? 'Không có hồ sơ nào khớp với bộ lọc hiện tại. Thử xóa từ khóa tìm kiếm.'
                                    : 'Hiện chưa có cư dân nào được ghi nhận. Bạn có thể thêm cư dân mới hoặc tạo link mời.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
                            >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Khởi tạo hồ sơ ngay
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-inherit">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className={`border-b font-black uppercase tracking-wider text-[11px] ${theme.tableHead}`}>
                                        <th className="p-4">Mã Cư Dân</th>
                                        <th className="p-4">Họ Và Tên</th>
                                        <th className="p-4">Căn Hộ / Phòng Thuê</th>
                                        <th className="p-4">Số Điện Thoại</th>
                                        <th className="p-4">Định Danh / CCCD</th>
                                        <th className="p-4 text-right">Trạng Thái Lưu Trú</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme.divide}`}>
                                    {filteredResidents.map((res, index) => {
                                        const isAssigned = res.room && res.room !== 'Chưa xếp phòng';
                                        return (
                                            <tr key={res.id || index} className={`${theme.rowHover} transition-colors group`}>
                                                <td className="p-4 font-mono font-bold text-[#D4AF37]">
                                                    {res.id}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border ${isDarkMode ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-amber-100 text-[#AA7C11] border-amber-300'}`}>
                                                            {res.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <strong className={`block text-xs font-bold ${theme.title}`}>{res.name}</strong>
                                                            {res.email && res.email !== 'N/A' && (
                                                                <span className="text-[10px] text-gray-500 block truncate max-w-[160px]">{res.email}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {isAssigned ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
                                                            <Home className="w-3 h-3" /> {res.room}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-400 bg-gray-500/10 border border-gray-500/20">
                                                            Chưa xếp phòng
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono font-semibold text-gray-300">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-[#D4AF37]" /> {res.phone}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-gray-400 text-xs">
                                                    {res.idCard && res.idCard !== 'N/A' ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <CreditCard className="w-3 h-3 text-gray-500" /> {res.idCard}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Chưa cập nhật</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {res.status === 'Đang cư trú' ? (
                                                        <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl font-bold ${theme.statusOk}`}>
                                                            <CheckCircle2 className="w-3 h-3" /> Đang cư trú
                                                        </span>
                                                    ) : res.status === 'Chờ xác nhận' ? (
                                                        <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl font-bold ${theme.statusPending}`}>
                                                            <Sparkles className="w-3 h-3" /> Chờ xác nhận
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                            {res.status}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Chân trang danh sách có phân trang Backend */}
                    {!loading && filteredResidents.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 pt-4 border-t border-inherit/40 gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span>
                                    Hiển thị <strong className="text-[#D4AF37]">{totalCount > 0 ? (pageIndex - 1) * pageSize + 1 : 0} - {Math.min(pageIndex * pageSize, totalCount)}</strong> / tổng số <strong className="text-[#D4AF37]">{totalCount}</strong> cư dân
                                </span>
                                <span className="text-gray-500">•</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-gray-400">Hiển thị:</span>
                                    <select
                                        value={pageSize}
                                        onChange={e => { setPageSize(Number(e.target.value)); setPageIndex(1); }}
                                        className={`rounded-lg px-2 py-1 text-xs font-bold border transition-all cursor-pointer ${
                                            isDarkMode ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37]' : 'bg-white border-[#E5D4AD] text-slate-800'
                                        }`}
                                    >
                                        <option value={10}>10 / trang</option>
                                        <option value={20}>20 / trang</option>
                                        <option value={50}>50 / trang</option>
                                    </select>
                                </div>
                            </div>

                            {/* Nút phân trang */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                                        disabled={pageIndex <= 1}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                            pageIndex <= 1
                                                ? 'opacity-40 cursor-not-allowed border-transparent text-gray-500'
                                                : isDarkMode
                                                    ? 'border-[#2A2518] hover:border-[#D4AF37] hover:text-white text-gray-300'
                                                    : 'border-[#E5D4AD] hover:bg-amber-50 text-slate-700'
                                        }`}
                                    >
                                        Trước
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - pageIndex) <= 1)
                                        .map((p, idx, arr) => {
                                            const prev = arr[idx - 1];
                                            const showEllipsis = prev && p - prev > 1;
                                            return (
                                                <React.Fragment key={p}>
                                                    {showEllipsis && <span className="px-1 text-gray-500">...</span>}
                                                    <button
                                                        type="button"
                                                        onClick={() => setPageIndex(p)}
                                                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                                            pageIndex === p
                                                                ? 'bg-[#D4AF37] text-black font-black shadow-md shadow-[#D4AF37]/20'
                                                                : isDarkMode
                                                                    ? 'hover:bg-white/5 text-gray-400 hover:text-white'
                                                                    : 'hover:bg-amber-50 text-slate-600'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}

                                    <button
                                        type="button"
                                        onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
                                        disabled={pageIndex >= totalPages}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                            pageIndex >= totalPages
                                                ? 'opacity-40 cursor-not-allowed border-transparent text-gray-500'
                                                : isDarkMode
                                                    ? 'border-[#2A2518] hover:border-[#D4AF37] hover:text-white text-gray-300'
                                                    : 'border-[#E5D4AD] hover:bg-amber-50 text-slate-700'
                                        }`}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ---------------- 2. TAB TRA CỨU HỆ THỐNG & TẠO MỚI CƯ DÂN ---------------- */}
            {activeTab === 'search-hub' && (
                <div className="space-y-6">
                    <div className={`p-6 rounded-2xl border ${theme.panel}`}>
                        <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-1">
                            Tra Cứu Toàn Nền Tảng
                        </span>
                        <h3 className={`text-lg font-black tracking-tight ${theme.title} mb-4`}>
                            Tìm Kiếm Cư Dân Đã Tồn Tại Trong Hệ Thống NovaStay
                        </h3>

                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={globalSearchTerm}
                                    onChange={(e) => {
                                        setGlobalSearchTerm(e.target.value);
                                        if (!e.target.value.trim()) {
                                            setSearchResults([]);
                                            setHasSearched(false);
                                            setSearchError('');
                                        }
                                    }}
                                    placeholder="Nhập số điện thoại cư dân để tra cứu hồ sơ toàn hệ thống..."
                                    className={`w-full rounded-xl px-4 py-3 pl-11 text-xs border font-medium focus:outline-none transition-all ${theme.input}`}
                                />
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                                {globalSearchTerm && (
                                    <button type="button" onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">✕</button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <Search className="w-4 h-4" /> Tra Cứu Ngay
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className={`px-5 py-3 border border-dashed border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap`}
                            >
                                <UserPlus className="w-4 h-4" /> Tạo Mới Cư Dân
                            </button>
                        </form>
                    </div>

                    {/* Kết quả tìm kiếm */}
                    {hasSearched ? (
                        <div className={`p-6 rounded-2xl border space-y-4 ${theme.panel}`}>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                                <span>Kết quả tìm kiếm cho: "{globalSearchTerm}"</span>
                                <span className="text-[#D4AF37]">Tìm thấy {searchResults.length} hồ sơ</span>
                            </div>

                            {searchLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2">
                                    <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                                    <span className="text-xs text-gray-400">Đang truy vấn cơ sở dữ liệu...</span>
                                </div>
                            ) : searchError ? (
                                <div className="p-6 rounded-xl border border-dashed border-rose-500/30 text-center space-y-2">
                                    <p className="text-xs text-rose-400 font-semibold">{searchError}</p>
                                    <button type="button" onClick={handleSearch} className="text-xs font-bold text-[#D4AF37] underline">Thử lại</button>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchResults.map((res) => (
                                        <div key={res.id} className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${theme.panelSoft}`}>
                                            <div className="flex items-center gap-3.5">
                                                <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-base font-black ${isDarkMode ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-amber-300 bg-amber-100 text-[#AA7C11]'}`}>
                                                    {res.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-bold ${theme.title}`}>{res.name}</h4>
                                                    <p className="text-xs font-mono text-gray-400">{res.phone}</p>
                                                    <span className={`text-[10px] inline-block font-semibold px-2 py-0.5 rounded mt-1 ${theme.statusOk}`}>
                                                        {res.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedResidentForInvite(res);
                                                    setIsConfirmModalOpen(true);
                                                }}
                                                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:opacity-90 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                            >
                                                <UserPlus className="w-4 h-4 stroke-[2.5]" /> Mời Gia Nhập Cư Dân
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center rounded-xl border border-dashed border-gray-600/30 flex flex-col items-center justify-center gap-2">
                                    <UserX className="w-8 h-8 text-gray-500" />
                                    <h4 className={`text-xs font-bold ${theme.title}`}>Số điện thoại này chưa đăng ký tài khoản NovaStay</h4>
                                    <p className="text-xs text-gray-400 max-w-xs">
                                        Bạn có thể chủ động khởi tạo hồ sơ và gửi lời mời tham gia ngay bây giờ.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow"
                                    >
                                        <Plus className="w-3.5 h-3.5 stroke-[3]" /> Khởi tạo hồ sơ mới
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 ${theme.panelSoft}`}>
                            <Search className="w-8 h-8 text-gray-500 stroke-[1.5]" />
                            <p className="text-xs text-gray-400 font-medium">
                                Nhập số điện thoại của cư dân vào thanh tìm kiếm bên trên để tra cứu hồ sơ trên toàn nền tảng.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ---------------- 3. TAB LINK MỜI & DUYỆT CƯ DÂN ---------------- */}
            {activeTab === 'invitation-links' && (
                <InvitationLinkManager 
                    organizationId={organizationId} 
                    onPendingChange={setPendingApprovalsCount}
                />
            )}

            {/* ---------------- 4. TAB LỜI MỜI TRỰC TIẾP ---------------- */}
            {activeTab === 'invite' && (() => {
                const filteredInv = invitations.filter((item) => {
                    if (inviteStatusFilter === 'ALL') return true;
                    if (inviteStatusFilter === 'ACTIVE') return item.status === 'Đang cư trú' || item.status === 'Active';
                    if (inviteStatusFilter === 'PENDING') return item.status === 'Chờ xác nhận' || item.status === 'PENDING';
                    return true;
                });

                return (
                    <div className={`p-6 rounded-2xl border space-y-5 ${theme.panel}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-inherit/40">
                            <div>
                                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase">LỜI MỜI TRỰC TIẾP</span>
                                <h3 className={`text-lg font-black tracking-tight ${theme.title} mt-0.5`}>
                                    Danh Sách Lời Mời Cư Dân Đã Phát Hành
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex rounded-xl border overflow-hidden text-xs font-bold border-inherit">
                                    {[
                                        { id: 'ALL', label: 'Tất cả' },
                                        { id: 'ACTIVE', label: 'Đã chấp nhận' },
                                        { id: 'PENDING', label: 'Chờ xác nhận' }
                                    ].map((flt) => (
                                        <button
                                            key={flt.id}
                                            type="button"
                                            onClick={() => setInviteStatusFilter(flt.id)}
                                            className={`px-3 py-1.5 text-[11px] font-bold transition-colors border-r last:border-none ${inviteStatusFilter === flt.id
                                                ? 'bg-[#D4AF37] text-black font-black'
                                                : isDarkMode
                                                    ? 'bg-[#161622] text-gray-400 hover:text-white'
                                                    : 'bg-white text-slate-600 hover:bg-amber-50'
                                                }`}
                                        >
                                            {flt.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    disabled={invitationsLoading}
                                    onClick={fetchInvitations}
                                    className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'border-[#2A2518] text-gray-300 hover:bg-white/5' : 'border-[#E5D4AD] text-slate-700 hover:bg-amber-50'}`}
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${invitationsLoading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {invitationsLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-2">
                                <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                                <span className="text-xs text-gray-400">Đang tải danh sách lời mời...</span>
                            </div>
                        ) : invitationsError ? (
                            <div className="p-6 text-center text-xs text-rose-400 border border-dashed border-rose-500/30 rounded-xl">
                                {invitationsError}
                            </div>
                        ) : filteredInv.length === 0 ? (
                            <div className={`py-12 text-center rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 ${theme.panelSoft}`}>
                                <Mail className="w-8 h-8 text-gray-500 stroke-[1.5]" />
                                <span className="text-xs text-gray-400 font-medium">Không tìm thấy lời mời nào phù hợp với bộ lọc.</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-inherit">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${theme.tableHead}`}>
                                            <th className="p-3.5">Cư Dân Nhận Lời Mời</th>
                                            <th className="p-3.5">Số Điện Thoại</th>
                                            <th className="p-3.5">Định Danh / CCCD</th>
                                            <th className="p-3.5">Thời Gian Gửi</th>
                                            <th className="p-3.5 text-right">Trạng Thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${theme.divide}`}>
                                        {filteredInv.map((item, idx) => (
                                            <tr key={item.id || idx} className={`${theme.rowHover} transition-colors`}>
                                                <td className="p-3.5 font-bold text-white">{item.name}</td>
                                                <td className="p-3.5 font-mono text-gray-300">{item.phone}</td>
                                                <td className="p-3.5 font-mono text-gray-400">{item.idCard}</td>
                                                <td className="p-3.5 text-gray-400 text-xs">
                                                    {item.invitedAt ? new Date(item.invitedAt).toLocaleString('vi-VN') : '—'}
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-xl font-bold ${item.status === 'Chờ xác nhận' || item.status === 'PENDING'
                                                        ? theme.statusPending
                                                        : theme.statusOk
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* ---------------- MODAL FORM: THÊM CƯ DÂN MỚI ---------------- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-lg rounded-2xl border p-6 md:p-8 shadow-2xl transition-all ${theme.modalBg}`}>
                        <div className="flex justify-between items-center border-b pb-4 mb-5 border-inherit/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                                    <UserPlus className="w-5 h-5 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h3 className={`text-base font-black tracking-tight ${theme.title}`}>Khởi Tạo Hồ Sơ Cư Dân Mới</h3>
                                    <p className="text-[11px] text-gray-400">Đăng ký cư dân vào hệ thống NovaStay</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateResident} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.textMuted}`}>Họ và tên *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            value={newResident.name}
                                            onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                                            className={`w-full rounded-xl px-3.5 py-2.5 pl-9 text-xs border font-medium focus:outline-none transition-all ${theme.modalInput}`}
                                        />
                                        <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.textMuted}`}>Số điện thoại *</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            required
                                            placeholder="09xx.xxx.xxx"
                                            value={newResident.phone}
                                            onChange={(e) => setNewResident({ ...newResident, phone: e.target.value })}
                                            className={`w-full rounded-xl px-3.5 py-2.5 pl-9 text-xs border font-mono font-bold focus:outline-none transition-all ${theme.modalInput}`}
                                        />
                                        <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.textMuted}`}>Số CMND / CCCD</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Số CCCD 12 số..."
                                            value={newResident.idCard}
                                            onChange={(e) => setNewResident({ ...newResident, idCard: e.target.value })}
                                            className={`w-full rounded-xl px-3.5 py-2.5 pl-9 text-xs border font-mono focus:outline-none transition-all ${theme.modalInput}`}
                                        />
                                        <CreditCard className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.textMuted}`}>Giới tính</label>
                                    <div className="grid grid-cols-3 gap-2 h-9">
                                        {['Nam', 'Nữ', 'Khác'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setNewResident({ ...newResident, gender: g })}
                                                className={`text-xs rounded-xl border font-bold transition-all ${newResident.gender === g
                                                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                                    : theme.buttonOutline
                                                    }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className={`text-[10px] font-black uppercase tracking-wider block ${theme.textMuted}`}>Địa chỉ thường trú / Quê quán</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tỉnh/Thành phố, Quận/Huyện..."
                                        value={newResident.address}
                                        onChange={(e) => setNewResident({ ...newResident, address: e.target.value })}
                                        className={`w-full rounded-xl px-3.5 py-2.5 pl-9 text-xs border focus:outline-none transition-all ${theme.modalInput}`}
                                    />
                                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="flex gap-2.5 justify-end pt-4 border-t border-inherit/40 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${isDarkMode ? 'border-[#2A2518] text-gray-300 hover:bg-white/5' : 'border-[#E5D4AD] text-slate-700 hover:bg-amber-50'}`}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
                                >
                                    Lưu Hồ Sơ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------------- MODAL XÁC NHẬN MỜI CƯ DÂN ---------------- */}
            {isConfirmModalOpen && selectedResidentForInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${theme.modalBg}`}>
                        <div className="flex justify-between items-center border-b pb-4 mb-4 border-inherit/40">
                            <h3 className={`text-sm font-black tracking-tight ${theme.title} flex items-center gap-2`}>
                                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Xác Nhận Gửi Lời Mời Cư Dân
                            </h3>
                            {!inviteLoading && (
                                <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4 text-xs">
                            <p className="leading-relaxed text-gray-300">
                                Bạn có chắc chắn muốn gửi lời mời cư dân <strong className="text-white font-bold">{selectedResidentForInvite.name}</strong> gia nhập cơ sở <strong className="text-[#D4AF37]">{businessName}</strong>?
                            </p>
                            <p className="text-[11px] text-gray-400">
                                Sau khi gửi, cư dân có thể chấp thuận lời mời thông qua ứng dụng NovaStay để kết nối vào hệ thống của bạn.
                            </p>

                            <div className="flex gap-2.5 justify-end pt-3 border-t border-inherit/40">
                                <button
                                    type="button"
                                    disabled={inviteLoading}
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${isDarkMode ? 'border-[#2A2518] text-gray-300 hover:bg-white/5' : 'border-[#E5D4AD] text-slate-700 hover:bg-amber-50'}`}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    disabled={inviteLoading}
                                    onClick={handleInviteConfirm}
                                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {inviteLoading ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 stroke-[2.5]" /> Xác Nhận Gửi Lời Mời
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- FLOATING TOAST NOTIFICATION ---------------- */}
            {toast && (
                <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm ${toast.type === 'success'
                        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                        }`}>
                        <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                            <span className="text-xs font-bold block">{toast.message}</span>
                        </div>
                        <button type="button" onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
