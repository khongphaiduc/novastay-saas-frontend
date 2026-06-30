import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Sparkles, Bell, X, Check, Mail, Info, Copy, Clock, Phone, LogOut, User } from 'lucide-react';
import NovastayLogo from '../components/NovastayLogo';

const initialAccommodationList = [
    { id: 'ptd-house', name: 'PTD House', type: 'Luxury Villa', address: 'Quận 1, TP. Hồ Chí Minh' },
    { id: 'novastay-dorm', name: 'NovaStay Dorm', type: 'Premium Residence', address: 'Cầu Giấy, Hà Nội' },
    { id: 'chung-cu-a', name: 'Chung cư A', type: 'High-end Apartment', address: 'Bình Thạnh, TP. Hồ Chí Minh' }
];

const defaultInvitations = [
    {
        id: 'invite-villa-q3',
        orgId: 'villa-q3',
        name: 'NovaStay Villa Q3',
        type: 'Luxury Villa',
        address: 'Quận 3, TP. Hồ Chí Minh',
        message: 'Trân trọng kính mời quý cư dân tham gia trải nghiệm không gian sống cao cấp tại biệt thự biệt lập của chúng tôi.',
        sender: 'BQL NovaStay Q3',
        date: '23/06/2026'
    },
    {
        id: 'invite-golden-land',
        orgId: 'golden-land',
        name: 'NovaStay Golden Land',
        type: 'Premium Residence',
        address: 'Thanh Xuân, Hà Nội',
        message: 'Chào mừng bạn đến với căn hộ thông minh thuộc hệ thống dịch vụ cao cấp NovaStay.',
        sender: 'Chủ đầu tư: Phạm Trung Đức',
        date: '22/06/2026'
    }
];

