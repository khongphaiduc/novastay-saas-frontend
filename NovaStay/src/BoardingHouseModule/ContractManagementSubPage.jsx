import React, { useState } from 'react';
import {
    Search,
    Plus,
    FileText,
    User,
    ChevronRight,
    Sparkles,
    Calendar,
    DollarSign,
    X,
    FileCheck,
    AlertCircle,
    History,
    Clock,
    Eye,
    Shield,
    Zap,
    Droplet
} from 'lucide-react';

// --- MOCK DATA DANH SÁCH HỢP ĐỒNG ---
const initialContracts = [
    { id: 'CTR-2026-001', tenant: 'Nguyễn Hoàng Long', room: 'Phòng 401 (Duplex)', deposit: '13,000,000đ', price: '6,500,000đ', startDate: '01/01/2026', endDate: '01/01/2027', status: 'Còn hiệu lực', phone: '0901.234.567', idCard: '001095001234', electric: '3.500đ/kWh', water: '100.000đ/người' },
    { id: 'CTR-2026-002', tenant: 'Trần Thị Thu Thủy', room: 'Phòng 202 (Studio Vip)', deposit: '10,400,000đ', price: '5,200,000đ', startDate: '15/02/2026', endDate: '15/08/2026', status: 'Sắp hết hạn', phone: '0912.345.678', idCard: '002096005678', electric: '3.500đ/kWh', water: '100.000đ/người' },
    { id: 'CTR-2025-094', tenant: 'Phạm Minh Quang', room: 'Phòng 102 (Khu A)', deposit: '8,000,000đ', price: '4,000,000đ', startDate: '01/06/2025', endDate: '01/06/2026', status: 'Quá hạn / Chờ gia hạn', phone: '0988.777.888', idCard: '003097009999', electric: '3.800đ/kWh', water: '30.000đ/m³' },
];

