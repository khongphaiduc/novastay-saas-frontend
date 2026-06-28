import React, { useState, useEffect } from 'react';
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
    DollarSign,
    Building2,
    Check,
    AlertTriangle,
    Search
} from 'lucide-react';
import { getProperties, getPropertyServices, createPropertyService, updatePropertyService } from '../api/propertyApi';

const initialServices = [
    { id: 'SVC-001', name: 'Tiền Điện', type: 'Theo chỉ số công tơ', price: '3,500đ', unit: 'kWh', iconType: 'Zap', isActive: true },
    { id: 'SVC-002', name: 'Tiền Nước (Mặc định)', type: 'Cố định theo người', price: '100,000đ', unit: 'người / tháng', iconType: 'Droplet', isActive: true },
    { id: 'SVC-003', name: 'Mạng Internet / Wifi', type: 'Cố định theo phòng', price: '100,000đ', unit: 'phòng / tháng', iconType: 'Wifi', isActive: true },
    { id: 'SVC-004', name: 'Thu gom rác & Vệ sinh', type: 'Cố định theo phòng', price: '50,000đ', unit: 'phòng / tháng', iconType: 'Trash2', isActive: true },
];

function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = type === 'success'
        ? 'bg-[#101B15] border-[#1C3E2D] text-[#4ADE80]'
        : 'bg-[#1C1215] border-[#4E1E23] text-[#F87171]';

    return (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-md border shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${bgClass}`}>
            {type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span className="text-xs font-semibold tracking-wide">{message}</span>
            <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
                <X size={14} />
            </button>
        </div>
    );
}

const mapApiServicesToUI = (apiServices) => {
    if (!apiServices || !Array.isArray(apiServices)) return [];
    return apiServices.map(item => {
        let iconType = 'ShieldCheck';
        if (item.serviceCode === 'ELECTRICITY') iconType = 'Zap';
        else if (item.serviceCode === 'WATER') iconType = 'Droplet';
        else if (item.serviceCode === 'INTERNET') iconType = 'Wifi';
        else if (item.serviceCode === 'TRASH') iconType = 'Trash2';

        let typeText = item.billingCycle === 'PerUse' ? 'Theo lần sử dụng (PerUse)' : 'Theo tháng (Monthly)';

        const priceFormatted = item.defaultPrice !== undefined && item.defaultPrice !== null
            ? Number(item.defaultPrice).toLocaleString('vi-VN') + 'đ'
            : '0đ';

        return {
            id: item.id || `SVC-${Math.random().toString(36).substr(2, 9)}`,
            name: item.serviceName || 'Dịch vụ',
            type: typeText,
            price: priceFormatted,
            unit: item.unit || 'lần',
            iconType: iconType,
            isActive: item.isActive ?? true,
            rawPrice: item.defaultPrice ?? 0,
            serviceCode: item.serviceCode || 'OTHER',
            billingCycle: item.billingCycle || 'Monthly',
            description: item.description || ''
        };
    });
};

function ServiceSkeleton() {
    return (
        <div className="bg-[#16171E] border border-[#2C2D35] rounded-sm p-5 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1F212A] rounded-sm animate-pulse" />
                <div className="space-y-2 flex-1">
                    <div className="h-3 bg-[#1F212A] rounded w-16" />
                    <div className="h-4 bg-[#1F212A] rounded w-28" />
                </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-[#2C2D35]/30">
                <div className="h-3 bg-[#1F212A] rounded w-full" />
                <div className="h-3 bg-[#1F212A] rounded w-3/4" />
            </div>
        </div>
    );
}

export default function ServiceSetupSubPage({ isDarkMode = true }) {
    const [services, setServices] = useState(initialServices);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Search state & debounce
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Property Selection State
    const [properties, setProperties] = useState([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);

    // State quản lý form
    const [formData, setFormData] = useState({
        name: '',
        type: 'Monthly',
        price: '',
        unit: 'kWh',
        iconType: 'Zap'
    });

    const handleStartEdit = (svc) => {
        setEditingService(svc);
        setFormData({
            name: svc.name,
            type: svc.billingCycle || 'Monthly',
            price: svc.rawPrice !== undefined ? svc.rawPrice.toString() : '',
            unit: svc.unit,
            iconType: svc.iconType
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
        setFormData({ name: '', type: 'Monthly', price: '', unit: 'kWh', iconType: 'Zap' });
    };

    useEffect(() => {
        let active = true;
        async function fetchProps() {
            setLoadingProperties(true);
            try {
                let orgId = '';
                try {
                    const accountStr = localStorage.getItem('ns_account');
                    if (accountStr) {
                        orgId = JSON.parse(accountStr).organizationId || '';
                    }
                } catch (e) {
                    console.error('Error parsing ns_account in ServiceSetupSubPage', e);
                }

                if (!orgId) {
                    orgId = 'A31BFED6-AB82-44AC-9BD1-91A5C8FCE4BB';
                }

                const data = await getProperties(orgId);
                if (active) {
                    const propsList = data?.items || data || [];
                    setProperties(propsList);
                    if (propsList.length > 0) {
                        setSelectedPropertyId(propsList[0].id);
                    }
                }
            } catch (err) {
                console.error('Lỗi tải danh sách cơ sở:', err);
            } finally {
                if (active) {
                    setLoadingProperties(false);
                }
            }
        }
        fetchProps();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedPropertyId) return;
        let active = true;
        async function fetchServices() {
            setLoadingServices(true);
            try {
                let orgId = '';
                try {
                    const accountStr = localStorage.getItem('ns_account');
                    if (active && accountStr) {
                        orgId = JSON.parse(accountStr).organizationId || '';
                    }
                } catch (e) {
                    console.error('Error parsing ns_account in ServiceSetupSubPage', e);
                }

                if (!orgId) {
                    orgId = 'A31BFED6-AB82-44AC-9BD1-91A5C8FCE4BB';
                }

                const data = await getPropertyServices(orgId, selectedPropertyId, debouncedSearchTerm);
                if (active) {
                    setServices(mapApiServicesToUI(data));
                }
            } catch (err) {
                console.error('Lỗi tải danh sách dịch vụ:', err);
            } finally {
                if (active) {
                    setLoadingServices(false);
                }
            }
        }
        fetchServices();
        return () => {
            active = false;
        };
    }, [selectedPropertyId, debouncedSearchTerm]);

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    const theme = isDarkMode ? {
        bg: 'bg-[#0F1016] text-[#E4E6EB]',
        panel: 'bg-[#16171E] border-[#2C2D35]',
        input: 'bg-[#1F212A] border-[#2C2D35] text-white placeholder-[#5A5C66]',
        textMuted: 'text-[#A0A2B1]',
        textMutedSoft: 'text-[#818494]',
        title: 'text-white',
        border: 'border-[#2C2D35]',
        subBg: 'bg-[#0F1016] border-[#2C2D35]/60',
        textMainSoft: 'text-[#E4E6EB]',
        buttonOutline: 'text-[#C9CBD3] hover:text-white bg-[#1F212A] border-[#2C2D35]',
        buttonActionBg: 'bg-[#1F212A] border-[#2C2D35] text-[#A0A2B1] hover:text-white',
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
        textMuted: 'text-slate-600',
        textMutedSoft: 'text-slate-500',
        title: 'text-slate-950',
        border: 'border-[#E5D4AD]',
        subBg: 'bg-[#FFF9EC] border-[#E5D4AD]',
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

    const toggleServiceStatus = async (svc) => {
        let orgId = '';
        try {
            const accountStr = localStorage.getItem('ns_account');
            if (accountStr) {
                orgId = JSON.parse(accountStr).organizationId || '';
            }
        } catch (e) {
            console.error('Error parsing ns_account in ServiceSetupSubPage', e);
        }

        if (!orgId) {
            orgId = 'A31BFED6-AB82-44AC-9BD1-91A5C8FCE4BB';
        }

        const newStatus = !svc.isActive;
        // Optimistic UI update
        setServices(prev => prev.map(s => s.id === svc.id ? { ...s, isActive: newStatus } : s));

        try {
            const updatePayload = {
                DefaultPrice: svc.rawPrice,
                IsActive: newStatus,
                BillingCycle: svc.billingCycle || 'Monthly'
            };
            await updatePropertyService(orgId, selectedPropertyId, svc.id, updatePayload);
            showToast(`Đã ${newStatus ? 'kích hoạt' : 'tạm ngưng'} dịch vụ thành công!`, 'success');

            // Reload services list to ensure sync
            const updatedData = await getPropertyServices(orgId, selectedPropertyId, debouncedSearchTerm);
            setServices(mapApiServicesToUI(updatedData));
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái dịch vụ:', err);
            // Revert state on error
            setServices(prev => prev.map(s => s.id === svc.id ? { ...s, isActive: svc.isActive } : s));
            showToast(err.message || 'Lỗi khi cập nhật trạng thái dịch vụ', 'error');
        }
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
                case 'Zap': return 'text-amber-400 border-amber-500/30 bg-amber-500/15';
                case 'Droplet': return 'text-blue-400 border-blue-500/30 bg-blue-500/15';
                case 'Wifi': return 'text-purple-400 border-purple-500/30 bg-purple-500/15';
                case 'Trash2': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15';
                default: return 'text-rose-400 border-rose-500/30 bg-rose-500/15';
            }
        } else {
            switch (iconType) {
                case 'Zap': return 'text-amber-700 border-amber-500/40 bg-amber-500/20';
                case 'Droplet': return 'text-blue-700 border-blue-500/40 bg-blue-500/20';
                case 'Wifi': return 'text-purple-700 border-purple-500/40 bg-purple-500/20';
                case 'Trash2': return 'text-emerald-700 border-emerald-500/40 bg-emerald-500/20';
                default: return 'text-rose-700 border-rose-500/40 bg-rose-500/20';
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !selectedPropertyId) return;

        let orgId = '';
        try {
            const accountStr = localStorage.getItem('ns_account');
            if (accountStr) {
                orgId = JSON.parse(accountStr).organizationId || '';
            }
        } catch (e) {
            console.error('Error parsing ns_account in ServiceSetupSubPage', e);
        }

        if (!orgId) {
            orgId = 'A31BFED6-AB82-44AC-9BD1-91A5C8FCE4BB';
        }

        // Determine service code based on name if new
        let serviceCode = 'OTHER';
        const nameLower = formData.name.toLowerCase();
        if (nameLower.includes('điện') || nameLower.includes('electricity')) {
            serviceCode = 'ELECTRICITY';
        } else if (nameLower.includes('nước') || nameLower.includes('water')) {
            serviceCode = 'WATER';
        } else if (nameLower.includes('internet') || nameLower.includes('wifi')) {
            serviceCode = 'INTERNET';
        } else if (nameLower.includes('rác') || nameLower.includes('trash')) {
            serviceCode = 'TRASH';
        } else if (nameLower.includes('xe') || nameLower.includes('parking')) {
            serviceCode = 'PARKING';
        } else if (nameLower.includes('điều hòa') || nameLower.includes('air')) {
            serviceCode = 'AIR_CONDITIONER';
        } else if (nameLower.includes('dọn phòng') || nameLower.includes('cleaning')) {
            serviceCode = 'CLEANING';
        } else if (nameLower.includes('giặt') || nameLower.includes('laundry')) {
            serviceCode = 'LAUNDRY';
        } else if (nameLower.includes('quản lý') || nameLower.includes('management')) {
            serviceCode = 'MANAGEMENT';
        } else {
            // Generate a simple uppercase code from name
            serviceCode = formData.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '_')
                .toUpperCase()
                .substring(0, 15);
            if (!serviceCode) serviceCode = 'OTHER';
        }

        const billingCycle = formData.type;

        try {
            if (editingService) {
                const updatePayload = {
                    DefaultPrice: Number(formData.price),
                    IsActive: editingService.isActive,
                    BillingCycle: billingCycle
                };
                await updatePropertyService(orgId, selectedPropertyId, editingService.id, updatePayload);
                showToast('Cập nhật biểu phí dịch vụ thành công!', 'success');
            } else {
                const createPayload = {
                    serviceName: formData.name,
                    serviceCode: serviceCode,
                    description: `Phí ${formData.name}`,
                    defaultPrice: Number(formData.price),
                    unit: formData.unit,
                    billingCycle: billingCycle,
                    isActive: true
                };
                await createPropertyService(orgId, selectedPropertyId, createPayload);
                showToast('Khởi tạo biểu phí mới thành công!', 'success');
            }

            // Reload services list
            const updatedData = await getPropertyServices(orgId, selectedPropertyId, debouncedSearchTerm);
            setServices(mapApiServicesToUI(updatedData));

            handleCloseModal();
        } catch (err) {
            console.error('Lỗi khi lưu dịch vụ:', err);
            showToast(err.message || 'Lỗi khi lưu thông tin dịch vụ', 'error');
        }
    };

    return (
        <div className={`w-full h-full max-h-screen transition-colors duration-300 ${theme.bg} font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden relative`}>

            {/* KHỐI CỐ ĐỊNH PHÍA TRÊN */}
            <div className="shrink-0 mb-6">
                <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b ${theme.border} pb-6`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1 w-full">
                        <div>
                            <span className={`text-[10px] tracking-[0.3em] ${theme.goldText} uppercase font-semibold flex items-center gap-1.5`}>
                                <Sparkles size={10} className={`${theme.goldText}`} /> Cấu hình định mức hệ thống saas
                            </span>
                            <h1 className={`text-xl font-light tracking-wide ${theme.title} mt-0.5`}>Thiết Lập Biểu Phí Dịch Vụ</h1>
                        </div>

                        {/* Property Selector */}
                        <div className="flex flex-col gap-1 md:border-l md:border-[#2C2D35]/50 md:pl-6 flex-1 max-w-md w-full">
                            <div className="flex items-center gap-2">
                                <Building2 size={13} className={`${theme.goldText}`} />
                                <span className={`text-[10px] ${theme.textMutedSoft} uppercase tracking-widest font-semibold`}>Cơ sở hoạt động</span>
                            </div>
                            <div className="relative w-full">
                                <select
                                    value={selectedPropertyId}
                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                    className={`w-full ${theme.input} border text-xs px-3 py-2 pr-8 rounded-sm focus:outline-none focus:border-[#C5A880] transition-all appearance-none cursor-pointer font-medium shadow-sm`}
                                >
                                    {loadingProperties ? (
                                        <option>Đang tải danh sách cơ sở...</option>
                                    ) : properties.length === 0 ? (
                                        <option>Không tìm thấy cơ sở nào</option>
                                    ) : (
                                        properties.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.propertyName}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                                    <svg className={`w-3.5 h-3.5 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                            {selectedProperty && (
                                <div className="flex items-center gap-2 text-[10px] mt-1 font-mono">
                                    <span className={`${theme.textMuted}`}>{selectedProperty.address}</span>
                                    <span className={`px-1.5 py-0.5 rounded-sm bg-[#C5A880]/15 ${theme.goldText} text-[8px] uppercase tracking-wider font-bold`}>
                                        {selectedProperty.propertyType}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="flex flex-col gap-1 md:border-l md:border-[#2C2D35]/50 md:pl-6 max-w-xs w-full">
                            <div className="flex items-center gap-2">
                                <Search size={13} className={`${theme.goldText}`} />
                                <span className={`text-[10px] ${theme.textMutedSoft} uppercase tracking-widest font-semibold`}>Tìm kiếm dịch vụ</span>
                            </div>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên dịch vụ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full ${theme.input} border text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A880] transition-all font-medium shadow-sm`}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`flex items-center justify-center gap-1.5 ${isDarkMode ? 'text-black bg-gradient-to-r from-[#A98446] to-[#D4AF37]' : 'text-white bg-gradient-to-r from-[#8A6212] to-[#D4AF37] hover:brightness-105'} text-[11px] font-bold px-4 py-2.5 rounded-sm transition-all uppercase tracking-wider whitespace-nowrap self-stretch sm:self-auto`}
                    >
                        <Plus size={14} /> Thêm Dịch Vụ Mới
                    </button>
                </div>
            </div>

            {/* DANH SÁCH DỊCH VỤ (SCROLLABLE AREA) */}
            <div className="flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-[#3E404C] scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loadingServices ? (
                        Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
                    ) : services.length > 0 ? (
                        services.map((svc) => (
                            <div
                                key={svc.id}
                                className={`${theme.panel} border rounded-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-md hover:shadow-xl ${svc.isActive ? 'hover:border-[#C5A880]/60' : 'opacity-60'}`}
                            >
                                {/* Glowing accent lines */}
                                {svc.isActive && (
                                    <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                )}

                                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                    {/* Header Row */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg border shrink-0 transition-transform group-hover:scale-105 ${getServiceColor(svc.iconType, isDarkMode)}`}>
                                                {getServiceIcon(svc.iconType)}
                                            </div>
                                            <div>
                                                <h3 className={`text-base font-semibold ${theme.title} group-hover:text-[#C5A880] transition-colors line-clamp-1`}>
                                                    {svc.name}
                                                </h3>
                                                <span className={`text-[9px] font-mono ${theme.textMutedSoft} uppercase tracking-wider block mt-0.5`}>
                                                    {svc.id.substring(0, 8)}
                                                </span>
                                            </div>
                                        </div>

                                        <button onClick={() => toggleServiceStatus(svc)} className={`${theme.textMuted} ${theme.goldTextHover} transition-all duration-300`}>
                                            {svc.isActive ? <ToggleRight size={28} className={isDarkMode ? 'text-[#C5A880]' : 'text-[#8A6212]'} /> : <ToggleLeft size={28} className="text-[#5A5C66]" />}
                                        </button>
                                    </div>

                                    {/* Price and Calculation Area */}
                                    <div className={`p-4 rounded-lg ${theme.subBg} border ${theme.border}/40 space-y-3`}>
                                        <div className="flex flex-col">
                                            <span className={`${theme.textMutedSoft} uppercase tracking-widest text-[9px] font-semibold`}>Đơn giá áp dụng</span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className={`text-2xl font-bold ${theme.priceText} font-mono tracking-tight`}>
                                                    {svc.price}
                                                </span>
                                                <span className={`text-xs ${theme.textMuted} font-medium`}>
                                                    / {svc.unit}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`pt-2.5 border-t ${theme.border}/30 flex justify-between items-center text-[11px]`}>
                                            <span className={`${theme.textMutedSoft} font-medium`}>Phương thức:</span>
                                            <span className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] ${isDarkMode ? 'bg-[#1F212A] text-white border border-[#2C2D35]' : 'bg-[#FFF9EC] text-[#8A6212] border border-[#E5D4AD]'}`}>
                                                {svc.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Area */}
                                <div className={`p-3.5 ${theme.cardFooterBg} border-t flex justify-between items-center text-xs`}>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`h-1.5 w-1.5 rounded-full ${svc.isActive ? 'bg-[#56B37B] animate-pulse' : 'bg-[#5A5C66]'}`}></span>
                                        <span className={`text-[10px] ${theme.textMutedSoft} uppercase font-semibold font-mono tracking-wider`}>
                                            {svc.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStartEdit(svc)} className={`flex items-center justify-center gap-1 ${theme.buttonOutline} font-semibold uppercase px-3 py-1.5 rounded-md text-[10px] tracking-widest shadow-sm hover:scale-[1.02] transition-transform`}><Edit3 size={11} /> Sửa</button>
                                        <button className={`flex items-center justify-center gap-1 ${theme.buttonActionBg} p-1.5 rounded-md shadow-sm hover:scale-[1.02] transition-transform`}><Settings2 size={13} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center border border-dashed border-[#2C2D35] bg-[#16171E]/30 rounded-sm flex flex-col items-center justify-center min-h-[190px]">
                            <Building2 size={24} className="text-[#3E404C] mb-2" />
                            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Không tìm thấy dịch vụ nào</h4>
                            <p className="text-[10px] text-[#5A5C66] mt-1">Cơ sở này chưa cấu hình biểu phí dịch vụ nào.</p>
                        </div>
                    )}

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
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={handleCloseModal}></div>

                    <div className={`relative ${theme.modalBg} border max-w-md w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>

                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${theme.goldBg} animate-pulse`}></div>
                                <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>
                                    {editingService ? 'Cập Nhật Biểu Phí' : 'Cấu Hình Danh Mục Biểu Phí'}
                                </h3>
                            </div>
                            <button onClick={handleCloseModal} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
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
                                        <option value="Monthly">Theo tháng (Monthly)</option>
                                        <option value="PerUse">Theo lần sử dụng (PerUse)</option>
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
                                <button type="button" onClick={handleCloseModal} className={`px-4 py-2 text-xs font-semibold tracking-wider ${theme.textMuted} ${theme.textMutedHover} uppercase transition-colors`}>Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase transition-all">
                                    {editingService ? 'Lưu Thay Đổi' : 'Áp Dụng Định Mức'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}