export default function AccommodationApp() {
    const navigate = useNavigate();

    // Lấy thông tin tài khoản đã đăng nhập
    const [account, setAccount] = useState(() => {
        const data = localStorage.getItem('ns_account');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (_) { }
        }
        return null;
    });

    const residentName = account?.name || account?.customerName || '';

    // Khởi tạo danh sách nơi ở từ localStorage hoặc danh sách gốc
    const [list, setList] = useState(() => {
        const saved = localStorage.getItem('ns_accommodations_list');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (_) { }
        }
        return initialAccommodationList;
    });

    // Khởi tạo danh sách lời mời
    const [invitations, setInvitations] = useState(() => {
        const saved = localStorage.getItem('ns_invitations_list');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (_) { }
        }
        return defaultInvitations;
    });

    const [showNotifModal, setShowNotifModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [selectedPendingOrg, setSelectedPendingOrg] = useState(null);

    // Profile state
    const [profile, setProfile] = useState(null);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: '', phone: '', email: '', address: '' });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    const API_ROOT = import.meta.env.VITE_API_URL || '';

    const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return `${API_ROOT}/api/rooms/proxy-image?url=${encodeURIComponent(url)}`;
        }
        return url;
    };

    const getAuthHeaders = useCallback(() => {
        const token = account?.accessToken || '';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'accessToken': token,
        };
    }, [account]);

    const fetchProfile = useCallback(async () => {
        if (!account?.accessToken) return;
        try {
            const res = await fetch(`${API_ROOT}/api/residents/me`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                // Cập nhật lại account local storage nếu cần
                const updatedAccount = { ...account, name: data.fullName, customerName: data.fullName };
                localStorage.setItem('ns_account', JSON.stringify(updatedAccount));
                setAccount(updatedAccount);
            }
        } catch (e) {
            console.error('Error fetching profile:', e);
        }
    }, [API_ROOT, account, getAuthHeaders]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const openEditProfile = () => {
        setEditForm({
            fullName: profile?.fullName || residentName || '',
            phone: profile?.phone || account?.phone || '',
            email: profile?.email || account?.email || '',
            address: profile?.address || account?.address || '',
        });
        setAvatarFile(null);
        setAvatarPreview(null);
        setEditError('');
        setEditProfileOpen(true);
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSaveProfile = async () => {
        setEditSaving(true); setEditError('');
        try {
            // 1. Upload avatar
            if (avatarFile) {
                setAvatarUploading(true);
                const fd = new FormData();
                fd.append('file', avatarFile);
                const avatarRes = await fetch(`${API_ROOT}/api/residents/me/avatar`, {
                    method: 'POST',
                    headers: { 'Authorization': getAuthHeaders().Authorization, 'accessToken': getAuthHeaders().accessToken },
                    body: fd,
                });
                if (!avatarRes.ok) throw new Error('Upload ảnh thất bại');
                setAvatarUploading(false);
            }
            // 2. Cập nhật profile
            const res = await fetch(`${API_ROOT}/api/residents/me/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(editForm),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Cập nhật thất bại');
            }
            const updated = await res.json();
            setProfile(updated);
            
            // Cập nhật local storage account name
            const updatedAccount = { ...account, name: updated.fullName, customerName: updated.fullName };
            localStorage.setItem('ns_account', JSON.stringify(updatedAccount));
            setAccount(updatedAccount);

            setEditProfileOpen(false);
        } catch (e) {
            setEditError(e.message || 'Lỗi không xác định');
        } finally {
            setEditSaving(false);
            setAvatarUploading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Chưa xác định';
        try {
            const d = new Date(dateStr);
            return d.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (_) {
            return dateStr;
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        showToast('Đã sao chép mã thành viên vào bộ nhớ tạm!', 'success');
    };

    const handleLogout = async () => {
        try {
            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const token = account?.accessToken || '';
            const rToken = account?.refreshToken || '';

            await fetch(`${API_ROOT}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'accessToken': token,
                },
                body: JSON.stringify({
                    RefreshToken: rToken
                })
            });
        } catch (err) {
            console.error('Lỗi khi đăng xuất:', err);
        } finally {
            localStorage.removeItem('ns_account');
            navigate('/');
        }
    };

    // Gọi API lấy danh sách các accommodations của cư dân hiện tại
    const fetchAccommodations = async () => {
        if (!account?.accessToken) return;
        try {
            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/residents/me/accommodations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${account.accessToken}`,
                    'accessToken': account.accessToken,
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();

            let rawList = [];
            if (Array.isArray(data)) {
                rawList = data;
            } else if (data && typeof data === 'object') {
                if (data.membershipId || data.organizationId || data.businessName) {
                    rawList = [data];
                } else {
                    const nested = data.data || data.accommodations || [];
                    rawList = Array.isArray(nested) ? nested : (nested && typeof nested === 'object' ? [nested] : []);
                }
            }

            const mappedList = rawList.map((item) => ({
                id: item.organizationId || item.membershipId || '',
                organizationId: item.organizationId || '',
                membershipId: item.membershipId,
                name: item.businessName || 'Không rõ tên',
                type: item.membershipStatus === 'ACTIVE' ? 'Premium Residence' : 'Chờ xác nhận',
                address: item.businessArea || 'Chưa xác định',
                membershipStatus: item.membershipStatus,
                membershipCode: item.membershipCode || '',
                joinedAt: item.joinedAt || '',
                ownerPhone: item.ownerPhone || '',
                ownerEmail: item.ownerEmail || ''
            }));
            setList(mappedList);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách accommodations từ API:', err);
        }
    };

    // Gọi API lấy danh sách lời mời chờ duyệt
    const fetchInvitations = async () => {
        if (!account?.accessToken) return;
        try {
            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/resident-invitations/pending`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${account.accessToken}`,
                    'accessToken': account.accessToken,
                }
            });

            if (!res.ok) {
                throw new Error('Không thể lấy danh sách lời mời');
            }

            const data = await res.json();
            const rawInvitations = Array.isArray(data) ? data : (data?.data || data?.invitations || []);

            const mappedInvitations = rawInvitations.map((item) => ({
                id: item.membershipId || '',
                orgId: item.organizationId || '',
                name: item.businessName || 'Không rõ tên',
                type: 'Lời mời cư dân',
                address: item.businessArea || 'Chưa xác định',
                message: `Mã đăng ký thành viên: ${item.membershipCode || ''}. Trạng thái: ${item.status || 'PENDING'}`,
                sender: `Chủ trọ / Ban quản lý`,
                date: item.invitedAt ? new Date(item.invitedAt).toLocaleDateString('vi-VN') : 'Mới nhận',
                ownerPhone: item.ownerPhone || '',
                ownerEmail: item.ownerEmail || '',
                membershipCode: item.membershipCode || ''
            }));
            setInvitations(mappedInvitations);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách lời mời từ API:', err);
        }
    };

    useEffect(() => {
        fetchAccommodations();
    }, [account]);

    useEffect(() => {
        fetchInvitations();
    }, [account]);

    // Đồng bộ danh sách nơi ở và lời mời vào localStorage khi thay đổi
    useEffect(() => {
        localStorage.setItem('ns_accommodations_list', JSON.stringify(list));
    }, [list]);

    useEffect(() => {
        localStorage.setItem('ns_invitations_list', JSON.stringify(invitations));
    }, [invitations]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Tất cả các item trừ 'chung-cu-a' đều có thể lựa chọn để điều hướng vào trọ
    const isSelectable = (id) => id !== 'chung-cu-a';

    const handleSelectOrg = (org) => {
        if (!isSelectable(org.id)) {
            const updated = list.filter(item => item.id !== org.id);
            setList(updated);
            showToast(`Đã xóa ${org.name} khỏi danh sách`, 'info');
        } else if (org.membershipStatus && org.membershipStatus !== 'ACTIVE') {
            setSelectedPendingOrg(org);
            setShowPendingModal(true);
        } else {
            // Cập nhật organizationId và các thông tin khác trong ns_account
            const data = localStorage.getItem('ns_account');
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    parsed.organizationId = org.organizationId || org.id;
                    parsed.businessName = org.name;
                    parsed.address = org.address;
                    parsed.ownerPhone = org.ownerPhone || '';
                    parsed.ownerEmail = org.ownerEmail || '';
                    localStorage.setItem('ns_account', JSON.stringify(parsed));
                } catch (_) { }
            }
            showToast(`Đang kết nối tới ${org.name}...`, 'success');
            setTimeout(() => {
                navigate('/resident');
            }, 1000);
        }
    };

    const handleAcceptInvite = async (invite) => {
        try {
            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const token = account?.accessToken || '';
            const res = await fetch(`${API_ROOT}/api/resident-memberships/${invite.id}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'accessToken': token,
                },
                body: JSON.stringify({
                    isAccepted: true
                })
            });
            if (res.ok) {
                showToast(`Đã chấp nhận lời mời tham gia ${invite.name}!`, 'success');
                fetchAccommodations();
                fetchInvitations();
            } else {
                throw new Error(`HTTP Error ${res.status}`);
            }
        } catch (err) {
            console.warn('Lỗi khi chấp nhận lời mời qua API:', err);
            showToast('Lỗi khi chấp nhận lời mời', 'error');
        }
    };

    const handleDeclineInvite = async (invite) => {
        try {
            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const token = account?.accessToken || '';
            const res = await fetch(`${API_ROOT}/api/resident-memberships/${invite.id}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'accessToken': token,
                },
                body: JSON.stringify({
                    isAccepted: false
                })
            });
            if (res.ok) {
                showToast(`Đã từ chối lời mời từ ${invite.sender}`, 'info');
                fetchInvitations();
            } else {
                throw new Error(`HTTP Error ${res.status}`);
            }
        } catch (err) {
            console.warn('Lỗi khi từ chối lời mời qua API:', err);
            showToast('Lỗi khi từ chối lời mời', 'error');
        }
    };

    return (
        <div className="min-h-screen text-[#2D3139] font-sans antialiased selection:bg-[#E8CE7B] selection:text-gray-900 relative overflow-x-hidden">

            {/* ================= HỆ THỐNG BACKGROUND LUXURY ================= */}
            <div className="fixed inset-0 z-0 bg-[#0B0C10] pointer-events-none" />

            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-85 transform scale-105 transition-all duration-700 pointer-events-none"
                style={{
                    backgroundImage: `url('https://housedesign.vn/wp-content/uploads/2020/03/giuong-ngu-khach-san.jpg')`
                }}
            />
            <div className="fixed inset-0 z-0 bg-black/35 pointer-events-none" />
            <div className="fixed inset-0 z-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.5)] pointer-events-none" />

            {/* TOP BAR HEADER */}
            <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-6">
                <div className="flex items-center space-x-3">
                    <NovastayLogo className="h-8 w-auto text-[#D4B055]" />
                    <span className="text-sm font-serif tracking-[0.2em] text-white uppercase hidden sm:inline">
                        NovaStay <span className="text-[#D4B055]">Elite</span>
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Hộp tên người dùng */}
                    <div 
                        onClick={openEditProfile}
                        title="Nhấn để chỉnh sửa hồ sơ"
                        className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md cursor-pointer hover:bg-white/10 hover:border-[#D4B055]/50 transition-all duration-300"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D4B055] to-[#E8CE7B] flex items-center justify-center text-xs font-black text-gray-900 shadow-sm overflow-hidden border border-[#D4B055]/30">
                            {profile?.profileImageUrl || profile?.avatarUrl ? (
                                <img src={formatImageUrl(profile.profileImageUrl || profile.avatarUrl)} alt={residentName} className="w-full h-full object-cover" />
                            ) : (
                                residentName ? residentName.substring(0, 1).toUpperCase() : 'N'
                            )}
                        </div>
                        <span className="text-sm text-gray-200 font-bold tracking-wide hidden sm:inline">
                            {residentName || 'Quý khách'}
                        </span>
                    </div>

                    {/* Nút Chuông Thông Báo */}
                    <button
                        onClick={() => setShowNotifModal(true)}
                        className="relative p-3 rounded-full bg-white/5 hover:bg-white/10 border border-[#D4B055]/30 hover:border-[#D4B055]/60 transition-all duration-300 backdrop-blur-md group cursor-pointer shadow-lg hover:shadow-[#D4B055]/10"
                    >
                        <Bell className="w-5 h-5 text-[#E8CE7B] group-hover:scale-110 transition-transform duration-300" />
                        {invitations.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-r from-red-500 to-rose-600 text-[10px] font-bold text-white items-center justify-center border border-black/10">
                                    {invitations.length}
                                </span>
                            </span>
                        )}
                    </button>

                    {/* Nút Thoát (Đăng Xuất) */}
                    <button
                        onClick={handleLogout}
                        className="p-3 rounded-full bg-white/5 hover:bg-red-500/10 border border-[#D4B055]/30 hover:border-red-500/50 transition-all duration-300 backdrop-blur-md group cursor-pointer shadow-lg hover:shadow-red-500/10"
                        title="Thoát tài khoản"
                    >
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 group-hover:scale-110 transition-transform duration-300" />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT LAYER */}
            <div className="relative z-10 opacity-100 scale-100">
                <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24 sm:py-16">
                    <div className="text-center mb-14 max-w-lg">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/90 border border-[#D4B055]/20 rounded-full mb-6 shadow-[0_4px_12px_rgba(212,176,85,0.1)] backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4B055] animate-pulse" />
                            <span className="text-[10px] tracking-[0.3em] uppercase text-[#6B5A39] font-bold">The Elite Club</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-serif tracking-wide text-white mb-4 font-normal">
                            NovaStay <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4B055] via-[#E8CE7B] to-[#C5A040]">Welcome Home</span>
                        </h1>
                        <div className="w-12 h-[1px] bg-[#D4B055]/50 mx-auto my-4"></div>
                        <p className="text-sm tracking-[0.2em] text-[#5C4C2B] uppercase leading-relaxed font-bold bg-white/70 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm inline-block">
                            Vui lòng lựa chọn không gian trải nghiệm đặc quyền
                        </p>
                    </div>

                    {/* Danh sách các nơi lưu trú */}
                    <div className="w-full max-w-2xl space-y-4">
                        {list.length > 0 ? (
                            list.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectOrg(item)}
                                    className="group relative w-full text-left p-6 sm:p-7 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#D4B055]/10 hover:border-[#D4B055]/50 transition-all duration-300 shadow-[0_15px_35px_rgba(212,176,85,0.05)] hover:shadow-[0_20px_40px_rgba(212,176,85,0.15)] flex items-center justify-between overflow-hidden"
                                >
                                    <div className="flex items-center space-x-6 relative z-10">
                                        <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#D4B055]/10 text-[#5A606F] group-hover:text-[#D4B055] group-hover:bg-[#D4B055]/10 group-hover:border-[#D4B055]/30 transition-all duration-300 dynamic-icon">
                                            <Building2 className="w-5 h-5 stroke-[1.5]" />
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase block mb-1 ${item.membershipStatus === 'ACTIVE' || !item.membershipStatus ? 'text-[#D4B055]' : 'text-amber-500'
                                                }`}>
                                                {item.membershipStatus === 'ACTIVE' ? 'Premium Residence' : (item.membershipStatus ? 'Chờ kích hoạt' : item.type)}
                                            </span>
                                            <h3 className="text-xl font-serif text-[#111622] group-hover:text-[#D4B055] transition-colors duration-200">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-[#6B5A39] mt-1 font-light tracking-wide">{item.address}</p>
                                        </div>
                                    </div>

                                    <div
                                        className={`p-2.5 rounded-full border border-gray-100 relative z-10 transition-all duration-300 transform group-hover:scale-110 ${isSelectable(item.id)
                                                ? 'text-gray-400 group-hover:text-[#D4B055] group-hover:border-[#D4B055]/40 group-hover:bg-[#D4B055]/10 group-hover:translate-x-1'
                                                : 'text-red-400 group-hover:text-red-600 group-hover:border-red-200 group-hover:bg-red-50'
                                            }`}
                                    >
                                        {isSelectable(item.id) ? (
                                            <ChevronRight className="w-4 h-4 stroke-[2]" />
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-1">Xóa</span>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="relative w-full overflow-hidden rounded-3xl bg-black/40 backdrop-blur-2xl border border-[#D4B055]/20 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
                                {/* Gold Glow Aura inside empty state */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4B055]/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#E8CE7B]/5 rounded-full blur-3xl pointer-events-none" />

                                {/* Icon container with glow */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-[#D4B055]/20 rounded-2xl blur-lg animate-pulse" />
                                    <div className="relative p-5 bg-gradient-to-br from-[#1E2025] to-[#111215] rounded-2xl border border-[#D4B055]/30 text-[#E8CE7B] flex items-center justify-center shadow-inner">
                                        <Building2 className="w-8 h-8 stroke-[1.2]" />
                                    </div>
                                </div>

                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4B055] mb-2 block">
                                    Không Gian Trống
                                </span>

                                <h3 className="text-xl font-serif text-white tracking-wide mb-3">
                                    Chưa Có Nơi Lưu Trú
                                </h3>

                                <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-light mb-8">
                                    Tài khoản cư dân của bạn chưa được liên kết với căn hộ nào trong hệ thống. Vui lòng liên hệ với chủ trọ hoặc kiểm tra hộp thư lời mời.
                                </p>

                                <button
                                    onClick={() => setShowNotifModal(true)}
                                    className="px-6 py-3 rounded-xl text-xs font-black text-gray-950 bg-gradient-to-r from-[#D4B055] to-[#E8CE7B] hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center space-x-2 shadow-[0_4px_20px_rgba(212,176,85,0.3)] cursor-pointer"
                                >
                                    <Mail className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Kiểm Tra Lời Mời</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="mt-20 text-[10px] text-[#D4B055] tracking-[0.3em] uppercase font-bold">
                        NovaStay Resident Portal © 2026
                    </p>
                </div>
            </div>

            {/* ================= MODAL HỘP THƯ LỜI MỜI (GLASSMORPHISM) ================= */}
            {showNotifModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setShowNotifModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-black/60 backdrop-blur-2xl border border-[#D4B055]/30 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                        {/* Gold Glow Aura behind */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#D4B055]/10 rounded-full blur-[60px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-6 border-b border-[#D4B055]/15 flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-[#D4B055]/10 rounded-xl border border-[#D4B055]/20">
                                    <Mail className="w-5 h-5 text-[#E8CE7B]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-serif text-white tracking-wide">Hộp Thư Lời Mời</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-[#D4B055] font-bold mt-0.5">
                                        {invitations.length} Lời mời đang chờ
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNotifModal(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Invitation List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 custom-scrollbar">
                            {invitations.length > 0 ? (
                                invitations.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-[#D4B055]/20 transition-all duration-300 group/item"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="p-3 bg-[#FFFDF8]/5 rounded-xl border border-[#D4B055]/10 text-[#E8CE7B] group-hover/item:border-[#D4B055]/30 transition-all">
                                                <Building2 className="w-5 h-5 stroke-[1.5]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold tracking-widest text-[#D4B055] uppercase">
                                                        {invite.type}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-light">
                                                        {invite.date}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-serif text-white mt-0.5 group-hover/item:text-[#E8CE7B] transition-colors">
                                                    {invite.name}
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-1 font-light tracking-wide leading-relaxed">
                                                    {invite.address}
                                                </p>

                                                {/* Thư nhắn */}
                                                <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-300 font-light italic leading-relaxed">
                                                    "{invite.message}"
                                                </div>

                                                <div className="mt-2 text-[10px] text-gray-400 font-medium flex flex-wrap gap-x-4 gap-y-1">
                                                    <span>Người gửi: <span className="text-gray-200">{invite.sender}</span></span>
                                                    {invite.ownerPhone && <span>SĐT: <span className="text-[#E8CE7B]">{invite.ownerPhone}</span></span>}
                                                    {invite.ownerEmail && <span>Email: <span className="text-[#E8CE7B]">{invite.ownerEmail}</span></span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-end space-x-3">
                                            <button
                                                onClick={() => handleDeclineInvite(invite)}
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
                                            >
                                                Từ chối
                                            </button>
                                            <button
                                                onClick={() => handleAcceptInvite(invite)}
                                                className="px-5 py-2 rounded-xl text-xs font-black text-gray-950 bg-gradient-to-r from-[#D4B055] to-[#E8CE7B] hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center space-x-1.5 shadow-[0_4px_12px_rgba(212,176,85,0.2)] cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                <span>Chấp nhận</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="w-16 h-16 bg-[#D4B055]/5 rounded-full border border-[#D4B055]/10 flex items-center justify-center mb-4 text-[#D4B055]/60">
                                        <Mail className="w-8 h-8 stroke-[1.2]" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-white tracking-wide">Hộp thư đang trống</h4>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[240px] font-light leading-relaxed">
                                        Hiện tại bạn không có lời mời nào tham gia các căn hộ hay tổ chức mới.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL CHI TIẾT CHỜ KÍCH HOẠT ================= */}
            {showPendingModal && selectedPendingOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setShowPendingModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-md bg-black/60 backdrop-blur-2xl border border-[#D4B055]/30 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                        {/* Gold Glow Aura behind */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#D4B055]/10 rounded-full blur-[60px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-6 border-b border-[#D4B055]/15 flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-[#D4B055]/10 rounded-xl border border-[#D4B055]/20">
                                    <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-serif text-white tracking-wide">Yêu Cầu Chờ Kích Hoạt</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-[#D4B055] font-bold mt-0.5">
                                        Trạng thái: {selectedPendingOrg.membershipStatus}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPendingModal(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 relative z-10">
                            {/* Chi tiết tổ chức */}
                            <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-start">
                                    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Tên nơi ở</span>
                                    <span className="text-sm text-white font-medium text-right max-w-[200px]">{selectedPendingOrg.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Khu vực</span>
                                    <span className="text-sm text-gray-300">{selectedPendingOrg.address}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Ngày tham gia</span>
                                    <span className="text-sm text-gray-300">{formatDate(selectedPendingOrg.joinedAt)}</span>
                                </div>

                                <div className="border-t border-white/5 pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-[11px] text-[#D4B055] uppercase tracking-wider font-bold block">Mã thành viên</span>
                                            <span className="text-sm font-mono text-white select-all">{selectedPendingOrg.membershipCode || 'N/A'}</span>
                                        </div>
                                        {selectedPendingOrg.membershipCode && (
                                            <button
                                                onClick={() => handleCopyCode(selectedPendingOrg.membershipCode)}
                                                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#D4B055]/10 hover:bg-[#D4B055]/20 border border-[#D4B055]/20 text-xs text-[#E8CE7B] transition-colors cursor-pointer"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Sao chép</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Liên hệ chủ nhà */}
                            <div className="space-y-3 bg-[#D4B055]/5 p-5 rounded-2xl border border-[#D4B055]/15">
                                <h3 className="text-xs uppercase tracking-widest text-[#E8CE7B] font-bold">Liên hệ chủ trọ / Quản lý</h3>

                                {selectedPendingOrg.ownerPhone && (
                                    <a
                                        href={`tel:${selectedPendingOrg.ownerPhone}`}
                                        className="flex items-center space-x-3 text-sm text-gray-200 hover:text-[#E8CE7B] transition-colors py-1 group"
                                    >
                                        <div className="p-1.5 bg-[#D4B055]/10 rounded-lg text-[#E8CE7B] group-hover:scale-105 transition-transform">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span>{selectedPendingOrg.ownerPhone}</span>
                                    </a>
                                )}

                                {selectedPendingOrg.ownerEmail && (
                                    <a
                                        href={`mailto:${selectedPendingOrg.ownerEmail}`}
                                        className="flex items-center space-x-3 text-sm text-gray-200 hover:text-[#E8CE7B] transition-colors py-1 group"
                                    >
                                        <div className="p-1.5 bg-[#D4B055]/10 rounded-lg text-[#E8CE7B] group-hover:scale-105 transition-transform">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="truncate max-w-[250px]">{selectedPendingOrg.ownerEmail}</span>
                                    </a>
                                )}
                            </div>
                        {/* Lời nhắn thân thiện */}
                            <p className="text-[11px] text-gray-400 font-light leading-relaxed italic text-center px-2">
                                * Yêu cầu tham gia của bạn đang được xử lý. Bạn có thể liên hệ trực tiếp với chủ trọ/ban quản lý để được kích hoạt tài khoản cư dân.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => setShowPendingModal(false)}
                                className="w-full px-5 py-3 rounded-xl text-xs font-bold text-gray-900 bg-gradient-to-r from-[#D4B055] to-[#E8CE7B] hover:brightness-110 active:scale-[0.98] transition-all duration-200 text-center cursor-pointer shadow-lg shadow-[#D4B055]/15"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL CHỈNH SỬA HỒ SƠ CÁ NHÂN ================= */}
            {editProfileOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1A1A1A] border border-[#D4B055]/20 rounded-2xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl shadow-[#D4B055]/10 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-[#D4B055]/10">
                            <div>
                                <h3 className="text-xl font-serif text-white tracking-wide">Chỉnh Sửa Hồ Sơ</h3>
                                <p className="text-xs text-gray-400 mt-1">Cập nhật thông tin cá nhân của bạn</p>
                            </div>
                            <button onClick={() => setEditProfileOpen(false)}
                                className="p-2 bg-black/40 text-gray-400 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5 bg-[#121212]">
                            {/* Avatar upload */}
                            <div className="flex flex-col items-center gap-3 pb-4 border-b border-white/5">
                                <div className="w-24 h-24 rounded-full border-2 border-[#D4B055]/30 overflow-hidden bg-[#D4B055]/10 flex items-center justify-center">
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        : profile?.profileImageUrl || profile?.avatarUrl
                                            ? <img src={formatImageUrl(profile.profileImageUrl || profile.avatarUrl)} alt={profile.fullName} className="w-full h-full object-cover" />
                                            : <User size={36} className="text-[#D4B055]" />
                                    }
                                </div>
                                <label className="cursor-pointer text-xs font-semibold text-[#D4B055] border border-[#D4B055]/30 bg-[#D4B055]/10 px-5 py-2 rounded-lg hover:bg-[#D4B055] hover:text-black transition-all">
                                    {avatarUploading ? 'Đang upload...' : '📷 Đổi ảnh đại diện'}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarFileChange} />
                                </label>
                                {avatarFile && <p className="text-[11px] text-gray-500 truncate max-w-[200px]">✓ {avatarFile.name}</p>}
                            </div>

                            {/* Form fields */}
                            {[
                                { label: 'Họ và tên', key: 'fullName', type: 'text', placeholder: 'Nguyễn Văn A' },
                                { label: 'Số điện thoại', key: 'phone', type: 'tel', placeholder: '09xxxxxxxx' },
                                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                                { label: 'Địa chỉ thường trú', key: 'address', type: 'text', placeholder: 'Số nhà, đường, phường, quận...' },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
                                    <input
                                        type={type}
                                        value={editForm[key]}
                                        onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#D4B055]/50 focus:ring-1 focus:ring-[#D4B055]/20 transition-all placeholder-gray-600"
                                    />
                                </div>
                            ))}

                            {editError && (
                                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{editError}</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[#D4B055]/10 flex gap-3">
                            <button
                                onClick={() => setEditProfileOpen(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/5 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={editSaving}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4B055] to-[#E8CE7B] text-black text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editSaving ? 'Đang lưu...' : '✓ Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TOAST NOTIFICATION CONTAINER ================= */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`flex items-center space-x-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-md max-w-sm ${toast.type === 'success'
                        ? 'bg-emerald-950/85 border-emerald-500/30 text-emerald-200'
                        : toast.type === 'info'
                            ? 'bg-blue-950/85 border-blue-500/30 text-blue-200'
                            : 'bg-red-950/85 border-red-500/30 text-red-200'
                        }`}>
                        <div className={`p-1.5 rounded-lg ${toast.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : toast.type === 'info'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                            {toast.type === 'success' ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                                <Info className="w-4 h-4 stroke-[2]" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white leading-none">
                                {toast.type === 'success' ? 'Thành công' : toast.type === 'info' ? 'Thông báo' : 'Thất bại'}
                            </p>
                            <p className="text-[11px] font-light opacity-90 mt-1">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}