export default function ContractManagementSubPage() {
    const [contracts, setContracts] = useState(initialContracts);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // States quản lý Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null); // State chứa hợp đồng đang xem chi tiết

    // State quản lý form tạo hợp đồng mới
    const [formData, setFormData] = useState({
        tenant: '',
        room: '',
        price: '',
        deposit: '',
        startDate: '',
        endDate: ''
    });

    const filteredContracts = contracts.filter(ctr => {
        const matchesSearch = ctr.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ctr.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ctr.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || ctr.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Còn hiệu lực': return 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]';
            case 'Sắp hết hạn': return 'bg-[#312519] text-[#C5A880] border-[#523F26]';
            case 'Quá hạn / Chờ gia hạn': return 'bg-[#2D1B1B] text-[#E05252] border-[#522525]';
            default: return 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tenant || !formData.room || !formData.price) return;

        const formatCurrency = (val) => Number(val).toLocaleString('vi-VN') + 'đ';
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-');
            return `${d}/${m}/${y}`;
        };

        const newContract = {
            id: `CTR-2026-${String(contracts.length + 1).padStart(3, '0')}`,
            tenant: formData.tenant,
            room: formData.room,
            price: formatCurrency(formData.price),
            deposit: formatCurrency(formData.deposit || formData.price * 2),
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
            status: 'Còn hiệu lực',
            phone: 'Chưa cập nhật',
            idCard: 'Chưa cập nhật',
            electric: '3.500đ/kWh',
            water: '100.000đ/người'
        };

        setContracts([newContract, ...contracts]);
        setIsCreateModalOpen(false);
        setFormData({ tenant: '', room: '', price: '', deposit: '', startDate: '', endDate: '' });
    };

    return (
        <div className="w-full h-full max-h-screen bg-[#0F1016] text-[#E4E6EB] font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden relative">

            {/* KHỐI CỐ ĐỊNH PHÍA TRÊN */}
            <div className="shrink-0">
                {/* CONTROL BAR */}
                <div className="bg-[#16171E] border border-[#2C2D35] rounded-sm p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Thanh tìm kiếm nhanh */}
                        <div className="relative w-full lg:w-80">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm mã hợp đồng, khách thuê, số phòng..."
                                className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-9 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors placeholder-[#5A5C66]"
                            />
                            <Search size={14} className="absolute left-3 top-3 text-[#5A5C66]" />
                        </div>

                        {/* Bộ lọc trạng thái pháp lý và nút Thêm mới */}
                        <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
                                {['All', 'Còn hiệu lực', 'Sắp hết hạn', 'Quá hạn / Chờ gia hạn'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 text-[10px] tracking-wider font-semibold border transition-all rounded-sm uppercase whitespace-nowrap ${statusFilter === status ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]' : 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white'}`}
                                    >
                                        {status === 'All' ? 'Tất cả' : status === 'Sắp hết hạn' ? 'Sắp hết hạn' : status === 'Còn hiệu lực' ? 'Còn hạn' : 'Quá hạn'}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-[11px] font-bold px-4 py-2 rounded-sm hover:opacity-90 transition-opacity uppercase tracking-wider whitespace-nowrap h-[32px]"
                            >
                                <Plus size={14} /> Khởi Tạo Hợp Đồng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* VÙNG CUỘN HIỂN THỊ DANH SÁCH HỢP ĐỒNG */}
            <div className="flex-1 overflow-y-scroll pr-1 pb-4 min-h-[200px] scrollbar-thin scrollbar-thumb-[#3E404C] scrollbar-track-transparent">
                {filteredContracts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredContracts.map((ctr) => (
                            <div key={ctr.id} className="bg-[#16171E] border border-[#2C2D35] hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl">

                                <div className="p-5 border-b border-[#2C2D35]/50">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="text-[10px] font-mono text-[#8A8D98] block tracking-wider">{ctr.id}</span>
                                            <h3 className="text-base font-light tracking-wide text-white group-hover:text-[#C5A880] transition-colors mt-0.5">{ctr.room}</h3>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(ctr.status)}`}>
                                            {ctr.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 bg-[#12131A]/40 space-y-3 flex-1 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Khách hàng ký kết</span>
                                        <div className="flex items-center gap-1.5 text-white font-medium">
                                            <User size={12} className="text-[#C5A880]" />
                                            <span>{ctr.tenant}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Giá thuê định kỳ</span>
                                        <span className="text-white font-mono">{ctr.price} <span className="text-[10px] text-[#5A5C66]">/ tháng</span></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Tiền bảo cọc</span>
                                        <span className="text-[#C5A880] font-mono">{ctr.deposit}</span>
                                    </div>

                                    <div className="pt-3 mt-1 border-t border-[#2C2D35]/30 grid grid-cols-2 gap-2 text-[11px] text-[#8A8D98]">
                                        <div>
                                            <span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Ngày hiệu lực</span>
                                            <div className="flex items-center gap-1 text-white mt-0.5 font-light">
                                                <Calendar size={11} className="text-[#8A8D98]" /> {ctr.startDate}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Ngày đáo hạn</span>
                                            <div className="flex items-center gap-1 text-white mt-0.5 font-light">
                                                <Clock size={11} className="text-[#8A8D98]" /> {ctr.endDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Khối Hành Động Sửa Đổi & Kích Hoạt Xem Chi Tiết */}
                                <div className="p-3 bg-[#1B1C24] border-t border-[#2C2D35] flex gap-2 items-center text-[11px] tracking-wider">
                                    <button className="text-[#8A8D98] hover:text-[#C5A880] transition-colors font-medium uppercase px-2 py-1.5 flex items-center gap-1 text-[10px]">
                                        <History size={11} /> Nhật ký
                                    </button>

                                    <div className="flex gap-1.5 ml-auto">
                                        {/* BUTTON XEM CHI TIẾT (MỚI KẾT NỐI MODAL) */}
                                        <button
                                            onClick={() => setSelectedContract(ctr)}
                                            className="flex items-center justify-center gap-1 text-[#C9CBD3] bg-[#1F212A] border border-[#2C2D35] hover:text-white hover:border-[#C5A880] transition-all font-semibold uppercase px-3 py-1.5 rounded-sm"
                                        >
                                            <Eye size={12} /> Xem Chi Tiết
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center border border-dashed border-[#2C2D35] bg-[#16171E] rounded-sm flex flex-col items-center justify-center min-h-[300px]">
                        <FileCheck size={32} className="text-[#2C2D35] mb-2" />
                        <h3 className="text-sm font-medium text-white tracking-wide">Không tìm thấy dữ liệu hồ sơ</h3>
                    </div>
                )}
            </div>

            {/* --- LUXURY MODAL: XEM CHI TIẾT HỢP ĐỒNG (MỚI) --- */}
            {selectedContract && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedContract(null)}></div>

                    <div className="relative bg-[#16171E] border border-[#C5A880]/30 max-w-2xl w-full p-8 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200 text-xs">

                        {/* Con dấu hiệu lực bảo mật chìm phía sau nền */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C5A880]/[0.02] pointer-events-none select-none">
                            <Shield size={240} className="stroke-[1]" />
                        </div>

                        {/* Modal Header */}
                        <div className="flex justify-between items-start border-b border-[#2C2D35] pb-4 mb-6">
                            <div>
                                <span className="text-[9px] tracking-[0.2em] text-[#C5A880] uppercase font-mono">{selectedContract.id}</span>
                                <h3 className="text-base font-light tracking-wide text-white uppercase mt-0.5">Chứng Thư Thỏa Thuận Lưu Trú</h3>
                            </div>
                            <button onClick={() => setSelectedContract(null)} className="text-[#8A8D98] hover:text-white transition-colors p-1 relative z-10">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nội dung chi tiết văn bản */}
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none relative z-10">

                            {/* Phần I: Thông tin chủ thể thuê */}
                            <div>
                                <h4 className="text-[10px] tracking-widest text-[#C5A880] uppercase font-semibold border-b border-[#2C2D35]/60 pb-1.5 mb-3">I. Thông Tin Bên Thuê (Bên B)</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[#C9CBD3]">
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Họ và tên chủ hộ</span> <strong className="text-white font-medium">{selectedContract.tenant}</strong></div>
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Số điện thoại</span> <span className="font-mono">{selectedContract.phone}</span></div>
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Số CMND / CCCD</span> <span className="font-mono">{selectedContract.idCard}</span></div>
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Mục đích lưu trú</span> <span>Nhà ở dài hạn</span></div>
                                </div>
                            </div>

                            {/* Phần II: Chi tiết mặt bằng bất động sản */}
                            <div>
                                <h4 className="text-[10px] tracking-widest text-[#C5A880] uppercase font-semibold border-b border-[#2C2D35]/60 pb-1.5 mb-3">II. Đối Tượng Thuê & Thời Hạn</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[#C9CBD3]">
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Vị trí căn hộ / Phòng</span> <strong className="text-white font-medium">{selectedContract.room}</strong></div>
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Trạng thái hiện tại</span> <span className="text-[#4E9F6D]">{selectedContract.status}</span></div>
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Ngày kích hoạt</span> <span className="font-mono text-white">{selectedContract.startDate}</span></div>
                                    <div><span className="text-[#5A5C66] block text-[9px] uppercase tracking-wider">Ngày kết thúc đáo hạn</span> <span className="font-mono text-white">{selectedContract.endDate}</span></div>
                                </div>
                            </div>

                            {/* Phần III: Định mức giá thuê tài chính & Dịch vụ liên kết */}
                            <div>
                                <h4 className="text-[10px] tracking-widest text-[#C5A880] uppercase font-semibold border-b border-[#2C2D35]/60 pb-1.5 mb-3">III. Thỏa Thuận Biểu Phí Tài Chính</h4>
                                <div className="grid grid-cols-2 gap-4 bg-[#1F212A]/60 border border-[#2C2D35] p-4 rounded-sm">
                                    <div>
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Giá thuê định kỳ hàng tháng</span>
                                        <p className="text-lg font-normal text-white font-mono mt-0.5">{selectedContract.price}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#5A5C66] uppercase tracking-wider text-[9px]">Tổng hạn mức ký quỹ (Tiền cọc)</span>
                                        <p className="text-lg font-normal text-[#EAD0A8] font-mono mt-0.5">{selectedContract.deposit}</p>
                                    </div>
                                </div>

                                {/* Định mức dịch vụ đi kèm */}
                                <div className="grid grid-cols-2 gap-3 mt-3 text-[#9FA2AE]">
                                    <div className="flex items-center gap-2 p-2 bg-[#12131A] border border-[#2C2D35]/60 rounded-sm">
                                        <Zap size={14} className="text-amber-500" />
                                        <span>Định mức Điện: <strong className="text-white font-mono">{selectedContract.electric}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-[#12131A] border border-[#2C2D35]/60 rounded-sm">
                                        <Droplet size={14} className="text-blue-400" />
                                        <span>Định mức Nước: <strong className="text-white font-mono">{selectedContract.water}</strong></span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer Actions */}
                        <div className="flex gap-3 justify-end pt-5 border-t border-[#2C2D35] mt-8 relative z-10">
                            <button
                                type="button"
                                onClick={() => setSelectedContract(null)}
                                className="px-5 py-2.5 text-xs font-semibold tracking-wider bg-[#1F212A] border border-[#2C2D35] text-[#C9CBD3] hover:text-white uppercase transition-colors rounded-sm"
                            >
                                Đóng văn bản
                            </button>
                            <button
                                type="button"
                                className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase transition-all"
                            >
                                Thanh Lý / Hủy Hợp Đồng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LUXURY MODAL FORM: KHỞI TẠO HỢP ĐỒNG MỚI --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>

                    <div className="relative bg-[#16171E] border border-[#3E3F4A] max-w-xl w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200">

                        <div className="flex justify-between items-center border-b border-[#2C2D35] pb-4 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#C5A880] animate-pulse"></div>
                                <h3 className="text-sm font-semibold tracking-widest text-white uppercase">Thiết Lập Pháp Lý Thuê Phòng</h3>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-[#8A8D98] hover:text-white transition-colors p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Đại diện ký tên *</label>
                                    <div className="relative">
                                        <input
                                            type="text" required placeholder="Tên chủ hộ thuê phòng..."
                                            value={formData.tenant}
                                            onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                                            className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-8 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                                        />
                                        <User size={13} className="absolute left-2.5 top-3 text-[#5A5C66]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Bất động sản chỉ định *</label>
                                    <input
                                        type="text" required placeholder="Ví dụ: Phòng 401 (Duplex)..."
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                        className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Giá thuê / Tháng (VND) *</label>
                                    <div className="relative">
                                        <input
                                            type="number" required placeholder="6500000..."
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-8 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                                        />
                                        <DollarSign size={13} className="absolute left-2.5 top-3 text-[#5A5C66]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Tiền bảo cọc thương lượng</label>
                                    <div className="relative">
                                        <input
                                            type="number" placeholder="Để trống mặc định x2 giá thuê..."
                                            value={formData.deposit}
                                            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                                            className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 pl-8 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors"
                                        />
                                        <DollarSign size={13} className="absolute left-2.5 top-3 text-[#5A5C66]" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Ngày bắt đầu hiệu lực *</label>
                                    <input
                                        type="date" required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors uppercase font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#8A8D98] mb-1.5 uppercase font-medium">Ngày đáo hạn kết thúc *</label>
                                    <input
                                        type="date" required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full bg-[#1F212A] border border-[#2C2D35] text-xs px-3 py-2.5 text-white rounded-sm focus:outline-none focus:border-[#C5A880] transition-colors uppercase font-mono"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-[#2D1B1B]/30 border border-[#522525]/40 rounded-sm flex items-start gap-2 text-[11px] text-[#E05252] font-light leading-relaxed">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <p>Hồ sơ hợp đồng sau khi kích hoạt sẽ tự động khóa dữ liệu phòng chỉ định, đồng bộ chu kỳ tính hóa đơn hàng tháng.</p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-[#2C2D35] mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs font-semibold tracking-wider text-[#8A8D98] hover:text-white uppercase">Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase">Kích Hoạt Pháp Lý</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}