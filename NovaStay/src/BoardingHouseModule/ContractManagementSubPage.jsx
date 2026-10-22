import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, Plus, FileText, User, ChevronRight, Sparkles, Calendar, DollarSign,
    X, FileCheck, AlertCircle, History, Clock, Eye, Shield, Zap, Droplet,
    RefreshCw, CheckCircle, CheckCircle2, Loader2, Upload, Bell, MapPin, Building,
    Building2, Home, Layers, LayoutGrid, List, SlidersHorizontal, Phone, Check,
    AlertTriangle, Send
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
    const [expiringSoonCount, setExpiringSoonCount] = useState(0);

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

    // State form tạo hợp đồng mới
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

    const businessName = useMemo(() => {
        return getAccountInfo().businessName || 'Hệ Thống NovaStay';
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const mapContractStatus = (contract) => {
        if (!contract) return 'N/A';
        if (contract.status === 'Terminated') return 'Đã thanh lý';
        if (contract.status === 'Renewed') return 'Đã gia hạn';
        if (contract.status !== 'Active') return contract.status || 'N/A';
        const days = contract.daysUntilExpiry;
        if (typeof days === 'number') {
            if (days < 0) return 'Quá hạn';
            if (days <= 30) return 'Sắp hết hạn';
        }
        return 'Còn hiệu lực';
    };

    const getStatusBadgeStyle = (statusLabel) => {
        if (isDarkMode) {
            switch (statusLabel) {
                case 'Còn hiệu lực':
                    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
                case 'Sắp hết hạn':
                    return 'bg-amber-500/15 text-[#D4AF37] border border-[#D4AF37]/35';
                case 'Quá hạn':
                    return 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse';
                case 'Đã thanh lý':
                    return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
                case 'Đã gia hạn':
                    return 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
                default:
                    return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
            }
        } else {
            switch (statusLabel) {
                case 'Còn hiệu lực':
                    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                case 'Sắp hết hạn':
                    return 'bg-amber-50 text-[#8A6212] border border-amber-300';
                case 'Quá hạn':
                    return 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse';
                case 'Đã thanh lý':
                    return 'bg-slate-100 text-slate-600 border border-slate-200';
                case 'Đã gia hạn':
                    return 'bg-sky-50 text-sky-700 border border-sky-200';
                default:
                    return 'bg-slate-100 text-slate-600 border border-slate-200';
            }
        }
    };

    const fetchContracts = useCallback(async (currentPage = 1) => {
        setLoading(true);
        setError('');
        try {
            const { organizationId } = getAccountInfo();
            if (!organizationId) throw new Error('Không tìm thấy thông tin tổ chức');
            
            const [data, expiringData] = await Promise.all([
                getContracts({
                    organizationId,
                    pageIndex: currentPage,
                    pageSize: 10,
                    search: searchTerm.trim(),
                    status: statusFilter !== 'All' ? statusFilter : ''
                }),
                getExpiringSoonContracts(organizationId, 30).catch(() => [])
            ]);

            setContracts(data?.items || []);
            setTotalPages(data?.totalPages || 1);
            setTotalContracts(data?.totalCount || 0);
            setPage(currentPage);
            if (Array.isArray(expiringData)) {
                setExpiringSoonCount(expiringData.length);
            }
        } catch (err) {
            setError(err.message || 'Lỗi tải danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchContracts(1), 300);
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
            const rooms = await getRooms({ propertyId: propId, pageSize: 100 });
            setRoomsList(rooms?.items || rooms?.data || rooms || []);
        } catch (err) {
            console.error('Error fetching rooms', err);
        }
    };

    const theme = isDarkMode ? {
        bg: 'bg-[#0B0B12] text-slate-100 selection:bg-[#D4AF37] selection:text-black',
        panel: 'bg-[#11111A] border-[#2A2518]',
        panelSoft: 'bg-[#161622] border-[#2A2518]/50',
        input: 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37] placeholder-gray-500',
        textMuted: 'text-gray-400',
        textMutedSoft: 'text-gray-500',
        title: 'text-white',
        border: 'border-[#2A2518]',
        divide: 'divide-[#2A2518]/50',
        cardActive: 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/15',
        cardIdle: 'text-gray-400 hover:text-white hover:bg-white/5',
        tableHead: 'bg-[#0F0F17]/70 border-[#2A2518]/50 text-gray-400',
        rowHover: 'hover:bg-white/[0.02]',
        goldText: 'text-[#D4AF37]',
        goldBg: 'bg-[#D4AF37]',
        modalBg: 'bg-[#11111A] border-[#2A2518] text-white',
        modalInput: 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37] placeholder-gray-500',
        statusOk: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
        statusPending: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
        buttonOutline: 'bg-[#161622] border-[#2A2518] text-gray-300 hover:text-white hover:border-[#D4AF37]/50'
    } : {
        bg: 'bg-[#FAF8F5] text-slate-900 selection:bg-[#D4AF37] selection:text-black',
        panel: 'bg-white border-[#E5D4AD] shadow-sm',
        panelSoft: 'bg-[#FFF9EC] border-[#E5D4AD]/70',
        input: 'bg-white border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
        textMuted: 'text-slate-500',
        textMutedSoft: 'text-slate-400',
        title: 'text-slate-950',
        border: 'border-[#E5D4AD]',
        divide: 'divide-[#E5D4AD]/70',
        cardActive: 'bg-gradient-to-r from-[#FFF1C7] to-white text-[#8A6212] border border-[#D4AF37]/40 shadow-sm font-bold',
        cardIdle: 'text-slate-600 hover:text-slate-950 hover:bg-amber-50',
        tableHead: 'bg-[#FAF8F5] border-[#E5D4AD]/70 text-slate-500',
        rowHover: 'hover:bg-amber-50/50',
        goldText: 'text-[#AA7C11]',
        goldBg: 'bg-[#AA7C11]',
        modalBg: 'bg-white border-[#E5D4AD] text-slate-900',
        modalInput: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
        statusOk: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        statusPending: 'bg-amber-50 text-amber-700 border border-amber-200',
        buttonOutline: 'bg-white border-[#E5D4AD] text-slate-700 hover:bg-amber-50'
    };

    const filteredContracts = useMemo(() => {
        return contracts.filter(ctr => {
            const statusVI = mapContractStatus(ctr);
            const matchesSearch = !searchTerm || [
                ctr.residentName, ctr.roomNumber, ctr.id, ctr.propertyName
            ].some(f => f && f.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'All' || statusVI === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [contracts, searchTerm, statusFilter]);

    // KPI Metrics
    const activeCount = useMemo(() => {
        return contracts.filter(c => c.status === 'Active' && (c.daysUntilExpiry == null || c.daysUntilExpiry > 30)).length;
    }, [contracts]);

    const expiringCount = useMemo(() => {
        return expiringSoonCount || contracts.filter(c => {
            const days = c.daysUntilExpiry;
            return c.status === 'Active' && typeof days === 'number' && days <= 30 && days >= 0;
        }).length;
    }, [contracts, expiringSoonCount]);

    const overdueCount = useMemo(() => {
        return contracts.filter(c => {
            const days = c.daysUntilExpiry;
            return (c.status === 'Active' && typeof days === 'number' && days < 0);
        }).length;
    }, [contracts]);

    const terminatedCount = useMemo(() => {
        return contracts.filter(c => c.status === 'Terminated').length;
    }, [contracts]);

    // Actions
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
            showToast('Kích hoạt hợp đồng thành công!', 'success');
            setIsCreateModalOpen(false);
            setFormData({ residentId: '', roomId: '', propertyId: '', depositAmount: '', startDate: '', endDate: '' });
            fetchContracts(1);
        } catch (err) {
            showToast(err.message || 'Lỗi khi tạo hợp đồng', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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
            fetchContracts(page);
        } catch (err) {
            showToast(err.message || 'Lỗi khi gia hạn', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTerminate = async () => {
        if (!window.confirm(`Xác nhận thanh lý hợp đồng cho phòng ${selectedContract?.roomNumber}?`)) return;
        setIsSubmitting(true);
        try {
            await terminateContract(selectedContract.id, { newRoomStatus: 'Available' });
            showToast('Thanh lý hợp đồng thành công!', 'success');
            setSelectedContract(null);
            fetchContracts(page);
        } catch (err) {
            showToast(err.message || 'Lỗi khi thanh lý', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendRenewalNotice = async (contractId) => {
        try {
            await sendRenewalNotice(contractId);
            showToast('Đã gửi thông báo nhắc nhở gia hạn thành công!', 'success');
        } catch (err) {
            showToast(err.message || 'Lỗi gửi thông báo', 'error');
        }
    };

    const handleUploadPdf = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPdf(true);
        try {
            const updated = await uploadContractPdf(selectedContract.id, file);
            setSelectedContract(updated);
            showToast('Upload file PDF thành công!', 'success');
            fetchContracts(page);
        } catch (err) {
            showToast(err.message || 'Lỗi upload file', 'error');
        } finally {
            setUploadingPdf(false);
        }
    };

    const fmtDate = (d) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
    };

    const fmtMoney = (n) => {
        if (n == null || isNaN(n)) return '—';
        return Number(n).toLocaleString('vi-VN') + 'đ';
    };

    return (
        <div className={`w-full min-h-full transition-colors duration-300 ${theme.bg} font-sans p-6 lg:p-8 space-y-6 relative`}>

            {/* ── 1. HEADER SECTION ── */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${theme.border} pb-5`}>
                <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" /> HỆ THỐNG PHÁP LÝ & HỢP ĐỒNG THUÊ
                    </span>
                    <h2 className={`text-2xl font-black tracking-tight ${theme.title} mt-0.5`}>
                        Quản Lý Hồ Sơ Hợp Đồng
                    </h2>
                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                        Theo dõi kỳ hạn thỏa thuận, bảo cọc, gia hạn hợp đồng và đồng bộ hóa đơn khách thuê.
                    </p>
                </div>

                {/* Business Facility Badge */}
                <div className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-2xl border ${theme.panelSoft}`}>
                    <Building className="w-4 h-4 text-[#D4AF37]" />
                    <span className={theme.textMuted}>Cơ sở vận hành:</span>
                    <span className="text-[#D4AF37] font-black">{businessName}</span>
                </div>
            </div>

            {/* ── 2. METRIC / KPI CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {/* Metric 1: Tổng hợp đồng */}
                <div className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 shadow-sm flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Tổng Hợp Đồng
                        </span>
                        <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black tracking-tight ${theme.title}`}>
                                {totalContracts}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>hồ sơ ghi nhận</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] w-full" />
                        </div>
                    </div>
                </div>

                {/* Metric 2: Đang hiệu lực */}
                <div className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 shadow-sm flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Đang Hiệu Lực
                        </span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-black tracking-tight text-emerald-400">
                                {activeCount}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                An toàn {totalContracts > 0 ? Math.round((activeCount / totalContracts) * 100) : 0}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${totalContracts > 0 ? Math.min(100, Math.round((activeCount / totalContracts) * 100)) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Metric 3: Sắp hết hạn (≤ 30 ngày) */}
                <div
                    onClick={() => setStatusFilter(statusFilter === 'Sắp hết hạn' ? 'All' : 'Sắp hết hạn')}
                    className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/60 shadow-sm flex flex-col justify-between h-36 cursor-pointer group`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Sắp Đáo Hạn (≤ 30N)
                        </span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-[#D4AF37] group-hover:scale-110 transition-transform">
                            <Bell className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tight text-[#D4AF37]">
                                {expiringCount}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>cần nhắc gia hạn</span>
                        </div>
                        <p className="text-[10px] font-bold text-[#D4AF37] mt-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Bấm để xem danh sách cần xử lý
                        </p>
                    </div>
                </div>

                {/* Metric 4: Quá hạn & Thanh lý */}
                <div className={`${theme.panel} rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 shadow-sm flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.textMuted}`}>
                            Quá Hạn & Thanh Lý
                        </span>
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black tracking-tight ${theme.title}`}>
                                {overdueCount + terminatedCount}
                            </span>
                            <span className={`text-[11px] font-medium ${theme.textMutedSoft}`}>hồ sơ biến động</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                            <span className="text-rose-400">Quá hạn: {overdueCount}</span>
                            <span>•</span>
                            <span className={theme.textMutedSoft}>Đã thanh lý: {terminatedCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 3. ACTION & FILTER BAR ── */}
            <div className={`p-3 md:p-4 rounded-2xl border ${theme.panelSoft} flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3`}>
                
                {/* Search & View Toggle */}
                <div className="flex items-center gap-2.5 flex-1 max-w-md">
                    <div className={`flex items-center border rounded-xl px-3.5 py-2 w-full ${theme.input}`}>
                        <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm mã hợp đồng, khách thuê, số phòng..."
                            className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:inherit min-w-0"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-white text-xs ml-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className={`flex items-center p-1 rounded-xl border shrink-0 ${theme.border} ${theme.panel}`}>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${
                                viewMode === 'list'
                                    ? 'bg-[#D4AF37] text-black font-bold shadow'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            title="Xem dạng danh sách"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-[#D4AF37] text-black font-bold shadow'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            title="Xem dạng thẻ lưới"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Status Filters & CTA */}
                <div className="flex flex-wrap items-center gap-2 justify-end">
                    <div className="flex flex-wrap gap-1">
                        {[
                            { id: 'All', label: 'Tất cả' },
                            { id: 'Còn hiệu lực', label: 'Còn hạn' },
                            { id: 'Sắp hết hạn', label: 'Sắp hết hạn' },
                            { id: 'Quá hạn', label: 'Quá hạn' },
                            { id: 'Đã thanh lý', label: 'Thanh lý' },
                        ].map(({ id, label }) => {
                            const isAct = statusFilter === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setStatusFilter(id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                                        isAct ? theme.cardActive : theme.cardIdle
                                    }`}
                                >
                                    <span>{label}</span>
                                    {id === 'Sắp hết hạn' && expiringCount > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isAct ? 'bg-black/20 text-black' : 'bg-rose-500 text-white animate-pulse'}`}>
                                            {expiringCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchContracts(page)}
                        disabled={loading}
                        className={`p-2 rounded-xl border transition-all ${theme.buttonOutline}`}
                        title="Tải lại danh sách"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={isFetchingOptions}
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-[#D4AF37]/20 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                        {isFetchingOptions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                        Khởi Tạo Hợp Đồng
                    </button>
                </div>
            </div>

            {/* ── 4. CONTENT LIST / TABLE / GRID ── */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    <span className={`text-xs font-bold ${theme.textMuted}`}>Đang đồng bộ dữ liệu hợp đồng...</span>
                </div>
            ) : error ? (
                <div className={`p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 ${theme.panelSoft}`}>
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                    <p className="text-xs text-rose-400 font-bold">{error}</p>
                    <button
                        type="button"
                        onClick={() => fetchContracts(1)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border ${theme.buttonOutline}`}
                    >
                        Thử lại
                    </button>
                </div>
            ) : filteredContracts.length === 0 ? (
                <div className={`p-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 ${theme.panelSoft}`}>
                    <FileCheck className="w-10 h-10 text-gray-500 stroke-[1.5]" />
                    <h3 className={`text-sm font-bold ${theme.title}`}>Không tìm thấy hồ sơ hợp đồng nào</h3>
                    <p className={`text-xs ${theme.textMuted}`}>Thử thay đổi từ khóa tìm kiếm hoặc bấm "Khởi Tạo Hợp Đồng" để thêm mới.</p>
                </div>
            ) : viewMode === 'list' ? (
                /* ── DẠNG BẢNG DANH SÁCH SANG TRỌNG ── */
                <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme.panel}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className={`border-b ${theme.tableHead}`}>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Mã HĐ & Phòng</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Khách Thuê</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Giá Thuê / Tháng</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Tiền Đặt Cọc</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Kỳ Hạn Thuê</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Trạng Thái</th>
                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme.divide}`}>
                                {filteredContracts.map((ctr) => {
                                    const statusVI = mapContractStatus(ctr);
                                    const days = ctr.daysUntilExpiry;

                                    return (
                                        <tr key={ctr.id} className={`transition-colors ${theme.rowHover}`}>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={() => setSelectedContract(ctr)}
                                                        className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0 cursor-pointer"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4
                                                            onClick={() => setSelectedContract(ctr)}
                                                            className={`font-black text-sm ${theme.title} hover:text-[#D4AF37] cursor-pointer`}
                                                        >
                                                            Phòng {ctr.roomNumber || 'Chưa gán'}
                                                        </h4>
                                                        <span className={`text-[10px] font-mono ${theme.textMutedSoft} block tracking-wider uppercase`}>
                                                            #{ctr.id?.toString().substring(0, 8).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                                    <div>
                                                        <span className={`font-bold block ${theme.title}`}>
                                                            {ctr.residentName || 'N/A'}
                                                        </span>
                                                        <span className={`text-[11px] ${theme.textMutedSoft} font-mono`}>
                                                            {ctr.residentPhone || ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-bold text-gray-200">
                                                {fmtMoney(ctr.basePrice)}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-black text-[#D4AF37]">
                                                {fmtMoney(ctr.depositAmount)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5">
                                                    <span className={`font-medium block text-gray-300`}>
                                                        {fmtDate(ctr.startDate)} → {fmtDate(ctr.endDate)}
                                                    </span>
                                                    {typeof days === 'number' && ctr.status === 'Active' && (
                                                        <span className={`text-[10px] font-bold ${
                                                            days < 0 ? 'text-rose-400' : days <= 30 ? 'text-amber-400 font-black' : 'text-emerald-400'
                                                        }`}>
                                                            {days < 0 ? `Đã quá hạn ${Math.abs(days)}N` : days <= 30 ? `Còn ${days} ngày đáo hạn` : `Còn ${days} ngày`}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${getStatusBadgeStyle(statusVI)}`}>
                                                    {statusVI}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {['Còn hiệu lực', 'Sắp hết hạn'].includes(statusVI) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSendRenewalNotice(ctr.id)}
                                                            className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                                            title="Gửi nhắc nhở gia hạn"
                                                        >
                                                            <Bell className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {['Còn hiệu lực', 'Sắp hết hạn'].includes(statusVI) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedContract(ctr);
                                                                setIsRenewModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-xl bg-amber-500/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                                                            title="Gia hạn hợp đồng"
                                                        >
                                                            <Calendar className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedContract(ctr)}
                                                        className={`p-1.5 rounded-xl border transition-all ${theme.buttonOutline}`}
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ── DẠNG GRID THẺ HỢP ĐỒNG SANG TRỌNG ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                    {filteredContracts.map((ctr) => {
                        const statusVI = mapContractStatus(ctr);
                        const days = ctr.daysUntilExpiry;

                        return (
                            <div
                                key={ctr.id}
                                className={`${theme.panel} rounded-2xl border hover:border-[#D4AF37]/60 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#D4AF37]/5 flex flex-col justify-between group relative`}
                            >
                                {/* Card Top */}
                                <div className={`p-5 border-b ${theme.border}/50`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className={`text-[10px] font-mono ${theme.textMutedSoft} block tracking-wider uppercase`}>
                                                #{ctr.id?.toString().substring(0, 8).toUpperCase()}
                                            </span>
                                            <h4 className={`text-lg font-black tracking-tight ${theme.title} group-hover:text-[#D4AF37] transition-colors mt-0.5`}>
                                                Phòng {ctr.roomNumber || 'N/A'}
                                            </h4>
                                        </div>
                                        <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(statusVI)}`}>
                                            {statusVI}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className={`p-5 space-y-3.5 flex-1 ${theme.panelSoft} text-xs`}>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft}`}>
                                            Khách hàng ký kết
                                        </span>
                                        <div className="flex items-center gap-1.5 font-bold text-gray-200">
                                            <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                                            <span>{ctr.residentName || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft}`}>
                                            Giá thuê định kỳ
                                        </span>
                                        <span className="font-mono font-bold text-gray-200">
                                            {fmtMoney(ctr.basePrice)} <span className={`text-[10px] font-normal ${theme.textMutedSoft}`}>/ thg</span>
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft}`}>
                                            Tiền cọc lưu giữ
                                        </span>
                                        <span className="font-mono font-black text-[#D4AF37]">
                                            {fmtMoney(ctr.depositAmount)}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-inherit/30 grid grid-cols-2 gap-2 text-[11px]">
                                        <div>
                                            <span className={`text-[9px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                                Ngày kích hoạt
                                            </span>
                                            <span className="font-bold text-gray-300 mt-0.5 block">
                                                {fmtDate(ctr.startDate)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-[9px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                                Ngày đáo hạn
                                            </span>
                                            <span className="font-bold text-gray-300 mt-0.5 block">
                                                {fmtDate(ctr.endDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {typeof days === 'number' && ctr.status === 'Active' && (
                                        <div className="pt-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${
                                                days < 0 ? 'bg-rose-500/15 text-rose-400' : days <= 30 ? 'bg-amber-500/15 text-[#D4AF37]' : 'bg-emerald-500/15 text-emerald-400'
                                            }`}>
                                                {days < 0 ? `Đã quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày đến hạn`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className={`p-3.5 border-t ${theme.border}/40 bg-black/10 flex items-center justify-between gap-2`}>
                                    <div className="flex items-center gap-1.5">
                                        {ctr.contractPdfUrl && (
                                            <a
                                                href={ctr.contractPdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border flex items-center gap-1 text-[#D4AF37] ${theme.panelSoft}`}
                                            >
                                                <FileText className="w-3 h-3" /> PDF
                                            </a>
                                        )}
                                        {['Còn hiệu lực', 'Sắp hết hạn'].includes(statusVI) && (
                                            <button
                                                type="button"
                                                onClick={() => handleSendRenewalNotice(ctr.id)}
                                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                                title="Gửi nhắc nhở gia hạn"
                                            >
                                                <Bell className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {['Còn hiệu lực', 'Sắp hết hạn'].includes(statusVI) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedContract(ctr);
                                                    setIsRenewModalOpen(true);
                                                }}
                                                className="p-1.5 rounded-lg bg-amber-500/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                                                title="Gia hạn"
                                            >
                                                <Calendar className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedContract(ctr)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${theme.buttonOutline}`}
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Chi Tiết
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── 5. PAGINATION ── */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                    <span className={`text-xs ${theme.textMuted}`}>
                        Hiển thị <span className="font-bold text-white">{filteredContracts.length}</span> / {totalContracts} hợp đồng
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fetchContracts(page - 1)}
                            disabled={page === 1}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${theme.buttonOutline} disabled:opacity-40`}
                        >
                            Trước
                        </button>
                        <span className="text-xs font-mono font-bold px-3 text-[#D4AF37]">
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => fetchContracts(page + 1)}
                            disabled={page === totalPages}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${theme.buttonOutline} disabled:opacity-40`}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* ── 6. MODAL: CHỨNG THƯ CHI TIẾT HỢP ĐỒNG ── */}
            {selectedContract && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
                    <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-all ${theme.panel}`}>
                        
                        {/* Modal Header */}
                        <div className={`p-6 border-b flex items-center justify-between ${theme.border}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-lg font-black tracking-tight ${theme.title}`}>
                                            Chứng Thư Thỏa Thuận Lưu Trú
                                        </h3>
                                        <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(mapContractStatus(selectedContract))}`}>
                                            {mapContractStatus(selectedContract)}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-mono ${theme.textMutedSoft} tracking-widest uppercase block mt-0.5`}>
                                        MÃ HỒ SƠ: #{selectedContract.id?.toString().toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedContract(null)}
                                className={`p-2 rounded-xl transition-all ${theme.cardIdle}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
                            
                            {/* Section 1: Bên Thuê */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> I. THÔNG TIN KHÁCH THUÊ (BÊN B)
                                </span>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border ${theme.panelSoft}`}>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Họ và tên chủ hộ
                                        </span>
                                        <span className={`text-sm font-black ${theme.title} mt-0.5 block`}>
                                            {selectedContract.residentName || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Số điện thoại liên hệ
                                        </span>
                                        <span className="text-sm font-mono font-bold text-gray-200 mt-0.5 block">
                                            {selectedContract.residentPhone || 'Chưa cung cấp'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Phòng & Thời Hạn */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                    <Home className="w-3.5 h-3.5" /> II. ĐỐI TƯỢNG THUÊ & KỲ HẠN PHÁP LÝ
                                </span>
                                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border ${theme.panelSoft}`}>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Số phòng
                                        </span>
                                        <span className={`text-base font-black text-[#D4AF37] mt-0.5 block`}>
                                            Phòng {selectedContract.roomNumber || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Cơ sở lưu trú
                                        </span>
                                        <span className={`text-xs font-bold ${theme.title} mt-0.5 block truncate`}>
                                            {selectedContract.propertyName || businessName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Ngày bắt đầu
                                        </span>
                                        <span className="text-xs font-mono font-bold text-gray-300 mt-0.5 block">
                                            {fmtDate(selectedContract.startDate)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Ngày đáo hạn
                                        </span>
                                        <span className="text-xs font-mono font-bold text-gray-300 mt-0.5 block">
                                            {fmtDate(selectedContract.endDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Biểu phí & Tiền cọc */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                    <DollarSign className="w-3.5 h-3.5" /> III. THỎA THUẬN TÀI CHÍNH
                                </span>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border ${theme.panelSoft}`}>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Giá thuê định kỳ hàng tháng
                                        </span>
                                        <span className={`text-xl font-mono font-black text-white mt-1 block`}>
                                            {fmtMoney(selectedContract.basePrice)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block`}>
                                            Tiền ký quỹ bảo cọc
                                        </span>
                                        <span className="text-xl font-mono font-black text-[#D4AF37] mt-1 block">
                                            {fmtMoney(selectedContract.depositAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: File hợp đồng PDF */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> IV. TỆP ĐÍNH KÈM HỢP ĐỒNG (PDF)
                                </span>
                                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${theme.panelSoft}`}>
                                    <div>
                                        {selectedContract.contractPdfUrl ? (
                                            <a
                                                href={selectedContract.contractPdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:underline"
                                            >
                                                <FileText className="w-4 h-4" /> Mở xem văn bản hợp đồng đã ký (PDF)
                                            </a>
                                        ) : (
                                            <span className={`text-xs ${theme.textMuted}`}>
                                                Chưa đính kèm tệp tin PDF nào cho thỏa thuận này.
                                            </span>
                                        )}
                                    </div>
                                    <label className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${theme.buttonOutline}`}>
                                        {uploadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                        {uploadingPdf ? 'Đang tải...' : 'Upload PDF'}
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={handleUploadPdf}
                                            disabled={uploadingPdf}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={`p-5 md:p-6 border-t flex flex-wrap items-center justify-between gap-3 ${theme.border} ${theme.panelSoft}`}>
                            <div>
                                {selectedContract.status === 'Active' && (
                                    <button
                                        type="button"
                                        onClick={handleTerminate}
                                        disabled={isSubmitting}
                                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all disabled:opacity-50"
                                    >
                                        Thanh Lý Hợp Đồng
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedContract(null)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${theme.buttonOutline}`}
                                >
                                    Đóng
                                </button>
                                {selectedContract.status === 'Active' && (
                                    <button
                                        type="button"
                                        onClick={() => setIsRenewModalOpen(true)}
                                        className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#D4AF37] hover:bg-[#c49f2e] text-black shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Gia Hạn Hợp Đồng
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 7. MODAL: KHỞI TẠO HỢP ĐỒNG MỚI ── */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
                    <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-all ${theme.panel}`}>
                        
                        {/* Header */}
                        <div className={`p-5 md:p-6 border-b flex items-center justify-between ${theme.border}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                                    <Plus className="w-5 h-5 stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight ${theme.title}`}>
                                        Thiết Lập Hợp Đồng Thuê Phòng
                                    </h3>
                                    <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                        Kích hoạt hồ sơ lưu trú và gắn kết phòng chỉ định với cư dân
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className={`p-2 rounded-xl transition-all ${theme.cardIdle}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Tòa Nhà / Cơ Sở <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.propertyId}
                                        onChange={(e) => handlePropertyChange(e.target.value)}
                                        className={`w-full rounded-xl px-4 py-3 text-xs font-bold border transition-all ${theme.input}`}
                                    >
                                        <option value="">-- Chọn tòa nhà --</option>
                                        {propertiesList.map((p, idx) => (
                                            <option key={p.id || idx} value={p.id} className="bg-[#11111A] text-white">
                                                {p.propertyName || p.name || 'Không rõ tên'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Cư Dân Ký Kết <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.residentId}
                                        onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
                                        className={`w-full rounded-xl px-4 py-3 text-xs font-bold border transition-all ${theme.input}`}
                                    >
                                        <option value="">-- Chọn khách thuê --</option>
                                        {residentsList.map((r, idx) => {
                                            const displayStr = `${r.fullName || r.name || r.residentName || 'N/A'} - ${r.phone || r.residentPhone || 'N/A'}`;
                                            const val = r.residentId || r.id;
                                            return (
                                                <option key={val || idx} value={val} className="bg-[#11111A] text-white">
                                                    {displayStr}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Phòng Chỉ Định <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.roomId}
                                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                        disabled={!formData.propertyId}
                                        className={`w-full rounded-xl px-4 py-3 text-xs font-bold border transition-all ${theme.input} disabled:opacity-40`}
                                    >
                                        <option value="">-- Chọn phòng --</option>
                                        {roomsList.map((r, idx) => (
                                            <option key={r.id || idx} value={r.id} className="bg-[#11111A] text-white">
                                                Phòng {r.roomNumber} ({r.status === 'Available' ? 'Trống' : r.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Tiền Cọc Bảo Đảm (VNĐ) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="50000"
                                        placeholder="Ví dụ: 3000000"
                                        value={formData.depositAmount}
                                        onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                                        className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Ngày Bắt Đầu Hiệu Lực <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                        Ngày Đáo Hạn <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                                    />
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs ${theme.panelSoft} text-gray-300`}>
                                <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    Hợp đồng sau khi tạo sẽ tự động khóa phòng chỉ định, chuyển trạng thái cư dân sang Đang Cư Trú và kích hoạt tính hóa đơn định kỳ.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2.5 justify-end pt-3 border-t border-inherit/40">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className={`px-4 py-2.5 text-xs font-bold rounded-xl border ${theme.buttonOutline}`}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                                    Kích Hoạt Hợp Đồng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 8. MODAL: GIA HẠN HỢP ĐỒNG ── */}
            {isRenewModalOpen && selectedContract && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all ${theme.panel}`}>
                        
                        <div className={`p-5 md:p-6 border-b flex items-center justify-between ${theme.border}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#D4AF37]">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className={`text-base font-black ${theme.title}`}>
                                        Gia Hạn Hợp Đồng Phòng {selectedContract.roomNumber}
                                    </h3>
                                    <span className={`text-[10px] ${theme.textMutedSoft} font-mono`}>
                                        Khách thuê: {selectedContract.residentName}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRenewModalOpen(false)}
                                className={`p-1.5 rounded-xl transition-all ${theme.cardIdle}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleRenew} className="p-6 space-y-4">
                            <div>
                                <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                    Ngày Đáo Hạn Mới <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={renewData.newEndDate}
                                    onChange={(e) => setRenewData({ ...renewData, newEndDate: e.target.value })}
                                    className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                                />
                            </div>

                            <div>
                                <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${theme.textMutedSoft}`}>
                                    Cập Nhật Tiền Cọc Mới (Tùy chọn)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Để trống nếu giữ nguyên tiền cọc cũ..."
                                    value={renewData.newDepositAmount}
                                    onChange={(e) => setRenewData({ ...renewData, newDepositAmount: e.target.value })}
                                    className={`w-full rounded-xl px-4 py-3 text-xs font-mono font-bold border transition-all ${theme.input}`}
                                />
                            </div>

                            <div className="flex gap-2.5 justify-end pt-3 border-t border-inherit/40">
                                <button
                                    type="button"
                                    onClick={() => setIsRenewModalOpen(false)}
                                    className={`px-4 py-2 text-xs font-bold rounded-xl border ${theme.buttonOutline}`}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                                    Xác Nhận Gia Hạn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 9. FLOATING TOAST NOTIFICATION ── */}
            {toast && (
                <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm ${
                        toast.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                    }`}>
                        <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                            <span className="text-xs font-bold block">{toast.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}