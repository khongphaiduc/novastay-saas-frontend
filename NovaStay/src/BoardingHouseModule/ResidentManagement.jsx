import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Users,
    History,
    Search,
    Mail,
    Copy,
    CheckCircle,
    Plus,
    User,
    Phone,
    MapPin,
    CreditCard,
    UserX,
    X,
    Layers
} from 'lucide-react';

// --- MOCK DATA ---
const initialResidents = [
    { id: 'R001', name: 'Nguyễn Hoàng Long', room: 'Penthouse A - 4001', phone: '0901.234.567', idCard: '001095001234', gender: 'Nam', address: 'Hà Nội', status: 'Đang cư trú' },
    { id: 'R002', name: 'Trần Thị Thu Thủy', room: 'Suite B - 2502', phone: '0912.345.678', idCard: '002096005678', gender: 'Nữ', address: 'TP. Hồ Chí Minh', status: 'Đang cư trú' },
];

const initialInvitations = [
    { id: 'I001', invitee: 'Lê Minh Triết', room: 'Deluxe C - 1205', role: 'Khách lưu trú', expiry: '25/06/2026' },
];

const initialHistory = [
    { id: 'H001', name: 'Đặng Ngọc Anh', room: 'Suite B - 1101', action: 'Trả phòng / Chuyển đi', date: '15/05/2026' },
    { id: 'H002', name: 'Ngô Quốc Bảo', room: 'Penthouse B - 4002', action: 'Đăng ký tạm trú mới', date: '01/06/2026' },
];

