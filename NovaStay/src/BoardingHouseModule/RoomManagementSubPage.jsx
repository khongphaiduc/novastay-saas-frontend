import React, { useState } from 'react';
import {
    Search,
    Plus,
    Home,
    User,
    ChevronRight,
    Sparkles,
    Droplet,
    Zap,
    Eye,
    FileText,
    Activity,
    CheckCircle,
    Clock
} from 'lucide-react';

// --- MOCK DATA ĐỘC QUYỀN NHÀ TRỌ & CC MINI ---
const initialRooms = [
    { id: 'PA-4001', name: 'Phòng 401 (Duplex)', price: '6,500,000đ', status: 'Đang ở', resident: 'Nguyễn Hoàng Long', floor: 'Tầng 4', area: '35m²', electric: '3.500đ/kwh', water: '100.000đ/người' },
    { id: 'PB-2502', name: 'Phòng 202 (Studio Vip)', price: '5,200,000đ', status: 'Đang ở', resident: 'Trần Thị Thu Thủy', floor: 'Tầng 2', area: '28m²', electric: '3.500đ/kwh', water: '100.000đ/người' },
    { id: 'PC-1205', name: 'Phòng 105 (Gác lửng)', price: '4,200,000đ', status: 'Trống', resident: null, floor: 'Tầng 1', area: '25m²', electric: '3.800đ/kwh', water: '30.000đ/m³' },
    { id: 'PD-0501', name: 'Phòng 501 (Phòng đơn)', price: '3,200,000đ', status: 'Đã cọc giữ chỗ', resident: 'Lê Minh Triết', floor: 'Tầng 5', area: '20m²', electric: '4.000đ/kwh', water: '30.000đ/m³' },
    { id: 'PE-0302', name: 'Phòng 302 (Studio)', price: '4,800,000đ', status: 'Sửa chữa', resident: null, floor: 'Tầng 3', area: '26m²', electric: '3.500đ/kwh', water: '100.000đ/người' },
    { id: 'PF-0204', name: 'Phòng 204 (Standard)', price: '3,800,000đ', status: 'Trống', resident: null, floor: 'Tầng 2', area: '22m²', electric: '3.500đ/kwh', water: '100.000đ/người' },
    { id: 'PG-0102', name: 'Phòng 102 (Khu A)', price: '4,000,000đ', status: 'Đang ở', resident: 'Phạm Minh Quang', floor: 'Tầng 1', area: '24m²', electric: '3.800đ/kwh', water: '30.000đ/m³' },
];

