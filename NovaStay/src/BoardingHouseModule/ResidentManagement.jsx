import React, { useState } from 'react';
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

export default function ResidentManagementSubPage() {
    const [activeTab, setActiveTab] = useState('search-hub'); // Mặc định mở tab tìm kiếm hệ thống
    const [copied, setCopied] = useState(false);

    // States quản lý dữ liệu
    const [residents, setResidents] = useState(initialResidents);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State quản lý form cư dân mới
    const [newResident, setNewResident] = useState({
        name: '',
        phone: '',
        address: '',
        idCard: '',
        gender: 'Nam',
        room: ''
    });

    const handleCopyLink = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Bộ lọc tìm kiếm cư dân toàn diện (Tên, Số phòng, SĐT, CMND)
    const filteredGlobalResidents = residents.filter(res =>
        res.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        res.room.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        res.phone.includes(globalSearchTerm) ||
        res.idCard.includes(globalSearchTerm)
    );

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
        <div className="w-full min-h-full bg-[#0F1016] text-[#E4E6EB] font-sans antialiased selection:bg-[#C5A880] selection:text-black p-6 lg:p-8 relative">

            {/* PAGE SUB-HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#2C2D35] pb-6 mb-6">
                <div>
                    <span className="text-[10px] tracking-[0.3em] text-[#C5A880] uppercase font-semibold">Phân khu cao cấp</span>
                    <h1 className="text-xl font-light tracking-wide text-white mt-0.5">Quản Lý Cư Dân</h1>
                </div>
                <div className="text-xs text-[#8A8D98] tracking-widest font-mono bg-[#16171E] px-3 py-1.5 border border-[#2C2D35]">
                    Khu vực: <span className="text-[#C5A880]">THE GRAND</span>
                </div>
            </div>

            {/* NAVIGATION TABS (Đã loại bỏ Chờ xác nhận) */}
            <div className="flex flex-wrap gap-1 border-b border-[#2C2D35] mb-6 overflow-x-auto scrollbar-none">
                {[
                    { id: 'search-hub', label: 'Tìm Kiếm Hệ Thống', icon: <Search size={14} /> },
                    { id: 'list', label: 'Danh Cư Dân Của Bạn', icon: <Users size={14} /> },
                    { id: 'invite', label: 'Lời Mời', icon: <Mail size={14} /> },
                    { id: 'history', label: 'Lịch Sử Biến Động', icon: <History size={14} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3.5 text-xs tracking-[0.15em] font-medium transition-all duration-300 relative whitespace-nowrap uppercase ${activeTab === tab.id ? 'text-[#C5A880] bg-[#16171E]' : 'text-[#8A8D98] hover:text-white hover:bg-[#12131A]'}`}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                        )}
                    </button>
                ))}
            </div>

            {/* CHỨA NỘI DUNG CHÍNH */}
            <div className="bg-[#16171E] border border-[#2C2D35] shadow-xl rounded-sm p-5 lg:p-6">

                {/* TAB GỐC MỚI: TÌM KIẾM HỆ THỐNG & PHÂN HỆ KHỞI TẠO */}
                {activeTab === 'search-hub' && (
                    <div>
                        <div className="mb-8 p-6 bg-[#111218] border border-[#23242B] rounded-sm">
                            <span className="text-[9px] tracking-[0.2em] text-[#C5A880] uppercase font-semibold block mb-2">Global Smart Search</span>
                            <h2 className="text-base font-light tracking-wide text-white mb-4">Truy Vấn Cư Dân Toàn Nền Tảng NovaStay</h2>

                            <div className="flex flex-col md:flex-row gap-3 items-stretch">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={globalSearchTerm}
                                        onChange={(e) => setGlobalSearchTerm(e.target.value)}
                                        placeholder="Nhập số điện thoại của cư dân để tiến tra cứu..."
                                        className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-4 py-3.5 pl-11 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors placeholder-[#5A5C66]"
                                    />
                                    <Search size={16} className="absolute left-4 top-3.5 text-[#C5A880]" />
                                    {globalSearchTerm && (
                                        <button onClick={() => setGlobalSearchTerm('')} className="absolute right-4 top-3.5 text-[#8A8D98] hover:text-white text-xs">✕</button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-6 py-3.5 rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap uppercase tracking-wider"
                                >
                                    <UserPlus size={15} /> YÊU CẦU TẠO MỚI CƯ DÂN
                                </button>
                            </div>
                        </div>

                        {/* Kết quả truy vấn chuyên sâu */}
                        {globalSearchTerm ? (
                            <div>
                                <div className="flex justify-between items-center mb-4 text-[11px] text-[#8A8D98] tracking-wider uppercase font-mono">
                                    <span>Kết quả tìm kiếm cho: "{globalSearchTerm}"</span>
                                    <span>Tìm thấy: {filteredGlobalResidents.length} hồ sơ</span>
                                </div>

                                {filteredGlobalResidents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredGlobalResidents.map((res) => (
                                            <div key={res.id} className="p-4 bg-[#1F212A] border border-[#2C2D35] rounded-sm hover:border-[#C5A880] transition-all group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A880]/[0.02] rounded-bl-full"></div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white group-hover:text-[#C5A880] transition-colors">{res.name}</h4>
                                                        <p className="text-[10px] font-mono text-[#8A8D98] mt-0.5">{res.id} • {res.gender}</p>
                                                    </div>
                                                    <span className="bg-[#1B2A22] text-[#4E9F6D] border border-[#254A34] text-[9px] px-2 py-0.5 uppercase tracking-wider rounded-sm font-medium">
                                                        {res.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs pt-3 border-t border-[#2C2D35]/50 text-[#8A8D98]">
                                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Phòng / BĐS</span> <span className="text-white font-light">{res.room}</span></div>
                                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Số điện thoại</span> <span className="text-white font-mono">{res.phone}</span></div>
                                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Số CMND/CCCD</span> <span className="text-[#E4E6EB] font-mono">{res.idCard}</span></div>
                                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Nguyên quán</span> <span className="text-[#E4E6EB] font-light truncate block">{res.address}</span></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[#2C2D35] bg-[#12131A]/50 rounded-sm">
                                        <div className="p-4 bg-[#1F212A] border border-[#2C2D35] text-[#C5A880] rounded-full mb-3">
                                            <UserX size={24} />
                                        </div>
                                        <h3 className="text-xs font-medium text-white tracking-wide">Cư dân này chưa tồn tại trong hệ thống</h3>
                                        <p className="text-[11px] text-[#8A8D98] text-center mt-1 mb-4 max-w-xs font-light">
                                            Không có kết quả trùng khớp. Hãy tiến hành tạo mới dữ liệu.
                                        </p>
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="flex items-center gap-1.5 border border-[#C5A880] text-[#C5A880] bg-[#C5A880]/5 text-[11px] font-semibold px-4 py-2 rounded-sm hover:bg-[#C5A880] hover:text-black transition-all tracking-wider uppercase"
                                        >
                                            <Plus size={12} /> Khởi Tạo Hồ Sơ Ngay
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-[#5A5C66] border border-dashed border-[#2C2D35] rounded-sm flex flex-col items-center justify-center">
                                <Layers size={24} className="mb-2 text-[#2C2D35]" />
                                <p className="text-xs font-light">Vui lòng điền thông tin vào thanh tìm kiếm phía trên để truy xuất dữ liệu bđs cư dân.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DANH SÁCH TỔNG */}
                {activeTab === 'list' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm tracking-widest text-[#C5A880] font-medium uppercase">Cư dân hiện tại</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-[#2C2D35] tracking-widest text-[#8A8D98] uppercase font-semibold">
                                        <th className="pb-3">Mã</th>
                                        <th className="pb-3">Cư Dân</th>
                                        <th className="pb-3">Căn Hộ</th>
                                        <th className="pb-3">Liên Hệ</th>
                                        <th className="pb-3 text-right">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1F212A]">
                                    {residents.map((res) => (
                                        <tr key={res.id} className="hover:bg-[#1C1E26] transition-colors group">
                                            <td className="py-3.5 text-[#8A8D98] font-mono group-hover:text-[#C5A880]">{res.id}</td>
                                            <td className="py-3.5 font-medium text-white">{res.name}</td>
                                            <td className="py-3.5 text-[#C5A880] font-light">{res.room}</td>
                                            <td className="py-3.5 text-[#8A8D98]">{res.phone}</td>
                                            <td className="py-3.5 text-right">
                                                <span className="inline-block bg-[#1B2A22] text-[#4E9F6D] border border-[#254A34] text-[10px] px-2 py-0.5 tracking-wider uppercase font-medium rounded-sm">
                                                    {res.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: LỜI MỜI CƯ DÂN */}
                {activeTab === 'invite' && (
                    <div>
                        <h2 className="text-sm tracking-widest text-[#C5A880] font-medium uppercase mb-5">Tạo Đặc Quyền Tham Gia</h2>
                        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            <div>
                                <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase">Tên người nhận</label>
                                <input type="text" placeholder="Họ và tên..." className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 text-white rounded-sm focus:outline-none focus:border-[#C5A880]" />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase">Số phòng gán</label>
                                <input type="text" placeholder="Ví dụ: PA-4001" className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 text-white rounded-sm focus:outline-none focus:border-[#C5A880]" />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                                <button type="button" onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs tracking-wider font-bold py-2.5 px-4 rounded-sm transition-all hover:opacity-90">
                                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    {copied ? 'ĐÃ SAO CHÉP LINK' : 'TẠO LINK MỜI'}
                                </button>
                            </div>
                        </form>

                        <div className="border-t border-[#2C2D35] pt-5">
                            <h3 className="text-[11px] tracking-widest text-[#8A8D98] mb-3 uppercase">Mã mời chưa kích hoạt</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#2C2D35] text-[#5A5C66] uppercase font-semibold">
                                            <th className="pb-2">Người Nhận</th>
                                            <th className="pb-2">Căn Hộ</th>
                                            <th className="pb-2 text-right">Hạn Dùng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1F212A]">
                                        {initialInvitations.map((inv) => (
                                            <tr key={inv.id}>
                                                <td className="py-3 text-white font-medium">{inv.invitee}</td>
                                                <td className="py-3 text-[#C5A880]">{inv.room}</td>
                                                <td className="py-3 text-right text-amber-500 font-mono">{inv.expiry}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: LỊCH SỬ CƯ TRÚ */}
                {activeTab === 'history' && (
                    <div>
                        <h2 className="text-sm tracking-widest text-[#C5A880] font-medium uppercase mb-5">Nhật ký biến động</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#2C2D35] text-[#5A5C66] uppercase font-semibold">
                                        <th className="pb-2">Cư Dân</th>
                                        <th className="pb-2">Căn Hộ</th>
                                        <th className="pb-2">Hành Động</th>
                                        <th className="pb-2 text-right">Thời Gian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1F212A]">
                                    {initialHistory.map((hist) => (
                                        <tr key={hist.id}>
                                            <td className="py-3 text-white font-medium">{hist.name}</td>
                                            <td className="py-3 text-[#C5A880]">{hist.room}</td>
                                            <td className="py-3">
                                                <span className={hist.action.includes('Trả') ? 'text-red-400' : 'text-emerald-400'}>
                                                    {hist.action}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-[#8A8D98] font-mono">{hist.date}</td>
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

                    <div className="relative bg-[#16171E] border border-[#3E3F4A] max-w-xl w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-[#2C2D35] pb-4 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#C5A880] animate-pulse"></div>
                                <h3 className="text-sm font-semibold tracking-widest text-white uppercase">Hồ Sơ Khởi Tạo Cư Dân</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#8A8D98] hover:text-white transition-colors p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateResident} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Họ và tên *</label>
                                    <div className="relative">
                                        <input
                                            type="text" required placeholder="Nguyễn Văn A..." value={newResident.name}
                                            onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                                            className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-9 text-white rounded-sm focus:outline-none focus:border-[#C5A880]"
                                        />
                                        <User size={13} className="absolute left-3 top-3 text-[#5A5C66]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Số điện thoại</label>
                                    <div className="relative">
                                        <input
                                            type="tel" placeholder="09xx.xxx.xxx" value={newResident.phone}
                                            onChange={(e) => setNewResident({ ...newResident, phone: e.target.value })}
                                            className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-9 text-white rounded-sm focus:outline-none focus:border-[#C5A880]"
                                        />
                                        <Phone size={13} className="absolute left-3 top-3 text-[#5A5C66]" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Số CMND / CCCD</label>
                                    <div className="relative">
                                        <input
                                            type="text" placeholder="Định danh cư dân..." value={newResident.idCard}
                                            onChange={(e) => setNewResident({ ...newResident, idCard: e.target.value })}
                                            className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-9 text-white rounded-sm focus:outline-none focus:border-[#C5A880]"
                                        />
                                        <CreditCard size={13} className="absolute left-3 top-3 text-[#5A5C66]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Giới tính</label>
                                    <div className="grid grid-cols-3 gap-2 h-9">
                                        {['Nam', 'Nữ', 'Khác'].map((g) => (
                                            <button
                                                key={g} type="button" onClick={() => setNewResident({ ...newResident, gender: g })}
                                                className={`text-xs border transition-all rounded-sm font-medium ${newResident.gender === g ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]' : 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98]'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Phòng / Căn hộ chỉ định *</label>
                                <input
                                    type="text" required placeholder="Ví dụ: Villa 05, Suite B - 2502..." value={newResident.room}
                                    onChange={(e) => setNewResident({ ...newResident, room: e.target.value })}
                                    className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 text-white rounded-sm focus:outline-none focus:border-[#C5A880]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Địa chỉ thường trú / Nguyên quán</label>
                                <div className="relative">
                                    <input
                                        type="text" placeholder="Tỉnh/Thành phố, Quận/Huyện..." value={newResident.address}
                                        onChange={(e) => setNewResident({ ...newResident, address: e.target.value })}
                                        className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-9 text-white rounded-sm focus:outline-none focus:border-[#C5A880]"
                                    />
                                    <MapPin size={13} className="absolute left-3 top-3 text-[#5A5C66]" />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-[#2C2D35] mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold tracking-wider text-[#8A8D98] hover:text-white uppercase">Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase">Lưu hồ sơ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}