export default function ResidentManagementSubPage({ isDarkMode = true }) {
    const [activeTab, setActiveTab] = useState('search-hub'); // Mặc định mở tab tìm kiếm hệ thống
    const [copied, setCopied] = useState(false);

    // States quản lý dữ liệu
    const [residents, setResidents] = useState(initialResidents);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

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
                } catch (e) {
                    console.warn('Failed to parse ns_account from localStorage', e);
                }
            }

            if (!organizationId) {
                organizationId = '412A98E1-5EFA-4109-BE90-83DB01CD05C5';
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/residents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'accessToken': accessToken,
                }
            });

            if (!res.ok) {
                let errMsg = 'Không thể tải danh sách cư dân';
                try {
                    const errorData = await res.json();
                    errMsg = errorData?.message || errorData?.error || errMsg;
                } catch (_) { }
                throw new Error(errMsg);
            }

            const data = await res.json();
            const rawList = Array.isArray(data) ? data : (data?.data || data?.residents || []);

            const mappedResidents = rawList.map((item) => ({
                id: item.membershipCode || item.membershipId || '',
                membershipId: item.membershipId,
                name: item.fullName || 'Không rõ tên',
                room: 'Chưa xếp phòng',
                phone: item.phone || 'N/A',
                idCard: item.identityCardNumber || 'N/A',
                gender: 'N/A',
                address: item.email || 'N/A',
                status: item.membershipStatus === 'Active' ? 'Đang cư trú' : (item.membershipStatus || 'Chưa xác định')
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
        if (activeTab === 'list') {
            fetchResidents();
        }
    }, [activeTab]);

    // State quản lý form cư dân mới
    const [newResident, setNewResident] = useState({
        name: '',
        phone: '',
        address: '',
        idCard: '',
        gender: 'Nam',
        room: ''
    });

    const theme = isDarkMode ? {
        bg: 'bg-[#0F1016] text-[#E4E6EB]',
        panel: 'bg-[#16171E] border-[#2C2D35]',
        input: 'bg-[#1F212A] border-[#2C2D35] text-white placeholder-[#5A5C66]',
        textMuted: 'text-[#8A8D98]',
        textMutedSoft: 'text-[#5A5C66]',
        title: 'text-white',
        border: 'border-[#2C2D35]',
        subBg: 'bg-[#111218] border-[#23242B]',
        cardActive: 'text-[#C5A880] bg-[#16171E]',
        cardIdle: 'text-[#8A8D98] hover:text-white hover:bg-[#12131A]',
        rowHover: 'hover:bg-[#1C1E26]',
        divide: 'divide-[#1F212A]',
        textMainSoft: 'text-[#E4E6EB]',
        buttonOutline: 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white',
        modalBg: 'bg-[#16171E] border-[#3E3F4A]',
        modalInput: 'bg-[#1F212A] border-[#2C2D35] text-white focus:border-[#C5A880]',
        goldText: 'text-[#C5A880]',
        goldBg: 'bg-[#C5A880]',
        goldBorder: 'border-[#C5A880]',
        goldFocus: 'focus:border-[#C5A880]',
        goldTextHover: 'hover:text-[#C5A880]',
        goldTextGroupHover: 'group-hover:text-[#C5A880]',
        statusOk: 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]',
        textMutedHover: 'hover:text-white',
        cardHover: 'hover:border-[#C5A880]/30'
    } : {
        bg: 'bg-[#F8F4EA] text-slate-900',
        panel: 'bg-white border-[#E5D4AD] shadow-sm',
        input: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400',
        textMuted: 'text-slate-500',
        textMutedSoft: 'text-slate-400',
        title: 'text-slate-950',
        border: 'border-[#E5D4AD]',
        subBg: 'bg-[#FFF9EC] border-[#E5D4AD]',
        cardActive: 'text-[#8A6212] bg-[#FFF9EC] border-b-2 border-[#D4AF37]',
        cardIdle: 'text-slate-600 hover:text-slate-950 hover:bg-amber-50',
        rowHover: 'hover:bg-amber-50/70',
        divide: 'divide-[#FFF9EC]',
        textMainSoft: 'text-slate-800',
        buttonOutline: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-600 hover:text-slate-950',
        modalBg: 'bg-white border-[#E5D4AD]',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]',
        goldText: 'text-[#8A6212]',
        goldBg: 'bg-[#8A6212]',
        goldBorder: 'border-[#E5D4AD]',
        goldFocus: 'focus:border-[#D4AF37]',
        goldTextHover: 'hover:text-[#8A6212]',
        goldTextGroupHover: 'group-hover:text-[#8A6212]',
        statusOk: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        textMutedHover: 'hover:text-slate-950',
        cardHover: 'hover:border-[#D4AF37]/50'
    };

    const handleCopyLink = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

            const mappedResults = data.map((item) => ({
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

    // Xử lý tạo mới cư dân
    const handleCreateResident = (e) => {
        e.preventDefault();
        if (!newResident.name || !newResident.room) return;

        const created = {
            id: `R0${residents.length + 1}`.padStart(4, '0'),
            name: newResident.name,
            room: newResident.room,
            phone: newResident.phone || 'N/A',
            idCard: newResident.idCard || 'N/A',
            gender: newResident.gender,
            address: newResident.address || 'N/A',
            status: 'Đang cư trú'
        };

        setResidents([created, ...residents]);
        setIsModalOpen(false);
        setNewResident({ name: '', phone: '', address: '', idCard: '', gender: 'Nam', room: '' });
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

            {/* NAVIGATION TABS (Đã loại bỏ Chờ xác nhận) */}
            <div className={`flex flex-wrap gap-1 border-b ${theme.border} mb-6 overflow-x-auto scrollbar-none`}>
                {[
                    { id: 'search-hub', label: 'Tìm Kiếm Hệ Thống', icon: <Search size={14} /> },
                    { id: 'list', label: 'Danh Cư Dân Của Bạn', icon: <Users size={14} /> },
                    { id: 'invite', label: 'Lời Mời', icon: <Mail size={14} /> },
                    { id: 'history', label: 'Lịch Sử Biến Động', icon: <History size={14} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3.5 text-xs tracking-[0.15em] font-medium transition-all duration-300 relative whitespace-nowrap uppercase ${activeTab === tab.id ? theme.cardActive : theme.cardIdle}`}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${theme.goldBg}`} />
                        )}
                    </button>
                ))}
            </div>

            {/* CHỨA NỘI DUNG CHÍNH */}
            <div className={`${theme.panel} border shadow-xl rounded-sm p-5 lg:p-6`}>

                {/* TAB GỐC MỚI: TÌM KIẾM HỆ THỐNG & PHÂN HỆ KHỞI TẠO */}
                {activeTab === 'search-hub' && (
                    <div>
                        <div className={`mb-8 p-6 ${theme.subBg} border rounded-sm`}>
                            <span className={`text-[9px] tracking-[0.2em] ${theme.goldText} uppercase font-semibold block mb-2`}>Global Smart Search</span>
                            <h2 className={`text-base font-light tracking-wide ${theme.title} mb-4`}>Tìm Kiếm Cư Dân Toàn Nền Tảng NovaStay</h2>

                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-stretch">
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
                                        placeholder="Nhập số điện thoại của cư dân để tiến tra cứu..."
                                        className={`w-full ${theme.input} border text-xs px-4 py-3.5 pl-11 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                    />
                                    <Search size={16} className={`absolute left-4 top-3.5 ${theme.goldText}`} />
                                    {globalSearchTerm && (
                                        <button type="button" onClick={handleClearSearch} className={`absolute right-4 top-3.5 ${theme.textMuted} ${theme.goldTextHover} text-xs`}>✕</button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-6 py-3.5 rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap uppercase tracking-wider"
                                >
                                    <Search size={15} /> TÌM KIẾM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 border border-dashed border-[#A98446]/30 text-[#C5A880] text-xs font-bold px-6 py-3.5 rounded-sm hover:bg-[#C5A880]/5 transition-all whitespace-nowrap uppercase tracking-wider"
                                >
                                    <UserPlus size={15} /> YÊU CẦU TẠO MỚI CƯ DÂN
                                </button>
                            </form>
                        </div>

                        {/* Kết quả truy vấn chuyên sâu */}
                        {hasSearched ? (
                            <div>
                                <div className={`flex justify-between items-center mb-4 text-[11px] ${theme.textMuted} tracking-wider uppercase font-mono`}>
                                    <span>Kết quả tìm kiếm cho: "{globalSearchTerm}"</span>
                                    <span>Tìm thấy: {searchResults.length} hồ sơ</span>
                                </div>

                                {searchLoading ? (
                                    <div className="py-12 flex flex-col items-center justify-center">
                                        <svg className="animate-spin h-8 w-8 text-[#C5A880] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className={`text-xs ${theme.textMuted}`}>Đang truy vấn hệ thống...</span>
                                    </div>
                                ) : searchError ? (
                                    <div className={`py-12 text-center text-red-500 border border-dashed border-red-500/20 rounded-sm`}>
                                        <p className="text-xs">{searchError}</p>
                                        <button
                                            type="button"
                                            onClick={handleSearch}
                                            className={`mt-3 border ${isDarkMode ? 'border-[#C5A880] text-[#C5A880]' : 'border-[#8A6212] text-[#8A6212]'} text-[10px] px-3 py-1.5 rounded-sm`}
                                        >
                                            Thử lại
                                        </button>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {searchResults.map((res) => (
                                            <div key={res.id} className={`p-5 ${theme.input} border rounded-xl ${theme.cardHover} transition-all group relative overflow-hidden flex flex-col justify-between h-full`}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`w-12 h-12 rounded-full border ${isDarkMode ? 'border-[#C5A880]/30 bg-[#C5A880]/5' : 'border-[#8A6212]/30 bg-amber-50'} flex items-center justify-center text-lg font-bold ${theme.goldText}`}>
                                                        {res.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-semibold ${theme.title} ${theme.goldTextGroupHover} transition-colors`}>{res.name}</h4>
                                                        <p className={`text-xs ${theme.textMuted} font-mono mt-0.5`}>{res.phone}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleCopyLink();
                                                        setActiveTab('invite');
                                                    }}
                                                    className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity tracking-wider uppercase flex items-center justify-center gap-2"
                                                >
                                                    <UserPlus size={14} /> Mời tham gia cư dân
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`py-12 flex flex-col items-center justify-center border border-dashed ${theme.border} ${theme.subBg} rounded-sm`}>
                                        <div className={`p-4 ${theme.input} border ${theme.goldText} rounded-full mb-3`}>
                                            <UserX size={24} />
                                        </div>
                                        <h3 className={`text-xs font-medium ${theme.title} tracking-wide`}>Cư dân này chưa tồn tại trong hệ thống</h3>
                                        <p className={`text-[11px] ${theme.textMuted} text-center mt-1 mb-4 max-w-xs font-light`}>
                                            Không có kết quả trùng khớp. Hãy tiến hành tạo mới dữ liệu.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(true)}
                                            className={`flex items-center gap-1.5 border ${isDarkMode ? 'border-[#C5A880] text-[#C5A880] bg-[#C5A880]/5 hover:bg-[#C5A880] hover:text-black' : 'border-[#8A6212] text-[#8A6212] bg-[#8A6212]/5 hover:bg-[#8A6212] hover:text-white'} text-[11px] font-semibold px-4 py-2 rounded-sm transition-all tracking-wider uppercase`}
                                        >
                                            <Plus size={12} /> Khởi Tạo Hồ Sơ Ngay
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={`py-12 text-center ${theme.textMutedSoft} border border-dashed ${theme.border} rounded-sm flex flex-col items-center justify-center`}>
                                <Layers size={24} className={`mb-2 ${theme.textMutedSoft}`} />
                                <p className="text-xs font-light">Vui lòng điền thông tin vào thanh tìm kiếm phía trên để truy xuất dữ liệu bđs cư dân.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DANH SÁCH TỔNG */}
                {activeTab === 'list' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-sm tracking-widest ${theme.goldText} font-medium uppercase`}>Cư dân hiện tại</h2>
                        </div>
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
                                <p className="text-xs font-light">Chưa có cư dân nào trong danh sách của bạn.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className={`border-b ${theme.border} tracking-widest ${theme.textMuted} uppercase font-semibold`}>
                                            <th className="pb-3">Mã</th>
                                            <th className="pb-3">Cư Dân</th>
                                            <th className="pb-3">Căn Hộ</th>
                                            <th className="pb-3">Liên Hệ</th>
                                            <th className="pb-3 text-right">Trạng Thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${theme.divide}`}>
                                        {residents.map((res) => (
                                            <tr key={res.id} className={`${theme.rowHover} transition-colors group`}>
                                                <td className={`py-3.5 ${theme.textMuted} font-mono ${theme.goldTextGroupHover}`}>{res.id}</td>
                                                <td className={`py-3.5 font-medium ${theme.title}`}>{res.name}</td>
                                                <td className={`py-3.5 ${theme.goldText} font-light`}>{res.room}</td>
                                                <td className={`py-3.5 ${theme.textMuted}`}>{res.phone}</td>
                                                <td className="py-3.5 text-right">
                                                    <span className={`inline-block ${theme.statusOk} text-[10px] px-2 py-0.5 tracking-wider uppercase font-medium rounded-sm`}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: LỜI MỜI CƯ DÂN */}
                {activeTab === 'invite' && (
                    <div>
                        <h2 className={`text-sm tracking-widest ${theme.goldText} font-medium uppercase mb-5`}>Tạo Đặc Quyền Tham Gia</h2>
                        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase`}>Tên người nhận</label>
                                <input type="text" placeholder="Họ và tên..." className={`w-full ${theme.input} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus}`} />
                            </div>
                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase`}>Số phòng gán</label>
                                <input type="text" placeholder="Ví dụ: PA-4001" className={`w-full ${theme.input} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus}`} />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                                <button type="button" onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs tracking-wider font-bold py-2.5 px-4 rounded-sm transition-all hover:opacity-90">
                                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    {copied ? 'ĐÃ SAO CHÉP LINK' : 'TẠO LINK MỜI'}
                                </button>
                            </div>
                        </form>

                        <div className={`border-t ${theme.border} pt-5`}>
                            <h3 className={`text-[11px] tracking-widest ${theme.textMuted} mb-3 uppercase`}>Mã mời chưa kích hoạt</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className={`border-b ${theme.border} ${theme.textMutedSoft} uppercase font-semibold`}>
                                            <th className="pb-2">Người Nhận</th>
                                            <th className="pb-2">Căn Hộ</th>
                                            <th className="pb-2 text-right">Hạn Dùng</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${theme.divide}`}>
                                        {initialInvitations.map((inv) => (
                                            <tr key={inv.id}>
                                                <td className={`py-3 ${theme.title} font-medium`}>{inv.invitee}</td>
                                                <td className={`py-3 ${theme.goldText}`}>{inv.room}</td>
                                                <td className="py-3 text-right text-amber-500 font-mono">{inv.expiry}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: LẠCH SỬ CƯ TRÚ */}
                {activeTab === 'history' && (
                    <div>
                        <h2 className={`text-sm tracking-widest ${theme.goldText} font-medium uppercase mb-5`}>Nhật ký biến động</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className={`border-b ${theme.border} ${theme.textMutedSoft} uppercase font-semibold`}>
                                        <th className="pb-2">Cư Dân</th>
                                        <th className="pb-2">Căn Hộ</th>
                                        <th className="pb-2">Hành Động</th>
                                        <th className="pb-2 text-right">Thời Gian</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme.divide}`}>
                                    {initialHistory.map((hist) => (
                                        <tr key={hist.id}>
                                            <td className={`py-3 ${theme.title} font-medium`}>{hist.name}</td>
                                            <td className={`py-3 ${theme.goldText}`}>{hist.room}</td>
                                            <td className="py-3">
                                                <span className={hist.action.includes('Trả') ? (isDarkMode ? 'text-red-400' : 'text-red-600') : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                                                    {hist.action}
                                                </span>
                                            </td>
                                            <td className={`py-3 text-right ${theme.textMuted} font-mono`}>{hist.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

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
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Phòng / Căn hộ chỉ định *</label>
                                <input
                                    type="text" required placeholder="Ví dụ: Villa 05, Suite B - 2502..." value={newResident.room}
                                    onChange={(e) => setNewResident({ ...newResident, room: e.target.value })}
                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none`}
                                />
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

        </div>
    );
}