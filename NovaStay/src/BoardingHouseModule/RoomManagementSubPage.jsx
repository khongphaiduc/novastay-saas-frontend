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

export default function RoomManagementSubPage() {
    const [rooms, setRooms] = useState(initialRooms);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Đang ở').length;
    const availableRooms = rooms.filter(r => r.status === 'Trống').length;
    const pendingRooms = rooms.filter(r => r.status === 'Đã cọc giữ chỗ').length;

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.resident && room.resident.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Đang ở': return 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]';
            case 'Trống': return 'bg-[#1A2438] text-[#5294E2] border-[#243B61]';
            case 'Đã cọc giữ chỗ': return 'bg-[#312519] text-[#C5A880] border-[#523F26]';
            case 'Sửa chữa': return 'bg-[#2D1B1B] text-[#E05252] border-[#522525]';
            default: return 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]';
        }
    };

    return (
        <div className="w-full h-full max-h-screen bg-[#0F1016] text-[#E4E6EB] font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden">

            {/* KHỐI CỐ ĐỊNH PHÍA TRÊN */}
            <div className="shrink-0">

                {/* ROW STATS PHONG CÁCH LUXURY HIGH-CONTRAST */}
                <div className="bg-[#16171E] border border-[#3E404C] rounded-sm p-6 mb-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#C5A880]/[0.04] to-transparent pointer-events-none"></div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x lg:divide-[#343642]">
                        {/* Stat 1 */}
                        <div className="flex flex-col justify-between">
                            <span className="text-[11px] tracking-[0.15em] text-[#C9CBD3] uppercase font-semibold flex items-center gap-1.5">
                                <Activity size={12} className="text-[#D4AF37]" /> Tổng quy mô phòng
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className="text-4xl font-normal text-white tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">{totalRooms}</span>
                                <span className="text-[10px] text-[#9FA2AE] uppercase font-mono tracking-wider font-medium">BĐS hiện hữu</span>
                            </div>
                        </div>

                        {/* Stat 2 */}
                        <div className="flex flex-col justify-between lg:pl-6">
                            <span className="text-[11px] tracking-[0.15em] text-[#C9CBD3] uppercase font-semibold flex items-center gap-1.5">
                                <CheckCircle size={12} className="text-[#56B37B]" /> Đang cho thuê
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className="text-4xl font-normal text-[#56B37B] tracking-tight drop-shadow-[0_2px_8px_rgba(86,179,123,0.1)]">{occupiedRooms}</span>
                                <span className="text-[10px] text-white bg-[#1B2A22] border border-[#254A34] px-1.5 py-0.5 rounded-sm uppercase font-mono font-bold tracking-wider">
                                    Lấp đầy {((occupiedRooms / totalRooms) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        {/* Stat 3 */}
                        <div className="flex flex-col justify-between lg:pl-6">
                            <span className="text-[11px] tracking-[0.15em] text-[#C9CBD3] uppercase font-semibold flex items-center gap-1.5">
                                <Home size={12} className="text-[#62A1EC]" /> Trống bàn giao
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className="text-4xl font-normal text-[#62A1EC] tracking-tight drop-shadow-[0_2px_8px_rgba(98,161,236,0.1)]">{availableRooms}</span>
                                <span className="text-[10px] text-[#9FA2AE] uppercase font-mono tracking-wider font-medium">Sẵn sàng ký</span>
                            </div>
                        </div>

                        {/* Stat 4 */}
                        <div className="flex flex-col justify-between lg:pl-6">
                            <span className="text-[11px] tracking-[0.15em] text-[#C9CBD3] uppercase font-semibold flex items-center gap-1.5">
                                <Clock size={12} className="text-[#EAD0A8]" /> Cọc giữ chỗ
                            </span>
                            <div className="flex items-baseline gap-2.5 mt-2">
                                <span className="text-4xl font-normal text-[#EAD0A8] tracking-tight drop-shadow-[0_2px_8px_rgba(234,208,168,0.1)]">{pendingRooms}</span>
                                <span className="text-[10px] text-[#9FA2AE] uppercase font-mono tracking-wider font-medium">Đợi bàn giao</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTROL BAR: BỘ LỌC TÌM KIẾM & NÚT THÊM PHÒNG ĐỒNG CẤP */}
                <div className="bg-[#16171E] border border-[#2C2D35] rounded-sm p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Thanh tìm kiếm nhanh */}
                        <div className="relative w-full lg:w-80">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm nhanh số phòng, tên khách thuê..."
                                className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-9 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors placeholder-[#5A5C66]"
                            />
                            <Search size={14} className="absolute left-3 top-3 text-[#5A5C66]" />
                        </div>

                        {/* Nhóm Filter Trạng thái và Button Thêm mới đồng cấp */}
                        <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
                            {/* Khối Tabs Trạng thái */}
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
                                {['All', 'Đang ở', 'Trống', 'Đã cọc giữ chỗ', 'Sửa chữa'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 text-[10px] tracking-wider font-semibold border transition-all rounded-sm uppercase whitespace-nowrap ${statusFilter === status ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]' : 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white'}`}
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
                            <div key={room.id} className="bg-[#16171E] border border-[#2C2D35] hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl">

                                <div className="p-5 border-b border-[#2C2D35]/50">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="text-[10px] font-mono text-[#8A8D98] block tracking-wider">{room.id} • {room.floor}</span>
                                            <h3 className="text-base font-light tracking-wide text-white group-hover:text-[#C5A880] transition-colors mt-0.5">{room.name}</h3>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(room.status)}`}>
                                            {room.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 bg-[#12131A]/40 space-y-2.5 flex-1 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Diện tích</span>
                                        <span className="text-[#E4E6EB] font-light">{room.area}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Giá thuê</span>
                                        <span className="text-[#C5A880] font-mono font-medium">{room.price} <span className="text-[10px] text-[#5A5C66]/80 font-sans">/ thg</span></span>
                                    </div>

                                    <div className="pt-2 mt-2 border-t border-[#2C2D35]/30 grid grid-cols-2 gap-2 text-[11px] text-[#8A8D98]">
                                        <div className="flex items-center gap-1">
                                            <Zap size={12} className="text-amber-500" />
                                            <span className="truncate">Điện: <strong className="text-white font-mono font-normal">{room.electric.split('/')[0]}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Droplet size={12} className="text-blue-400" />
                                            <span className="truncate">Nước: <strong className="text-white font-mono font-normal">{room.water.split('/')[0]}</strong></span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-[#2C2D35]/30 flex items-center justify-between">
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Khách thuê</span>
                                        {room.resident ? (
                                            <div className="flex items-center gap-1.5 text-white font-medium">
                                                <div className="h-4 w-4 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center text-[9px] text-[#C5A880]">
                                                    <User size={10} />
                                                </div>
                                                <span>{room.resident}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[#5A5C66] italic font-light text-[11px]">Chưa có</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 bg-[#1B1C24] border-t border-[#2C2D35] flex gap-2 items-center text-[11px] tracking-wider">
                                    <button className="text-[#8A8D98] hover:text-[#C5A880] transition-colors font-medium uppercase px-2 py-1.5 shrink-0">
                                        Chốt Số
                                    </button>

                                    <div className="flex gap-1.5 ml-auto w-full justify-end">
                                        <button className="flex items-center justify-center gap-1 text-[#8A8D98] hover:text-white transition-colors font-semibold uppercase bg-[#1F212A] border border-[#2C2D35] px-3 py-1.5 rounded-sm">
                                            <Eye size={12} /> Chi tiết
                                        </button>
                                        <button className="flex items-center justify-center gap-1 text-black bg-gradient-to-r from-[#A98446] to-[#D4AF37] hover:brightness-110 transition-all font-bold uppercase px-3 py-1.5 rounded-sm">
                                            <FileText size={12} /> Hợp Đồng
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center border border-dashed border-[#2C2D35] bg-[#16171E] rounded-sm flex flex-col items-center justify-center min-h-[300px]">
                        <Home size={32} className="text-[#2C2D35] mb-2" />
                        <h3 className="text-sm font-medium text-white tracking-wide">Không tìm thấy phòng phù hợp</h3>
                    </div>
                )}
            </div>

        </div>
    );
}