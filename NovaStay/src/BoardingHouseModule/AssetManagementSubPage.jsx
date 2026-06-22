import React, { useState } from 'react';
import {
    Plus,
    Search,
    Layers,
    Edit3,
    X,
    Package,
    Info,
    Image as ImageIcon
} from 'lucide-react';

// --- MOCK DATA DANH SÁCH TÀI SẢN BAN ĐẦU ---
const initialAssets = [
    { id: 'AST-001', name: 'Smart TV LG 4K 43 inch', category: 'Điện tử', quantity: 12, status: 'Hoạt động', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&q=80', description: 'Trang bị cho các phòng Studio và Duplex thuộc phân khu Vip.' },
    { id: 'AST-002', name: 'Tủ lạnh Inverter Panasonic 188L', category: 'Điện lạnh', quantity: 15, status: 'Hoạt động', image: 'https://images.unsplash.com/photo-1571175432247-fe8340df8399?auto=format&fit=crop&w=400&q=80', description: 'Tủ lạnh tiết kiệm điện, bàn giao đồng bộ kèm phòng.' },
    { id: 'AST-003', name: 'Điều hòa Daikin Inverter 1 HP', category: 'Điện lạnh', quantity: 15, status: 'Bảo trì', image: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=400&q=80', description: 'Đang tiến hành bảo dưỡng vệ sinh lưới lọc định kỳ.' },
    { id: 'AST-004', name: 'Bếp từ đôi Kangaroo Premium', category: 'Gia dụng', quantity: 10, status: 'Hoạt động', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', description: 'Bếp từ âm cao cấp lắp đặt tại khu vực bếp khép kín.' },
];

export default function AssetManagementSubPage({ isDarkMode = true }) {
    const [assets, setAssets] = useState(initialAssets);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State quản lý form tài sản mới
    const [formData, setFormData] = useState({
        name: '',
        category: 'Điện tử',
        quantity: '',
        status: 'Hoạt động',
        image: '',
        description: ''
    });

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
        buttonOutline: 'text-[#C9CBD3] hover:text-white bg-[#1F212A] border-[#2C2D35]',
        modalBg: 'bg-[#16171E] border-[#3E3F4A]',
        modalInput: 'bg-[#1F212A] border-[#2C2D35] text-white focus:border-[#C5A880] placeholder-[#5A5C66]',
        cardFooterBg: 'bg-[#1B1C24] border-[#2C2D35]',
        goldText: 'text-[#C5A880]',
        goldBg: 'bg-[#C5A880]',
        goldBorder: 'border-[#C5A880]',
        goldFocus: 'focus:border-[#C5A880]',
        goldTextHover: 'hover:text-[#C5A880]',
        goldTextGroupHover: 'group-hover:text-[#C5A880]',
        imageFade: 'from-[#16171E]',
        textMutedHover: 'hover:text-white'
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
        buttonOutline: 'text-slate-600 hover:text-slate-950 bg-[#FFF9EC] border-[#E5D4AD]',
        modalBg: 'bg-white border-[#E5D4AD]',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
        cardFooterBg: 'bg-[#FFFDF9] border-[#E5D4AD]',
        goldText: 'text-[#8A6212]',
        goldBg: 'bg-[#8A6212]',
        goldBorder: 'border-[#D4AF37]',
        goldFocus: 'focus:border-[#D4AF37]',
        goldTextHover: 'hover:text-[#8A6212]',
        goldTextGroupHover: 'group-hover:text-[#8A6212]',
        imageFade: 'from-white',
        textMutedHover: 'hover:text-slate-950'
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        if (isDarkMode) {
            switch (status) {
                case 'Hoạt động': return 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]';
                case 'Bảo trì': return 'bg-[#312519] text-[#C5A880] border-[#523F26]';
                case 'Thanh lý': return 'bg-[#2D1B1B] text-[#E05252] border-[#522525]';
                default: return 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]';
            }
        } else {
            switch (status) {
                case 'Hoạt động': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                case 'Bảo trì': return 'bg-amber-50 text-amber-700 border-amber-200';
                case 'Thanh lý': return 'bg-red-50 text-red-600 border-red-200';
                default: return 'bg-slate-50 text-slate-600 border-slate-200';
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.quantity) return;

        const defaultImg = formData.image || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80';

        const newAsset = {
            id: `AST-0${assets.length + 1}`.padStart(7, '0'),
            name: formData.name,
            category: formData.category,
            quantity: parseInt(formData.quantity),
            status: formData.status,
            image: defaultImg,
            description: formData.description || 'Chưa có mô tả chi tiết tài sản.'
        };

        setAssets([newAsset, ...assets]);
        setIsModalOpen(false);
        setFormData({ name: '', category: 'Điện tử', quantity: '', status: 'Hoạt động', image: '', description: '' });
    };

    return (
        <div className={`w-full h-full max-h-screen transition-colors duration-300 ${theme.bg} font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden relative`}>

            {/* KHỐI CỐ ĐỊNH PHÍA TRÊN */}
            <div className="shrink-0">
                {/* CONTROL BAR (Thanh công cụ đưa lên đầu trang) */}
                <div className={`${theme.panel} border rounded-sm p-4 mb-6`}>
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Thanh tìm kiếm nhanh */}
                        <div className="relative w-full lg:w-96">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm mã tài sản, tên thiết bị, phân loại..."
                                className={`w-full ${theme.input} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                            />
                            <Search size={14} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                        </div>

                        {/* Button Thêm Tài Sản Mới */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={`flex items-center justify-center gap-1.5 ${isDarkMode ? 'bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black' : 'bg-gradient-to-r from-[#8A6212] to-[#D4AF37] text-white hover:brightness-105'} text-[11px] font-bold px-4 py-2.5 rounded-sm transition-all uppercase tracking-wider whitespace-nowrap h-[36px]`}
                        >
                            <Plus size={14} /> Thêm Tài Sản Mới
                        </button>
                    </div>
                </div>
            </div>

            {/* VÙNG CUỘN HIỂN THỊ DANH SÁCH TÀI SẢN (SCROLLABLE AREA) */}
            <div className="flex-1 overflow-y-scroll pr-1 pb-4 min-h-[200px] scrollbar-thin scrollbar-thumb-[#3E404C] scrollbar-track-transparent">
                {filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAssets.map((asset) => (
                            <div key={asset.id} className={`${theme.panel} border hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl`}>

                                {/* KHỐI HÌNH ẢNH MINH HỌA CAO CẤP */}
                                <div className={`h-44 w-full relative overflow-hidden bg-slate-900 border-b ${theme.border}/50 shrink-0`}>
                                    <img
                                        src={asset.image}
                                        alt={asset.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${theme.imageFade} via-transparent to-transparent`}></div>

                                    <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] tracking-wider uppercase font-semibold border rounded-sm ${getStatusStyle(asset.status)}`}>
                                        {asset.status}
                                    </span>
                                </div>

                                {/* KHỐI NỘI DUNG THÔNG TIN CHI TIẾT */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-[10px] font-mono ${theme.textMuted} tracking-wider`}>{asset.id}</span>
                                            <span className={`text-[10px] ${theme.goldText} font-medium uppercase bg-amber-500/[0.04] px-2 py-0.5 border ${theme.goldBorder}/20 rounded-sm`}>
                                                {asset.category}
                                            </span>
                                        </div>
                                        <h3 className={`text-sm font-medium ${theme.title} ${theme.goldTextGroupHover} transition-colors line-clamp-1`}>{asset.name}</h3>
                                        <p className={`text-[11px] ${theme.textMuted} mt-1.5 font-light line-clamp-2 leading-relaxed`}>{asset.description}</p>
                                    </div>

                                    <div className={`pt-3 border-t ${theme.border}/40 flex justify-between items-center text-xs`}>
                                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px] flex items-center gap-1`}>
                                            <Package size={11} /> Tổng số lượng cấp phát
                                        </span>
                                        <span className={`text-base font-normal font-mono ${theme.title} tracking-wide`}>
                                            {asset.quantity} <span className={`text-[10px] ${theme.textMutedSoft} font-sans`}>thiết bị</span>
                                        </span>
                                    </div>
                                </div>

                                {/* KHỐI HÀNH ĐỘNG DƯỚI CÙNG */}
                                <div className={`p-3 ${theme.cardFooterBg} border-t flex justify-between items-center text-[11px] tracking-wider`}>
                                    <button className={`${theme.textMuted} ${theme.goldTextHover} flex items-center gap-1 transition-colors px-2 py-1.5 text-[10px] uppercase font-mono`}>
                                        <Info size={11} /> Lịch sử cấp phát
                                    </button>
                                    <button className={`flex items-center justify-center gap-1 ${theme.buttonOutline} font-semibold uppercase px-3 py-1.5 rounded-sm text-[10px] tracking-widest`}>
                                        <Edit3 size={11} /> Hiệu chỉnh
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`py-16 text-center border border-dashed ${theme.border} ${theme.panel} rounded-sm flex flex-col items-center justify-center min-h-[300px]`}>
                        <Package size={32} className={`${theme.textMutedSoft} mb-2`} />
                        <h3 className={`text-sm font-medium ${theme.title} tracking-wide`}>Không tìm thấy tài sản phù hợp</h3>
                    </div>
                )}
            </div>

            {/* --- LUXURY MODAL FORM: THÊM TÀI SẢN MỚI --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-md w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>

                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${theme.goldBg} animate-pulse`}></div>
                                    <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>Khai Báo Tài Sản Nội Thất</h3>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                    <X size={18} />
                                </button>
                            </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Tên tài sản / Thiết bị *</label>
                                <input
                                    type="text" required placeholder="Ví dụ: Tủ lạnh Toshiba Inverter..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Danh mục nhóm</label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} appearance-none cursor-pointer`}
                                        >
                                            <option value="Điện tử">Điện tử (TV, Loa...)</option>
                                            <option value="Điện lạnh">Điện lạnh (Điều hòa, Tủ lạnh...)</option>
                                            <option value="Gia dụng">Gia dụng (Bếp, Lò vi sóng...)</option>
                                            <option value="Nội thất gỗ">Nội thất gỗ (Giường, Tủ quần áo...)</option>
                                        </select>
                                        <Layers size={12} className={`absolute right-3 top-3 ${theme.textMutedSoft} pointer-events-none`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Số lượng nhập kho *</label>
                                    <input
                                        type="number" required placeholder="Ví dụ: 10, 15..." min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Đường dẫn ảnh minh họa (URL)</label>
                                <div className="relative">
                                    <input
                                        type="url" placeholder="https://images.unsplash.com/..."
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                    />
                                    <ImageIcon size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Mô tả đặc tính tài sản</label>
                                <textarea
                                    rows="3" placeholder="Thông số kỹ thuật, vị trí phân chia phòng..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full ${theme.modalInput} border text-xs p-3 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors resize-none`}
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-[#2C2D35] mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 text-xs font-semibold tracking-wider ${theme.textMuted} ${theme.textMutedHover} uppercase`}>Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase">Khai Báo Kho</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}