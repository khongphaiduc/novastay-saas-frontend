import React, { useState } from 'react';
import {
    Plus,
    Zap,
    Droplet,
    Wifi,
    Trash2,
    ShieldCheck,
    Settings2,
    Sparkles,
    Edit3,
    ToggleLeft,
    ToggleRight,
    X,
    Layers,
    DollarSign
} from 'lucide-react';

// --- MOCK DATA DỊCH VỤ BAN ĐẦU ---
const initialServices = [
    { id: 'SVC-001', name: 'Tiền Điện', type: 'Theo chỉ số công tơ', price: '3,500đ', unit: 'kWh', iconType: 'Zap', isActive: true },
    { id: 'SVC-002', name: 'Tiền Nước (Mặc định)', type: 'Cố định theo người', price: '100,000đ', unit: 'người / tháng', iconType: 'Droplet', isActive: true },
    { id: 'SVC-003', name: 'Mạng Internet / Wifi', type: 'Cố định theo phòng', price: '100,000đ', unit: 'phòng / tháng', iconType: 'Wifi', isActive: true },
    { id: 'SVC-004', name: 'Thu gom rác & Vệ sinh', type: 'Cố định theo phòng', price: '50,000đ', unit: 'phòng / tháng', iconType: 'Trash2', isActive: true },
];

