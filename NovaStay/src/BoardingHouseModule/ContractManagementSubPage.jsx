import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, FileText, User, ChevronRight, Sparkles, Calendar, DollarSign,
    X, FileCheck, AlertCircle, History, Clock, Eye, Shield, Zap, Droplet,
    RefreshCw, CheckCircle, Loader2, Upload, Bell, MapPin
} from 'lucide-react';
import {
    getContracts, createContract, renewContract, terminateContract,
    uploadContractPdf, getExpiringSoonContracts, sendRenewalNotice
} from '../api/contractApi';
import { getProperties } from '../api/propertyApi';
import { getRooms } from '../api/roomApi';
import { getOrganizationResidents } from '../api/residentApi';

export default function ContractManagementSubPage({ isDarkMode = true }) {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expiringSoon, setExpiringSoon] = useState([]);
    const [showExpiring, setShowExpiring] = useState(false);
    
    // Pagination & View Mode
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContracts, setTotalContracts] = useState(0);
    const [viewMode, setViewMode] = useState('list'); // 'grid' | 'list'

    // States quản lý Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [renewData, setRenewData] = useState({ newEndDate: '', newDepositAmount: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    // Dữ liệu options cho dropdown Khởi tạo
    const [propertiesList, setPropertiesList] = useState([]);
    const [roomsList, setRoomsList] = useState([]);
    const [residentsList, setResidentsList] = useState([]);
    const [isFetchingOptions, setIsFetchingOptions] = useState(false);

    // State quản lý form tạo hợp đồng mới
    const [formData, setFormData] = useState({
        residentId: '',
        roomId: '',
        propertyId: '',
        depositAmount: '',
        startDate: '',
        endDate: ''
    });

    const getAccountInfo = () => {
        try {
            const s = localStorage.getItem('ns_account');
            return s ? JSON.parse(s) : {};
        } catch { return {}; }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const mapStatusVI = (status) => {
        switch (status) {
            case 'Active': return 'Còn hiệu lực';
            case 'Terminated': return 'Đã thanh lý';
            case 'Renewed': return 'Đã gia hạn';
            default:
                if (!status) return 'N/A';
                return status;
        }
    };

    const mapContractStatus = (contract) => {
        if (contract.status === 'Terminated') return 'Đã thanh lý';
        if (contract.status !== 'Active') return contract.status;
        const days = contract.daysUntilExpiry;
        if (days < 0) return 'Quá hạn / Chờ gia hạn';
        if (days <= 30) return 'Sắp hết hạn';
        return 'Còn hiệu lực';
    };

    const fetchContracts = useCallback(async (currentPage = 1) => {
        setLoading(true);
        setError('');
        try {
            const { organizationId } = getAccountInfo();
            if (!organizationId) throw new Error('Không tìm thấy thông tin tổ chức');
            const data = await getContracts({ 
                organizationId, 
                pageIndex: currentPage, 
                pageSize: 10,
                search: searchTerm,
                status: statusFilter !== 'All' ? statusFilter : ''
            });
            setContracts(data?.items || []);
            setTotalPages(data?.totalPages || 1);
            setTotalContracts(data?.totalCount || 0);
            setPage(currentPage);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => { 
        const timer = setTimeout(() => fetchContracts(1), 350);
        return () => clearTimeout(timer);
    }, [fetchContracts]);

    const openCreateModal = async () => {
        setIsCreateModalOpen(true);
        setIsFetchingOptions(true);
        try {
            const { organizationId } = getAccountInfo();
            if (!organizationId) return;

            const [props, resids] = await Promise.all([
                getProperties(organizationId).catch(() => []),
                getOrganizationResidents(organizationId).catch(() => [])
            ]);

            setPropertiesList(props?.items || props?.data || props || []);
            setResidentsList(resids?.data || resids?.items || resids?.residents || resids || []);
        } catch (err) {
            console.error('Error fetching options', err);
        } finally {
            setIsFetchingOptions(false);
        }
    };

    const handlePropertyChange = async (propId) => {
        setFormData(prev => ({ ...prev, propertyId: propId, roomId: '' }));
        setRoomsList([]);
        if (!propId) return;
        try {
            const rooms = await getRooms({ propertyId: propId });
            setRoomsList(rooms?.items || rooms?.data || rooms || []);
        } catch (err) {
            console.error('Error fetching rooms', err);
        }
    };


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
        buttonOutline: 'text-[#C9CBD3] bg-[#1F212A] border border-[#2C2D35] hover:text-white hover:border-[#C5A880]',
        modalBg: 'bg-[#16171E] border-[#3E3F4A]',
        modalInput: 'bg-[#1F212A] border-[#2C2D35] text-white focus:border-[#C5A880]',
        cardFooterBg: 'bg-[#1B1C24] border-[#2C2D35]',
        emptyBg: 'bg-[#16171E] border-[#2C2D35]',
        cardIdle: 'bg-[#1F212A] border-[#2C2D35] text-[#8A8D98] hover:text-white',
        cardActive: 'bg-[#C5A880]/10 border-[#C5A880] text-[#C5A880]',
        certDetailsBg: 'bg-[#1F212A]/60 border-[#2C2D35]',
        certDetailsSubBg: 'bg-[#12131A] border-[#2C2D35]/60',
        divider: 'border-[#2C2D35]/60',
        goldText: 'text-[#C5A880]',
        goldBg: 'bg-[#C5A880]',
        goldBorder: 'border-[#C5A880]',
        goldFocus: 'focus:border-[#C5A880]',
        goldTextHover: 'hover:text-[#C5A880]',
        goldTextGroupHover: 'group-hover:text-[#C5A880]',
        textMutedHover: 'hover:text-white',
        priceText: 'text-[#EAD0A8]',
        certAlertBg: 'bg-[#2D1B1B]/30 border-[#522525]/40 text-[#E05252]'
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
        buttonOutline: 'text-slate-600 bg-[#FFF9EC] border border-[#E5D4AD] hover:text-slate-950 hover:border-[#A98446]',
        modalBg: 'bg-white border-[#E5D4AD]',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]',
        cardFooterBg: 'bg-[#FFFDF9] border-[#E5D4AD]',
        emptyBg: 'bg-white border-[#E5D4AD]',
        cardIdle: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-600 hover:text-slate-950',
        cardActive: 'bg-[#FFF1C7] border-[#D4AF37] text-[#8A6212]',
        certDetailsBg: 'bg-[#FFF9EC]/80 border-[#E5D4AD]',
        certDetailsSubBg: 'bg-white border-[#E5D4AD]/60',
        divider: 'border-[#E5D4AD]/60',
        goldText: 'text-[#8A6212]',
        goldBg: 'bg-[#8A6212]',
        goldBorder: 'border-[#D4AF37]',
        goldFocus: 'focus:border-[#D4AF37]',
        goldTextHover: 'hover:text-[#8A6212]',
        goldTextGroupHover: 'group-hover:text-[#8A6212]',
        textMutedHover: 'hover:text-slate-950',
        priceText: 'text-[#8A6212]',
        certAlertBg: 'bg-red-50 border-red-200 text-red-700'
    };

    const filteredContracts = contracts.filter(ctr => {
        const statusVI = mapContractStatus(ctr);
        const matchesSearch = !searchTerm || [
            ctr.residentName, ctr.roomNumber, ctr.id
        ].some(f => f && f.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || statusVI === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        if (isDarkMode) {
            switch (status) {
                case 'Còn hiệu lực': return 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]';
                case 'Sắp hết hạn': return 'bg-[#312519] text-[#C5A880] border-[#523F26]';
                case 'Quá hạn / Chờ gia hạn': return 'bg-[#2D1B1B] text-[#E05252] border-[#522525]';
                default: return 'bg-[#1F212A] text-[#8A8D98] border-[#2C2D35]';
            }
        } else {
            switch (status) {
                case 'Còn hiệu lực': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                case 'Sắp hết hạn': return 'bg-amber-50 text-amber-700 border-amber-200';
                case 'Quá hạn / Chờ gia hạn': return 'bg-red-50 text-red-600 border-red-200';
                default: return 'bg-slate-50 text-slate-600 border-slate-200';
            }
        }
    };

    // TASK-031: Tạo hợp đồng
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { organizationId, propertyId } = getAccountInfo();
            await createContract({
                organizationId,
                propertyId: formData.propertyId || propertyId,
                roomId: formData.roomId,
                residentId: formData.residentId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                depositAmount: Number(formData.depositAmount),
            });
            showToast('Tạo hợp đồng thành công!', 'success');
            setIsCreateModalOpen(false);
            setFormData({ residentId: '', roomId: '', propertyId: '', depositAmount: '', startDate: '', endDate: '' });
            fetchContracts();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // TASK-033: Gia hạn hợp đồng
    const handleRenew = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await renewContract(selectedContract.id, {
                newEndDate: renewData.newEndDate,
                newDepositAmount: renewData.newDepositAmount ? Number(renewData.newDepositAmount) : undefined
            });
            showToast('Gia hạn hợp đồng thành công!', 'success');
            setIsRenewModalOpen(false);
            setSelectedContract(null);
            fetchContracts();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // TASK-034: Thanh lý hợp đồng
    const handleTerminate = async () => {
        if (!window.confirm('Xác nhận thanh lý hợp đồng này?')) return;
        setIsSubmitting(true);
        try {
            await terminateContract(selectedContract.id, { newRoomStatus: 'Available' });
            showToast('Thanh lý hợp đồng thành công!', 'success');
            setSelectedContract(null);
            fetchContracts();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendRenewalNotice = async (contractId) => {
        try {
            await sendRenewalNotice(contractId);
            showToast('Gửi thông báo nhắc nhở gia hạn thành công!', 'success');
        } catch (err) {
            showToast(err.message || 'Lỗi khi gửi thông báo nhắc nhở', 'error');
        }
    };

    // TASK-035: Upload PDF hợp đồng
    const handleUploadPdf = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPdf(true);
        try {
            const updated = await uploadContractPdf(selectedContract.id, file);
            setSelectedContract(updated);
            showToast('Upload file hợp đồng thành công!', 'success');
            fetchContracts();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setUploadingPdf(false);
        }
    };

    const fmtDate = (d) => {
        if (!d) return 'N/A';
        try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
    };
    const fmtMoney = (n) => {
        if (n == null) return 'N/A';
        return Number(n).toLocaleString('vi-VN') + 'đ';
    };



    return (
        <div className={`w-full h-full max-h-screen transition-colors duration-300 ${theme.bg} font-sans antialiased p-6 lg:p-8 flex flex-col overflow-hidden relative`}>

            {/* KHỐI CỐ ĐỊNH PHÍA TRÊN */}
            <div className="shrink-0">
                {/* CONTROL BAR */}
                <div className={`${theme.panel} border rounded-sm p-4 mb-6`}>
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Thanh tìm kiếm nhanh */}
                        <div className="relative w-full lg:w-80">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm mã hợp đồng, khách thuê, số phòng..."
                                className={`w-full ${theme.input} border text-xs px-3 py-2.5 pl-9 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                            />
                            <Search size={14} className={`absolute left-3 top-3 ${theme.textMutedSoft}`} />
                        </div>

                        {/* Bộ lọc trạng thái pháp lý và nút Thêm mới */}
                        <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
                            {/* View Toggle */}
                            <div className={`flex items-center ${theme.input} p-1 rounded-sm shrink-0`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? theme.cardActive : theme.cardIdle}`}
                                    title="Lưới"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? theme.cardActive : theme.cardIdle}`}
                                    title="Danh sách"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
                                {['All', 'Còn hiệu lực', 'Sắp hết hạn', 'Quá hạn / Chờ gia hạn'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 text-[10px] tracking-wider font-semibold border transition-all rounded-sm uppercase whitespace-nowrap ${statusFilter === status ? theme.cardActive : theme.cardIdle}`}
                                    >
                                        {status === 'All' ? 'Tất cả' : status === 'Sắp hết hạn' ? 'Sắp hết hạn' : status === 'Còn hiệu lực' ? 'Còn hạn' : 'Quá hạn'}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={openCreateModal}
                                disabled={isFetchingOptions}
                                className={`flex items-center justify-center gap-1.5 ${isDarkMode ? 'bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black' : 'bg-gradient-to-r from-[#8A6212] to-[#D4AF37] text-white hover:brightness-105'} text-[11px] font-bold px-4 py-2 rounded-sm transition-all uppercase tracking-wider whitespace-nowrap h-[32px] disabled:opacity-50`}
                            >
                                {isFetchingOptions ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Khởi Tạo Hợp Đồng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={28} className={`animate-spin ${theme.goldText}`} />
                </div>
            )}
            {!loading && error && (
                <div className={`flex-1 flex flex-col items-center justify-center gap-3 ${theme.textMuted}`}>
                    <AlertCircle size={28} className="text-red-400" />
                    <p className="text-xs">{error}</p>
                    <button onClick={fetchContracts} className={`text-[10px] uppercase font-semibold ${theme.goldText} flex items-center gap-1`}><RefreshCw size={12} />Thử lại</button>
                </div>
            )}

            {/* VÙNG CUỘN HIỂN THỊ DANH SÁCH HỢP ĐỒNG */}
            {!loading && !error && (
            <div className="flex-1 overflow-y-scroll pr-1 pb-4 min-h-[200px] scrollbar-thin scrollbar-thumb-[#3E404C] scrollbar-track-transparent">

                {filteredContracts.length > 0 ? (
                    <>
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {filteredContracts.map((ctr) => {
                                const statusVI = mapContractStatus(ctr);
                                
                                if (viewMode === 'list') {
                                    return (
                                        <div key={ctr.id} className={`${theme.panel} border hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-row items-center justify-between p-4 group shadow-md`}>
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="flex flex-col min-w-[120px]">
                                                    <span className={`text-[10px] font-mono ${theme.textMuted} block tracking-wider`}>{ctr.id?.toString().substring(0, 8).toUpperCase() || 'N/A'}</span>
                                                    <h3 className={`text-base font-light tracking-wide ${theme.title} ${theme.goldTextGroupHover} transition-colors mt-0.5`}>Phòng {ctr.roomNumber || 'N/A'}</h3>
                                                </div>

                                                <div className="flex items-center gap-1.5 min-w-[150px]">
                                                    <User size={14} className={`${theme.goldText}`} />
                                                    <span className={`text-xs ${theme.title} font-medium`}>{ctr.residentName || 'N/A'}</span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Giá thuê</span>
                                                    <span className={`text-xs font-mono ${theme.goldText}`}>{fmtMoney(ctr.basePrice)}</span>
                                                </div>

                                                <div className={`flex gap-4 text-[10px] ${theme.textMuted}`}>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} className={`${theme.textMuted}`} />
                                                        <span className={`${theme.title} font-light`}>{fmtDate(ctr.startDate)}</span>
                                                    </div>
                                                    <span className="text-gray-500">-</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} className={`${theme.textMuted}`} />
                                                        <span className={`${theme.title} font-light`}>{fmtDate(ctr.endDate)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0 pl-4">
                                                <span className={`px-2.5 py-1 text-[9px] tracking-wider uppercase font-medium border rounded-sm w-32 text-center ${getStatusStyle(statusVI)}`}>
                                                    {statusVI}
                                                </span>
                                                <button
                                                    onClick={() => setSelectedContract(ctr)}
                                                    className={`p-2 rounded-sm ${theme.textMuted} hover:text-[#5294E2] border border-[#2C2D35] hover:border-[#5294E2] bg-[#1F212A] transition-all`}
                                                    title="Chi tiết"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                <div key={ctr.id} className={`${theme.panel} border hover:border-[#414352] rounded-sm transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl`}>

                                    <div className={`p-5 border-b ${theme.border}/50`}>
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className={`text-[10px] font-mono ${theme.textMuted} block tracking-wider`}>{ctr.id?.toString().substring(0, 8).toUpperCase() || 'N/A'}</span>
                                                <h3 className={`text-base font-light tracking-wide ${theme.title} ${theme.goldTextGroupHover} transition-colors mt-0.5`}>Phòng {ctr.roomNumber || 'N/A'}</h3>
                                            </div>
                                            <span className={`px-2.5 py-0.5 text-[9px] tracking-wider uppercase font-medium border rounded-sm ${getStatusStyle(statusVI)}`}>
                                                {statusVI}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`p-5 ${theme.subBg} space-y-3 flex-1 text-xs`}>
                                        <div className="flex justify-between items-center">
                                            <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Khách hàng ký kết</span>
                                            <div className={`flex items-center gap-1.5 ${theme.title} font-medium`}>
                                                <User size={12} className={`${theme.goldText}`} />
                                                <span>{ctr.residentName || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Giá thuê định kỳ</span>
                                            <span className={`${theme.title} font-mono`}>{fmtMoney(ctr.basePrice)} <span className={`text-[10px] ${theme.textMutedSoft}`}>/ tháng</span></span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Tiền bảo cọc</span>
                                            <span className={`font-mono ${theme.goldText}`}>{fmtMoney(ctr.depositAmount)}</span>
                                        </div>

                                        <div className={`pt-3 mt-1 border-t ${theme.border}/30 grid grid-cols-2 gap-2 text-[11px] ${theme.textMuted}`}>
                                            <div>
                                                <span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Ngày hiệu lực</span>
                                                <div className={`flex items-center gap-1 ${theme.title} mt-0.5 font-light`}>
                                                    <Calendar size={11} className={`${theme.textMuted}`} /> {fmtDate(ctr.startDate)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Ngày đáo hạn</span>
                                                <div className={`flex items-center gap-1 ${theme.title} mt-0.5 font-light`}>
                                                    <Clock size={11} className={`${theme.textMuted}`} /> {fmtDate(ctr.endDate)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Khối Hành Động */}
                                    <div className={`p-3 ${theme.cardFooterBg} border-t flex gap-2 items-center text-[11px] tracking-wider`}>
                                        <div className="p-3 bg-black/20 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-12 right-0">
                                            {['Còn hiệu lực', 'Sắp hết hạn'].includes(statusVI) && (
                                                <button
                                                    onClick={() => handleSendRenewalNotice(ctr.id)}
                                                    className={`p-1.5 rounded-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors`}
                                                    title="Gửi nhắc nhở gia hạn"
                                                >
                                                    <Bell size={13} />
                                                </button>
                                            )}
                                            {['Còn hiệu lực', 'Sắp hết hạn'].includes(statusVI) && (
                                                <button
                                                    onClick={() => { setIsRenewModalOpen(true); setSelectedContract(ctr); }}
                                                    className={`p-1.5 rounded-sm bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors`}
                                                    title="Gia hạn hợp đồng"
                                                >
                                                    <Calendar size={13} />
                                                </button>
                                            )}
                                        </div>
                                        {ctr.contractPdfUrl && (
                                            <a href={ctr.contractPdfUrl} target="_blank" rel="noopener noreferrer" className={`${theme.textMuted} ${theme.goldTextHover} transition-colors font-medium uppercase px-2 py-1.5 flex items-center gap-1 text-[10px]`}>
                                                <FileText size={11} /> PDF
                                            </a>
                                        )}

                                        <div className="flex gap-1.5 ml-auto">
                                            <button
                                                onClick={() => setSelectedContract(ctr)}
                                                className={`flex items-center justify-center gap-1 ${theme.buttonOutline} transition-all font-semibold uppercase px-3 py-1.5 rounded-sm`}
                                            >
                                                <Eye size={12} /> Xem Chi Tiết
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                );
                            })}
                        </div>
                        
                        {/* Pagination */}
                        <div className="flex justify-center items-center mt-8 gap-2">
                            <button
                                onClick={() => fetchContracts(page - 1)}
                                disabled={page === 1}
                                className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all ${page === 1 ? 'opacity-50 cursor-not-allowed bg-[#1F212A] text-[#5A5C66]' : 'bg-[#1F212A] hover:bg-[#2C2D35] text-[#8A8D98] hover:text-white'}`}
                            >
                                Trước
                            </button>
                            <span className={`text-[11px] uppercase tracking-wider font-mono ${theme.textMutedSoft} px-3`}>
                                Trang <span className="text-white">{page}</span> / {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={() => fetchContracts(page + 1)}
                                disabled={page === totalPages || totalPages === 0}
                                className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all ${page === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed bg-[#1F212A] text-[#5A5C66]' : 'bg-[#1F212A] hover:bg-[#2C2D35] text-[#8A8D98] hover:text-white'}`}
                            >
                                Sau
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={`py-16 text-center border border-dashed ${theme.border} ${theme.emptyBg} rounded-sm flex flex-col items-center justify-center min-h-[300px]`}>
                        <FileCheck size={32} className={`${theme.textMutedSoft} mb-2`} />
                        <h3 className={`text-sm font-medium ${theme.title} tracking-wide`}>Không tìm thấy dữ liệu hồ sơ</h3>
                    </div>
                )}
            </div>
            )}

            {/* --- LUXURY MODAL: XEM CHI TIẾT HỢP ĐỒNG --- */}
            {selectedContract && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedContract(null)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-2xl w-full p-8 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200 text-xs`}>

                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#C5A880]/[0.02]' : 'text-[#8A6212]/[0.03]'} pointer-events-none select-none`}>
                            <Shield size={240} className="stroke-[1]" />
                        </div>

                        <div className={`flex justify-between items-start border-b ${theme.border} pb-4 mb-6`}>
                            <div>
                                <span className={`text-[9px] tracking-[0.2em] ${theme.textMuted} uppercase font-mono`}>{selectedContract.id?.toString().substring(0, 8).toUpperCase()}</span>
                                <h3 className={`text-base font-light tracking-wide ${theme.title} uppercase mt-0.5`}>Chứng Thư Thỏa Thuận Lưu Trú</h3>
                            </div>
                            <button onClick={() => setSelectedContract(null)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1 relative z-10`}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none relative z-10">
                            <div>
                                <h4 className={`text-[10px] tracking-widest ${theme.goldText} uppercase font-semibold border-b ${theme.divider} pb-1.5 mb-3`}>I. Thông Tin Bên Thuê (Bên B)</h4>
                                <div className={`grid grid-cols-2 gap-y-3 gap-x-6 ${theme.textMainSoft}`}>
                                    <div><span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Họ và tên chủ hộ</span> <strong className={`${theme.title} font-medium`}>{selectedContract.residentName || 'N/A'}</strong></div>
                                    <div><span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Số điện thoại</span> <span className="font-mono">{selectedContract.residentPhone || 'N/A'}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className={`text-[10px] tracking-widest ${theme.goldText} uppercase font-semibold border-b ${theme.divider} pb-1.5 mb-3`}>II. Đối Tượng Thuê & Thời Hạn</h4>
                                <div className={`grid grid-cols-2 gap-y-3 gap-x-6 ${theme.textMainSoft}`}>
                                    <div><span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Phòng</span> <strong className={`${theme.title} font-medium`}>Phòng {selectedContract.roomNumber || 'N/A'}</strong></div>
                                    <div><span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Trạng thái</span> <span className="text-[#4E9F6D]">{mapContractStatus(selectedContract)}</span></div>
                                    <div><span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Ngày kích hoạt</span> <span className={`font-mono ${theme.title}`}>{fmtDate(selectedContract.startDate)}</span></div>
                                    <div><span className={`${theme.textMutedSoft} block text-[9px] uppercase tracking-wider`}>Ngày đáo hạn</span> <span className={`font-mono ${theme.title}`}>{fmtDate(selectedContract.endDate)}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className={`text-[10px] tracking-widest ${theme.goldText} uppercase font-semibold border-b ${theme.divider} pb-1.5 mb-3`}>III. Thỏa Thuận Biểu Phí Tài Chính</h4>
                                <div className={`grid grid-cols-2 gap-4 ${theme.certDetailsBg} border p-4 rounded-sm`}>
                                    <div>
                                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Giá thuê / tháng</span>
                                        <p className={`text-lg font-normal ${theme.title} font-mono mt-0.5`}>{fmtMoney(selectedContract.basePrice)}</p>
                                    </div>
                                    <div>
                                        <span className={`${theme.textMutedSoft} uppercase tracking-wider text-[9px]`}>Tiền bảo cọc</span>
                                        <p className={`text-lg font-normal ${theme.priceText} font-mono mt-0.5`}>{fmtMoney(selectedContract.depositAmount)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* TASK-035: Upload PDF */}
                            <div>
                                <h4 className={`text-[10px] tracking-widest ${theme.goldText} uppercase font-semibold border-b ${theme.divider} pb-1.5 mb-3`}>IV. File Hợp Đồng</h4>
                                <div className="flex items-center gap-3">
                                    {selectedContract.contractPdfUrl ? (
                                        <a href={selectedContract.contractPdfUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-xs ${theme.goldText} font-medium underline`}>
                                            <FileText size={14} /> Xem file hợp đồng PDF
                                        </a>
                                    ) : (
                                        <span className={`${theme.textMuted} text-xs`}>Chưa có file PDF</span>
                                    )}
                                    <label className={`cursor-pointer flex items-center gap-1.5 ${theme.buttonOutline} text-[10px] uppercase font-semibold px-3 py-1.5 rounded-sm ml-auto`}>
                                        {uploadingPdf ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                        {uploadingPdf ? 'Đang tải...' : 'Upload PDF'}
                                        <input type="file" accept=".pdf" className="hidden" onChange={handleUploadPdf} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className={`flex gap-3 justify-end pt-5 border-t ${theme.border} mt-8 relative z-10`}>
                            <button type="button" onClick={() => setSelectedContract(null)} className={`px-5 py-2.5 text-xs font-semibold ${theme.buttonOutline} uppercase transition-colors rounded-sm`}>
                                Đóng văn bản
                            </button>
                            {selectedContract.status === 'Active' && (
                                <button
                                    type="button"
                                    onClick={() => { setIsRenewModalOpen(true); }}
                                    className={`${theme.buttonOutline} text-xs font-bold px-5 py-2.5 rounded-sm tracking-wider uppercase flex items-center gap-2`}
                                >
                                    <RefreshCw size={12} /> Gia Hạn
                                </button>
                            )}
                            {selectedContract.status === 'Active' && (
                                <button
                                    type="button"
                                    onClick={handleTerminate}
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Thanh Lý Hợp Đồng'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- LUXURY MODAL FORM: KHỞI TẠO HỢP ĐỒNG MỚI --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-xl w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>

                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${theme.goldBg} animate-pulse`}></div>
                                <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>Thiết Lập Pháp Lý Thuê Phòng</h3>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Tòa nhà / Cơ sở *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.propertyId}
                                            onChange={(e) => handlePropertyChange(e.target.value)}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-8 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors appearance-none`}
                                        >
                                            <option value="">-- Chọn tòa nhà --</option>
                                            {propertiesList.map((p, idx) => (
                                                <option key={p.id || idx} value={p.id}>{p.propertyName || p.name || 'Không có tên'}</option>
                                            ))}
                                        </select>
                                        <FileText size={13} className={`absolute left-2.5 top-3 ${theme.textMutedSoft}`} />
                                        <ChevronRight size={13} className={`absolute right-3 top-3 ${theme.textMutedSoft} pointer-events-none rotate-90`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Khách thuê (Cư dân) *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.residentId}
                                            onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-8 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors appearance-none`}
                                        >
                                            <option value="">-- Chọn khách thuê --</option>
                                            {residentsList.map((r, idx) => {
                                                const displayStr = `${r.fullName || r.name || r.residentName || 'N/A'} - ${r.phone || r.residentPhone || 'N/A'}`;
                                                const keyVal = r.residentId || r.id || `res-${idx}`;
                                                const val = r.residentId || r.id;
                                                return <option key={keyVal} value={val}>{displayStr}</option>;
                                            })}
                                        </select>
                                        <User size={13} className={`absolute left-2.5 top-3 ${theme.textMutedSoft}`} />
                                        <ChevronRight size={13} className={`absolute right-3 top-3 ${theme.textMutedSoft} pointer-events-none rotate-90`} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Phòng *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.roomId}
                                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-8 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors appearance-none`}
                                            disabled={!formData.propertyId}
                                        >
                                            <option value="">-- Chọn phòng --</option>
                                            {roomsList.map((r, idx) => (
                                                <option key={r.id || idx} value={r.id}>Phòng {r.roomNumber} - {r.status}</option>
                                            ))}
                                        </select>
                                        <MapPin size={13} className={`absolute left-2.5 top-3 ${theme.textMutedSoft}`} />
                                        <ChevronRight size={13} className={`absolute right-3 top-3 ${theme.textMutedSoft} pointer-events-none rotate-90`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Tiền cọc thương lượng *</label>
                                    <div className="relative">
                                        <input
                                            type="number" required placeholder="10000000..."
                                            value={formData.depositAmount}
                                            onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                                            className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-8 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                        />
                                        <DollarSign size={13} className={`absolute left-2.5 top-3 ${theme.textMutedSoft}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Ngày bắt đầu hiệu lực *</label>
                                    <input
                                        type="date" required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors uppercase font-mono`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Ngày đáo hạn kết thúc *</label>
                                    <input
                                        type="date" required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors uppercase font-mono`}
                                    />
                                </div>
                            </div>

                            <div className={`p-3 border rounded-sm flex items-start gap-2 text-[11px] font-light leading-relaxed ${theme.certAlertBg}`}>
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <p>Hồ sơ hợp đồng sau khi kích hoạt sẽ tự động khóa dữ liệu phòng chỉ định, đồng bộ chu kỳ tính hóa đơn hàng tháng.</p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-[#2C2D35] mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className={`px-4 py-2 text-xs font-semibold tracking-wider ${theme.textMuted} ${theme.textMutedHover} uppercase`}>Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase">Kích Hoạt Pháp Lý</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL GIA HẠN HỢP ĐỒNG --- */}
            {isRenewModalOpen && selectedContract && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsRenewModalOpen(false)}></div>

                    <div className={`relative ${theme.modalBg} border max-w-sm w-full p-6 shadow-2xl rounded-sm transform transition-all animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`flex justify-between items-center border-b ${theme.border} pb-4 mb-5`}>
                            <h3 className={`text-sm font-semibold tracking-widest ${theme.title} uppercase`}>Gia Hạn Hợp Đồng</h3>
                            <button onClick={() => setIsRenewModalOpen(false)} className={`${theme.textMuted} ${theme.textMutedHover} transition-colors p-1`}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleRenew} className="space-y-4 text-xs">
                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Ngày đáo hạn mới *</label>
                                <input
                                    type="date" required
                                    value={renewData.newEndDate}
                                    onChange={(e) => setRenewData({ ...renewData, newEndDate: e.target.value })}
                                    className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors uppercase font-mono`}
                                />
                            </div>
                            <div>
                                <label className={`block text-[10px] tracking-widest ${theme.textMuted} mb-1.5 uppercase font-medium`}>Cập nhật tiền cọc (Tùy chọn)</label>
                                <div className="relative">
                                    <input
                                        type="number" placeholder="Để trống nếu giữ nguyên..."
                                        value={renewData.newDepositAmount}
                                        onChange={(e) => setRenewData({ ...renewData, newDepositAmount: e.target.value })}
                                        className={`w-full ${theme.modalInput} border text-xs px-3 py-2.5 pl-8 rounded-sm focus:outline-none ${theme.goldFocus} transition-colors`}
                                    />
                                    <DollarSign size={13} className={`absolute left-2.5 top-3 ${theme.textMutedSoft}`} />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4 border-t border-[#2C2D35] mt-6">
                                <button type="button" onClick={() => setIsRenewModalOpen(false)} className={`px-4 py-2 text-xs font-semibold tracking-wider ${theme.textMuted} ${theme.textMutedHover} uppercase`}>Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-[#A98446] to-[#D4AF37] text-black text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 tracking-wider uppercase disabled:opacity-50">
                                    {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- TOAST NOTIFICATION --- */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-sm shadow-xl border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
                    toast.type === 'error' ? 'bg-[#2D1B1B] text-[#E05252] border-[#522525]' : 'bg-[#1B2A22] text-[#4E9F6D] border-[#254A34]'
                }`}>
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    <span className="text-xs font-medium tracking-wide">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100"><X size={14} /></button>
                </div>
            )}

        </div>
    );
}