export default function RoomManagementSubPage({ isDarkMode = true }) {
    const [rooms, setRooms] = useState(initialRooms);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Đang ở').length;
    const availableRooms = rooms.filter(r => r.status === 'Trống').length;
    const pendingRooms = rooms.filter(r => r.status === 'Đã cọc giữ chỗ').length;

    const theme = isDarkMode ? {
        bg: 'bg-[#0F1016] text-[#E4E6EB]',
        panel: 'bg-[#16171E] border-[#2C2D35]',
        panelBorder: 'border-[#3E404C]',
        input: 'bg-[#1F212A] border-[#2C2D35] text-white placeholder-[#5A5C66]',
        textMuted: 'text-[#8A8D98]',
        textMutedSoft: 'text-[#5A5C66]',
        title: 'text-white',
        border: 'border-[#2C2D35]',
        subBg: 'bg-[#12131A]/40 border-[#2C2D35]/30',
        cardActive: 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]',
        cardIdle: 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white',
        textMainSoft: 'text-[#E4E6EB]',
        buttonOutline: 'text-[#C9CBD3] hover:text-white bg-[#1F212A] border-[#2C2D35]',
        cardFooterBg: 'bg-[#1B1C24] border-[#2C2D35]',
        emptyBg: 'bg-[#16171E] border-[#2C2D35]',
        statsBg: 'bg-[#16171E] border-[#3E404C]',
        statsDivider: 'divide-[#343642]',
        goldText: 'text-[#C5A880]',
        goldBg: 'bg-[#C5A880]',
        goldBorder: 'border-[#C5A880]',
        goldFocus: 'focus:border-[#C5A880]',
        goldTextHover: 'hover:text-[#C5A880]',
        goldTextGroupHover: 'group-hover:text-[#C5A880]',
        badgeOccupied: 'text-white bg-[#1B2A22] border border-[#254A34]'
    } : {
        bg: 'bg-[#F8F4EA] text-slate-900',
        panel: 'bg-white border-[#E5D4AD] shadow-sm',
        panelBorder: 'border-[#E5D4AD]',
        input: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400',
        textMuted: 'text-slate-500',
        textMutedSoft: 'text-slate-400',
        title: 'text-slate-950',
        border: 'border-[#E5D4AD]',
        subBg: 'bg-amber-50/20 border-[#E5D4AD]/45',
        cardActive: 'bg-[#FFF1C7] border-[#D4AF37] text-[#8A6212]',
        cardIdle: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-600 hover:text-slate-950',
        textMainSoft: 'text-slate-800',
        buttonOutline: 'text-slate-600 hover:text-slate-950 bg-[#FFF9EC] border-[#E5D4AD]',
        cardFooterBg: 'bg-[#FFFDF9] border-[#E5D4AD]',
        emptyBg: 'bg-white border-[#E5D4AD]',
        statsBg: 'bg-white border-[#E5D4AD] shadow-sm',
        statsDivider: 'divide-[#E5D4AD]',
        goldText: 'text-[#8A6212]',
        goldBg: 'bg-[#8A6212]',
        goldBorder: 'border-[#D4AF37]',
        goldFocus: 'focus:border-[#D4AF37]',
        goldTextHover: 'hover:text-[#8A6212]',
        goldTextGroupHover: 'group-hover:text-[#8A6212]',
        badgeOccupied: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.resident && room.resident.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        if (isDarkMode) {
            switch (status) {
                case 'Đang ở': return 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]';
                case 'Trống': return 'bg-[#1A2438] text-[#5294E2] border-[#243B61]';
                case 'Đã cọc giữ chỗ': return 'bg-[#312519] text-[#C5A880] border-[#523F26]';
                case 'Sửa chữa': return 'bg-[#2D1B1B] text-[#E05252] border-[#522525]';
                default: return 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]';
            }
        } else {
            switch (status) {
                case 'Đang ở': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                case 'Trống': return 'bg-blue-50 text-blue-600 border-blue-200';
                case 'Đã cọc giữ chỗ': return 'bg-amber-50 text-amber-700 border-amber-200';
                case 'Sửa chữa': return 'bg-red-50 text-red-600 border-red-200';
                default: return 'bg-slate-50 text-slate-600 border-slate-200';
            }
        }
    };

    return (
        <div className={`w-full h-full max-h-screen transition-colors duration-300 ${theme.bg} font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden`}>

            {/* KHỐI CỐ ĐỊNH PHÍA TRÊN */}
            <div className="shrink-0">

                {/* ROW STATS PHONG CÁCH LUXURY HIGH-CONTRAST */}
                <div className={`${theme.statsBg} border rounded-sm p-6 mb-6 relative overflow-hidden shadow-2xl`}>
                    <div className={`absolute top-0 right-0 w-48 h-full bg-gradient-to-l ${isDarkMode ? 'from-[#C5A880]/[0.04]' : 'from-[#8A6212]/[0.05]'} to-transparent pointer-events-none`}></div>

                    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x ${theme.statsDivider}`}>
                        {/* Stat 1 */}
                        <div className="flex flex-col justify-between">
                            <span className={`text-[11px] tracking-[0.15em] ${theme.textMainSoft} uppercase font-semibold flex items-center gap-1.5`}>
                                <Activity size={12} className={isDarkMode ? 'text-[#D4AF37]' : 'text-[#8A6212]'} /> Tổng quy mô phòng
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className={`text-4xl font-normal ${theme.title} tracking-tight`}>{totalRooms}</span>
                                <span className={`text-[10px] ${theme.textMuted} uppercase font-mono tracking-wider font-medium`}>BĐS hiện hữu</span>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="flex flex-col justify-between lg:pl-6">
                            <span className={`text-[11px] tracking-[0.15em] ${theme.textMainSoft} uppercase font-semibold flex items-center gap-1.5`}>
                                <CheckCircle size={12} className="text-[#56B37B]" /> Đang cho thuê
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className="text-4xl font-normal text-[#56B37B] tracking-tight">{occupiedRooms}</span>
                                <span className={`text-[10px] ${theme.badgeOccupied} px-1.5 py-0.5 rounded-sm uppercase font-mono font-bold tracking-wider`}>
                                    Lấp đầy {((occupiedRooms / totalRooms) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="flex flex-col justify-between lg:pl-6">
                            <span className={`text-[11px] tracking-[0.15em] ${theme.textMainSoft} uppercase font-semibold flex items-center gap-1.5`}>
                                <Home size={12} className={isDarkMode ? 'text-[#62A1EC]' : 'text-blue-600'} /> Trống bàn giao
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className={`text-4xl font-normal ${isDarkMode ? 'text-[#62A1EC]' : 'text-blue-600'} tracking-tight`}>{availableRooms}</span>
                                <span className={`text-[10px] ${theme.textMuted} uppercase font-mono tracking-wider font-medium`}>Sẵn sàng ký</span>
                            </div>
                        </div>

                        {/* Stat 4 */}
                        <div className="flex flex-col justify-between lg:pl-6">
                            <span className={`text-[11px] tracking-[0.15em] ${theme.textMainSoft} uppercase font-semibold flex items-center gap-1.5`}>
                                <Clock size={12} className={isDarkMode ? 'text-[#EAD0A8]' : 'text-[#8A6212]'} /> Cọc giữ chỗ
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className={`text-4xl font-normal ${isDarkMode ? 'text-[#EAD0A8]' : 'text-[#8A6212]'} tracking-tight`}>{pendingRooms}</span>
                                <span className={`text-[10px] ${theme.textMuted} uppercase font-mono tracking-wider font-medium`}>Đợi bàn giao</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTROL BAR: BỘ LỌC TÌM KIẾM & NÚT THÊM PHÒNG ĐỒNG CẤP */}
                <div className={`${theme.panel} border rounded-sm p-4 mb-6`}>
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Thanh tìm kiếm nhanh */}
                        <div className="relative w-full lg:w-80">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm nhanh số phòng, tên khách thuê..."
                                className={`w-full ${theme.input} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                            />
                            <Search size={14} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                        </div>

                        {/* Nhóm Filter Trạng thái và Button Thêm mới đồng cấp */}
                        <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
                            {/* Khối Tabs Trạng thái */}
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
                                {['All', 'Đang ở', 'Trống', 'Đã cọc giữ chỗ', 'Sửa chữa'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 text-[10px] tracking-wider font-semibold border transition-all rounded-sm uppercase whitespace-nowrap ${statusFilter === status ? theme.cardActive : theme.cardIdle}`}
                                    >
                                        {status === 'All' ? 'Tất cả' : status === 'Đã cọc giữ chỗ' ? 'Đã Cọc' : status}
                                    </button>
                                ))}
                            </div>

                            {/* NÚT THÊM PHÒNG MỚI (Đã di chuyển về vị trí mới) */}
                            <button className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-[11px] font-bold px-4 py-2 rounded-sm hover:opacity-90 transition-opacity uppercase tracking-wider whitespace-nowrap h-[32px]">
                                <Plus size={14} /> Thêm Phòng Mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* VÙNG CUỘN DANH SÁCH PHÒNG */}
            <div className="flex-1 overflow-y-scroll pr-1 pb-4 min-h-[200px] scrollbar-thin scrollbar-thumb-[#3E404C] scrollbar-track-transparent">
                {filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredRooms.map((room) => (
                            <div key={room.id} className={`${theme.panel} border hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl`}>

                                <div className={`p-5 border-b ${theme.border}/50`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className={`text-[10px] font-mono ${theme.textMuted} block tracking-wider`}>{room.id} • {room.floor}</span>
                                            <h3 className={`text-base font-light tracking-wide ${theme.title} ${theme.goldTextGroupHover} transition-colors mt-0.5`}>{room.name}</h3>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(room.status)}`}>
                                            {room.status}
                                        </span>
                                    </div>
                                </div>

                                <div className={`p-5 ${theme.subBg} space-y-2.5 flex-1 text-xs`}>
                                    <div className="flex justify-between items-center">
                                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Diện tích</span>
                                        <span className={`${theme.title} font-light`}>{room.area}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Giá thuê</span>
                                        <span className={`font-mono font-medium ${theme.goldText}`}>{room.price} <span className={`text-[10px] ${theme.textMutedSoft} font-sans`}>/ thg</span></span>
                                    </div>

                                    <div className={`pt-2 mt-2 border-t ${theme.border}/30 grid grid-cols-2 gap-2 text-[11px] ${theme.textMuted}`}>
                                        <div className="flex items-center gap-1">
                                            <Zap size={12} className="text-amber-500" />
                                            <span className="truncate">Điện: <strong className={`${theme.title} font-mono font-normal`}>{room.electric.split('/')[0]}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Droplet size={12} className="text-blue-400" />
                                            <span className="truncate">Nước: <strong className={`${theme.title} font-mono font-normal`}>{room.water.split('/')[0]}</strong></span>
                                        </div>
                                    </div>

                                    <div className={`pt-3 border-t ${theme.border}/30 flex items-center justify-between`}>
                                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Khách thuê</span>
                                        {room.resident ? (
                                            <div className={`flex items-center gap-1.5 ${theme.title} font-medium`}>
                                                <div className={`h-4 w-4 rounded-full ${isDarkMode ? 'bg-[#C5A880]/10 border border-[#C5A880]/30 text-[#C5A880]' : 'bg-[#8A6212]/10 border border-[#D4AF37]/45 text-[#8A6212]'} flex items-center justify-center text-[9px]`}>
                                                    <User size={10} />
                                                </div>
                                                <span>{room.resident}</span>
                                            </div>
                                        ) : (
                                            <span className={`${theme.textMutedSoft} italic font-light text-[11px]`}>Chưa có</span>
                                        )}
                                    </div>
                                </div>

                                <div className={`p-3 ${theme.cardFooterBg} border-t flex gap-2 items-center text-[11px] tracking-wider`}>
                                    <button className={`${theme.textMuted} ${theme.goldTextHover} transition-colors font-medium uppercase px-2 py-1.5 shrink-0`}>
                                        Chốt Số
                                    </button>

                                    <div className="flex gap-1.5 ml-auto w-full justify-end">
                                        <button className={`flex items-center justify-center gap-1 ${theme.buttonOutline} font-semibold uppercase px-3 py-1.5 rounded-sm`}>
                                            <Eye size={12} /> Chi tiết
                                        </button>
                                        <button className={`flex items-center justify-center gap-1 ${isDarkMode ? 'text-black bg-gradient-to-r from-[#A98446] to-[#D4AF37]' : 'text-white bg-gradient-to-r from-[#8A6212] to-[#D4AF37]'} hover:brightness-110 transition-all font-bold uppercase px-3 py-1.5 rounded-sm`}>
                                            <FileText size={12} /> Hợp Đồng
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`py-16 text-center border border-dashed ${theme.border} ${theme.emptyBg} rounded-sm flex flex-col items-center justify-center min-h-[300px]`}>
                        <Home size={32} className={`${theme.textMutedSoft} mb-2`} />
                        <h3 className={`text-sm font-medium ${theme.title} tracking-wide`}>Không tìm thấy phòng phù hợp</h3>
                    </div>
                )}
            </div>

        </div>
    );
}