export default function ServiceSetupSubPage({ isDarkMode = true }) {
    const [services, setServices] = useState(initialServices);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State quản lý form
    const [formData, setFormData] = useState({
        name: '',
        type: 'Theo chỉ số công tơ',
        price: '',
        unit: 'kWh',
        iconType: 'Zap'
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
        buttonActionBg: 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white',
        modalBg: 'bg-[#16171E] border-[#3E3F4A]',
        modalInput: 'bg-[#1F212A] border-[#2C2D35] text-white focus:border-[#C5A880]',
        cardFooterBg: 'bg-[#1B1C24] border-[#2C2D35]',
        emptyAddBg: 'border-[#2C2D35] bg-[#12131A]/30 hover:bg-[#12131A]/60',
        goldText: 'text-[#C5A880]',
        goldBg: 'bg-[#C5A880]',
        goldBorder: 'border-[#C5A880]',
        goldFocus: 'focus:border-[#C5A880]',
        goldTextHover: 'hover:text-[#C5A880]',
        goldTextGroupHover: 'group-hover:text-[#C5A880]',
        priceText: 'text-[#EAD0A8]',
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
        buttonActionBg: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-600 hover:text-slate-950',
        modalBg: 'bg-white border-[#E5D4AD]',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]',
        cardFooterBg: 'bg-[#FFFDF9] border-[#E5D4AD]',
        emptyAddBg: 'border-[#E5D4AD] bg-white hover:bg-amber-50/40',
        goldText: 'text-[#8A6212]',
        goldBg: 'bg-[#8A6212]',
        goldBorder: 'border-[#D4AF37]',
        goldFocus: 'focus:border-[#D4AF37]',
        goldTextHover: 'hover:text-[#8A6212]',
        goldTextGroupHover: 'group-hover:text-[#8A6212]',
        priceText: 'text-[#8A6212]',
        textMutedHover: 'hover:text-slate-950'
    };

    const toggleServiceStatus = (id) => {
        setServices(services.map(svc =>
            svc.id === id ? { ...svc, isActive: !svc.isActive } : svc
        ));
    };

    // Hàm chọn Icon tương ứng dựa trên loại dịch vụ
    const getServiceIcon = (iconType) => {
        switch (iconType) {
            case 'Zap': return <Zap size={16} />;
            case 'Droplet': return <Droplet size={16} />;
            case 'Wifi': return <Wifi size={16} />;
            case 'Trash2': return <Trash2 size={16} />;
            default: return <ShieldCheck size={16} />;
        }
    };

    const getServiceColor = (iconType, isDark) => {
        if (isDark) {
            switch (iconType) {
                case 'Zap': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
                case 'Droplet': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
                case 'Wifi': return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
                case 'Trash2': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
                default: return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
            }
        } else {
            switch (iconType) {
                case 'Zap': return 'text-amber-700 border-amber-500/35 bg-amber-500/10';
                case 'Droplet': return 'text-blue-700 border-blue-500/35 bg-blue-500/10';
                case 'Wifi': return 'text-purple-700 border-purple-500/35 bg-purple-500/10';
                case 'Trash2': return 'text-emerald-700 border-emerald-500/35 bg-emerald-500/10';
                default: return 'text-rose-700 border-rose-500/35 bg-rose-500/10';
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;

        // Định dạng tiền tệ hiển thị tinh tế
        const formattedPrice = Number(formData.price).toLocaleString('vi-VN') + 'đ';

        const newService = {
            id: `SVC-0${services.length + 1}`.padStart(7, '0'),
            name: formData.name,
            type: formData.type,
            price: formattedPrice,
            unit: formData.unit,
            iconType: formData.iconType,
            isActive: true
        };

        setServices([...services, newService]);
        setIsModalOpen(false);
        // Reset form
        setFormData({ name: '', type: 'Theo chỉ số công tơ', price: '', unit: 'kWh', iconType: 'Zap' });
    };

    return (
        <div className={`w-full h-full max-h-screen transition-colors duration-300 ${theme.bg} font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden relative`}>

            {/* KHỐI CỐ ĐỊNH PHÍA TRÊN */}
            <div className="shrink-0 mb-6">
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${theme.border} pb-6`}>
                    <div>
                        <span className={`text-[10px] tracking-[0.3em] ${theme.goldText} uppercase font-semibold flex items-center gap-1.5`}>
                            <Sparkles size={10} className={`${theme.goldText}`} /> Cấu hình định mức hệ thống saas
                        </span>
                        <h1 className={`text-xl font-light tracking-wide ${theme.title} mt-0.5`}>Thiết Lập Biểu Phí Dịch Vụ</h1>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`flex items-center justify-center gap-1.5 ${isDarkMode ? 'text-black bg-gradient-to-r from-[#A98446] to-[#D4AF37]' : 'text-white bg-gradient-to-r from-[#8A6212] to-[#D4AF37] hover:brightness-105'} text-[11px] font-bold px-4 py-2.5 rounded-sm transition-all uppercase tracking-wider whitespace-nowrap`}
                    >
                        <Plus size={14} /> Thêm Dịch Vụ Mới
                    </button>
                </div>
            </div>

            {/* DANH SÁCH DỊCH VỤ (SCROLLABLE AREA) */}
            <div className="flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-[#3E404C] scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {services.map((svc) => (
                        <div
                            key={svc.id}
                            className={`${theme.panel} border rounded-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl ${svc.isActive ? 'hover:border-[#414352]' : 'opacity-60'}`}
                        >
                            <div className={`p-5 border-b ${theme.border}/50 flex justify-between items-start gap-4`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-sm border shrink-0 ${getServiceColor(svc.iconType, isDarkMode)}`}>
                                        {getServiceIcon(svc.iconType)}
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-mono ${theme.textMuted} block tracking-wider`}>{svc.id}</span>
                                        <h3 className={`text-sm font-medium ${theme.title} ${theme.goldTextGroupHover} transition-colors mt-0.5`}>{svc.name}</h3>
                                    </div>
                                </div>

                                <button onClick={() => toggleServiceStatus(svc.id)} className={`${theme.textMuted} ${theme.goldTextHover} transition-colors`}>
                                    {svc.isActive ? <ToggleRight size={26} className={isDarkMode ? 'text-[#C5A880]' : 'text-[#8A6212]'} /> : <ToggleLeft size={26} className="text-[#5A5C66]" />}
                                </button>
                            </div>

                            <div className={`p-5 ${theme.subBg} space-y-3 text-xs flex-1`}>
                                <div className="flex justify-between items-center">
                                    <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Phương thức tính</span>
                                    <span className={`${theme.textMainSoft} font-light`}>{svc.type}</span>
                                </div>
                                <div className={`flex justify-between items-baseline pt-2 border-t ${theme.border}/30`}>
                                    <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Đơn giá áp dụng</span>
                                    <div className="text-right">
                                        <span className={`text-xl font-normal ${theme.priceText} font-mono`}>{svc.price}</span>
                                        <span className={`text-[11px] ${theme.textMuted} font-sans ml-1`}>/ {svc.unit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-3 ${theme.cardFooterBg} border-t flex justify-between items-center text-[11px] tracking-wider`}>
                                <span className={`text-[10px] ${theme.textMutedSoft} uppercase font-mono px-2`}>{svc.isActive ? '● Đang kích hoạt' : '○ Tạm ngưng'}</span>
                                <div className="flex gap-1.5">
                                    <button className={`flex items-center justify-center gap-1 ${theme.buttonOutline} font-semibold uppercase px-3 py-1.5 rounded-sm text-[10px] tracking-widest`}><Edit3 size={11} /> Chỉnh sửa</button>
                                    <button className={`flex items-center justify-center gap-1 ${theme.buttonActionBg} p-1.5 rounded-sm`}><Settings2 size={13} /></button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* DẠNG THẺ KHỞI TẠO NHANH KÍCH HOẠT MODAL */}
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className={`border border-dashed ${theme.emptyAddBg} rounded-sm p-6 flex flex-col items-center justify-center text-center min-h-[190px] transition-all cursor-pointer group`}
                    >
                        <div className={`p-3 ${theme.input} border ${theme.goldText} rounded-full mb-3 group-hover:scale-105 transition-transform`}>
                            <Plus size={20} />
                        </div>
                        <h4 className={`text-xs font-medium ${theme.title} tracking-wide uppercase`}>Khởi tạo biểu phí mới</h4>
                        <p className={`text-[10px] ${theme.textMutedSoft} mt-1 max-w-[200px] font-light`}>Tạo thêm các dịch vụ bổ sung như phí xe máy, máy giặt, bảo vệ...</p>
                    </div>
                </div>
            </div>

            {/* --- LUXURY MODAL FORM: THÊM DỊCH VỤ MỚI --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-md w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>

                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${theme.goldBg} animate-pulse`}></div>
                                <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>Cấu HÌnh Danh Mục Biểu Phí</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Tên gọi dịch vụ *</label>
                                <input
                                    type="text" required placeholder="Ví dụ: Phí gửi xe máy, Phí vệ sinh..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                />
                            </div>

                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Phương thức tính doanh thu</label>
                                <div className="relative">
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} appearance-none cursor-pointer`}
                                    >
                                        <option value="Theo chỉ số công tơ">Theo chỉ số công tơ (Điện, Nước)</option>
                                        <option value="Cố định theo phòng">Cố định theo phòng / căn hộ</option>
                                        <option value="Cố định theo người">Cố định theo nhân khẩu (người)</option>
                                    </select>
                                    <Layers size={12} className={`absolute right-3 top-3 ${theme.textMutedSoft} pointer-events-none`} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Đơn giá (VND) *</label>
                                    <div className="relative">
                                        <input
                                            type="number" required placeholder="3500, 100000..."
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-8 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                        />
                                        <DollarSign size={13} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Đơn vị đo lường</label>
                                    <input
                                        type="text" placeholder="kWh, khối, phòng/tháng..."
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Biểu tượng nhận diện</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { key: 'Zap', icon: <Zap size={14} /> },
                                        { key: 'Droplet', icon: <Droplet size={14} /> },
                                        { key: 'Wifi', icon: <Wifi size={14} /> },
                                        { key: 'Trash2', icon: <Trash2 size={14} /> },
                                        { key: 'ShieldCheck', icon: <ShieldCheck size={14} /> },
                                    ].map((ico) => (
                                        <button
                                            key={ico.key} type="button"
                                            onClick={() => setFormData({ ...formData, iconType: ico.key })}
                                            className={`py-2.5 flex items-center justify-center border transition-all rounded-sm ${formData.iconType === ico.key ? (isDarkMode ? 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]' : 'bg-[#8A6212]/10 border-[#8A6212] text-[#8A6212]') : theme.buttonActionBg}`}
                                        >
                                            {ico.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-[#2C2D35] mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 text-xs font-semibold tracking-wider ${theme.textMuted} ${theme.textMutedHover} uppercase transition-colors`}>Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase transition-all">Áp Dụng Định Mức</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}