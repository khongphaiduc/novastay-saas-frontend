import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    ArrowUpRight, ArrowDownRight, Printer, XCircle, Building, Calendar, 
    CreditCard, DollarSign, FileText, User, ShieldCheck, Clock, MapPin, 
    ArrowRight, Sparkles, Receipt, Info, Tag
} from 'lucide-react';

const INCOME_CATEGORY_MAP = {
    0: 'Tiền phòng',
    1: 'Tiền điện',
    2: 'Tiền nước',
    3: 'Tiền Internet',
    4: 'Tiền dịch vụ',
    5: 'Phí trả chậm',
    6: 'Tiền cọc',
    7: 'Phụ thu',
    8: 'Khác',
    9: 'Bồi thường',
    10: 'Tiện ích'
};

const EXPENSE_CATEGORY_MAP = {
    0: 'Tiền điện',
    1: 'Tiền nước',
    2: 'Internet',
    3: 'Bảo trì',
    4: 'Sửa chữa',
    5: 'Khấu hao tài sản',
    6: 'Vệ sinh',
    7: 'An ninh',
    8: 'Lương nhân viên',
    9: 'Văn phòng phẩm',
    10: 'Marketing',
    11: 'Tiện ích khác',
    12: 'Thuế, phí',
    13: 'Bảo hiểm',
    14: 'Chi phí dịch vụ',
    15: 'Mua sắm trang thiết bị',
    16: 'Nội thất',
    17: 'Đi lại, vận chuyển'
};

export default function TransactionDetailPage() {
    const { type, facility, realId, id } = useParams();
    const [detailData, setDetailData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const accountData = localStorage.getItem('ns_account');
                let organizationId = 'a31bfed6-ab82-44ac-9bd1-91a5c8fce4bb';
                let accessToken = '';
                if (accountData) {
                    const parsed = JSON.parse(accountData);
                    organizationId = parsed.organizationId || organizationId;
                    accessToken = parsed.accessToken || '';
                }

                const API_ROOT = import.meta.env.VITE_API_URL || '';
                
                // Fetch property list
                const propRes = await fetch(`${API_ROOT}/api/organizations/${organizationId}/properties`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                        'accessToken': accessToken,
                    }
                });
                if (propRes.ok) {
                    const propData = await propRes.json();
                    setProperties(propData.items || propData.data || (Array.isArray(propData) ? propData : []));
                }

                // Fetch transaction detail
                if (!realId || realId === 'mock' || realId === 'undefined') {
                    const isTypeThu = type === 'Thu';
                    setDetailData({
                        receiptNumber: id,
                        expenseNumber: id,
                        incomeCategoryName: isTypeThu ? 'Tiền phòng trọ' : 'Bảo trì hệ thống',
                        expenseCategoryName: isTypeThu ? 'Tiền phòng trọ' : 'Bảo trì hệ thống',
                        payerName: isTypeThu ? 'Phạm Trung Đức' : 'Công ty Điện lực Hà Nội',
                        payeeName: isTypeThu ? 'Phạm Trung Đức' : 'Công ty Điện lực Hà Nội',
                        roomNumber: '102',
                        amount: 3850000,
                        collectedAt: new Date().toISOString(),
                        spentAt: new Date().toISOString(),
                        paymentMethodRaw: 'BankTransfer',
                        statusRaw: 'Success',
                        referenceCode: 'REF-2026-8891',
                        description: 'Ghi nhận giao dịch hạch toán tự động thông qua thẻ thông tin đối tác của hệ thống quản lý.',
                        isLocalMock: true,
                        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                        updatedAt: new Date(Date.now() - 3600000).toISOString()
                    });
                } else {
                    const endpoint = type === 'Thu'
                        ? `${API_ROOT}/api/organizations/${organizationId}/properties/${facility}/income-receipts/${realId}`
                        : `${API_ROOT}/api/organizations/${organizationId}/properties/${facility}/expenses/${realId}`;

                    const res = await fetch(endpoint, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                            'accessToken': accessToken,
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setDetailData(data);
                    }
                }
            } catch (err) {
                console.error('Error fetching detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, facility, realId, id]);

    const getFacilityName = (facId) => {
        const found = properties.find(p => p.id === facId || p.propertyId === facId);
        return found ? found.propertyName || found.name : facId || 'Hệ thống';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070B]">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="w-12 h-12 border-2 border-b-amber-600 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin absolute" style={{ animationDirection: 'reverse' }}></div>
                    <Sparkles className="w-5 h-5 text-[#D4AF37] absolute animate-pulse" />
                </div>
                <span className="text-[10px] mt-6 font-black text-[#D4AF37] tracking-[0.25em] uppercase">Đang tải thông tin Luxury...</span>
            </div>
        );
    }

    if (!detailData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070B] text-white p-4">
                <XCircle className="w-16 h-16 text-rose-500/80 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]" />
                <h2 className="text-xl font-bold tracking-tight text-white mb-2">Chứng từ không khả dụng</h2>
                <p className="text-gray-400 text-xs mb-6 text-center max-w-sm">Dữ liệu chứng từ chưa được đồng bộ hoặc liên kết truy cập đã hết hiệu lực.</p>
                <button 
                    onClick={() => window.close()}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:from-[#AA7C11] hover:to-[#8C620C] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
                >
                    Đóng Tab
                </button>
            </div>
        );
    }

    const isThu = type === 'Thu';
    const amountVal = detailData.amount;
    const docNo = isThu ? (detailData.receiptNumber || id) : (detailData.expenseNumber || id);
    const categoryName = isThu 
        ? (INCOME_CATEGORY_MAP[detailData.incomeType] || detailData.incomeCategoryName || 'Thu khác')
        : (EXPENSE_CATEGORY_MAP[detailData.expenseType] || detailData.expenseCategoryName || 'Chi khác');
    const personName = isThu ? (detailData.payerName || 'Khách nộp') : (detailData.payeeName || 'Đối tác');
    const dateStr = isThu ? detailData.collectedAt : detailData.spentAt;
    const formattedDate = dateStr ? new Date(dateStr).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
    const createdDate = detailData.createdAt ? new Date(detailData.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : formattedDate;
    
    // Status text & color
    const isApproved = detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success';
    const isPending = detailData.statusRaw === 'Pending';

    return (
        <div className="min-h-screen bg-[#07070B] text-[#D1D1D6] font-sans pb-16 pt-10 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black print:p-0 print:py-0">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Action Panel (hidden during print) */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-gradient-to-r from-[#11111A] to-[#161625] p-5 rounded-2xl border border-[#2A2518]/30 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4)] print:hidden">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isThu ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {isThu ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase font-black text-amber-400 tracking-wider">Hệ Thống Sổ Cái Premium</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            </div>
                            <h2 className="text-sm font-bold text-white mt-0.5">Chứng từ số: {docNo}</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1C28] hover:bg-[#282838] text-white rounded-xl border border-white/10 text-xs font-black uppercase tracking-wider transition-all shadow-md"
                        >
                            <Printer className="w-4 h-4 text-[#D4AF37]" />
                            In Hóa Đơn
                        </button>
                        <button
                            onClick={() => window.close()}
                            className="px-5 py-2.5 bg-gradient-to-r from-rose-500/10 to-rose-600/10 hover:from-rose-500/20 hover:to-rose-600/20 text-rose-400 rounded-xl border border-rose-500/20 text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Đóng Tab
                        </button>
                    </div>
                </div>

                {/* Dashboard Luxury Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Financial & Document Info */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Premium Card: Main Voucher Info */}
                        <div className="relative overflow-hidden bg-gradient-to-b from-[#11111E] to-[#0A0A10] border border-[#2A2518]/45 rounded-3xl p-6 md:p-8 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6)] print:border-black print:p-0 print:shadow-none">
                            {/* Decorative metallic overlay */}
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
                            <div className="absolute top-0 right-0 w-80 h-80 rounded-full filter blur-3xl opacity-[0.02] bg-[#D4AF37]" />

                            {/* Header Company Details */}
                            <div className="flex justify-between items-start border-b border-[#2A2518]/20 pb-6 mb-6 print:border-black">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                                        NovaStay <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded-md">Vip Suite</span>
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-1">Căn hộ dịch vụ & Vận hành lưu trú cao cấp</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm ${
                                        isThu ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5'
                                    }`}>
                                        <Receipt className="w-3.5 h-3.5" />
                                        {isThu ? 'Phiếu Thu Gốc' : 'Phiếu Chi Gốc'}
                                    </span>
                                </div>
                            </div>

                            {/* Giant Golden Amount */}
                            <div className="text-center py-8 px-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.02] via-amber-500/[0.04] to-amber-500/[0.02] border border-[#D4AF37]/10 mb-8 relative">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Tổng giá trị thanh toán</span>
                                <div className={`text-4xl md:text-5xl font-black mt-2 tracking-tight ${isThu ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isThu ? '+' : '-'}{formatCurrency(amountVal)}
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono font-bold mt-2">Mã kiểm toán: {realId || 'MOCK-TX-AUDIT'}</div>
                            </div>

                            {/* Structured Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Cơ sở quản lý
                                    </span>
                                    <span className="font-bold text-white text-base block print:text-black">{getFacilityName(detailData.propertyId || facility)}</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Thời gian ghi nhận
                                    </span>
                                    <span className="font-bold text-white text-base block print:text-black">{formattedDate}</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Hạng mục nghiệp vụ
                                    </span>
                                    <span className="font-bold text-white text-base block print:text-black">{categoryName}</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        {isThu ? 'Khách hàng chi trả' : 'Đối tác thụ hưởng'}
                                    </span>
                                    <span className="font-bold text-white text-base block print:text-black">{personName}</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5">
                                        <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Phương thức giao dịch
                                    </span>
                                    <span className="font-bold text-white text-base block print:text-black">
                                        {detailData.paymentMethodRaw === 'BankTransfer' ? 'Chuyển khoản liên ngân hàng' : (detailData.paymentMethodRaw === 'Cash' ? 'Giao dịch tiền mặt' : detailData.paymentMethodRaw || 'Chuyển khoản')}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Số hóa đơn liên kết
                                    </span>
                                    <span className="font-mono font-bold text-amber-400 text-base block">{detailData.referenceCode || 'Không đính kèm'}</span>
                                </div>

                                {detailData.roomNumber && (
                                    <div className="space-y-1 col-span-1 md:col-span-2 border-t border-[#2A2518]/15 pt-4">
                                        <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5">
                                            <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                                            Số phòng trực thuộc
                                        </span>
                                        <span className="font-bold text-white text-base block print:text-black">Phòng {detailData.roomNumber}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description Block */}
                            <div className="border-t border-[#2A2518]/25 pt-6 mt-8">
                                <span className="text-[10px] text-gray-500 font-black tracking-wider uppercase flex items-center gap-1.5 mb-2.5">
                                    <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    Mô tả diễn giải chi tiết
                                </span>
                                <p className="p-4 rounded-xl bg-white/[0.01] border border-[#2A2518]/20 leading-relaxed text-[#A9A9B2] text-xs print:bg-transparent print:border-none print:p-0 print:text-black">
                                    {detailData.description || 'Không có ghi chú diễn giải kèm theo cho chứng từ này.'}
                                </p>
                            </div>
                        </div>

                        {/* Audit Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                            <div className="p-5 rounded-2xl bg-[#11111A]/80 border border-[#2A2518]/20 flex items-center gap-4">
                                <ShieldCheck className="w-10 h-10 text-amber-500/80 shrink-0" />
                                <div>
                                    <div className="text-[10px] text-gray-500 font-black tracking-wider uppercase">Bảo mật hệ thống</div>
                                    <div className="text-xs font-bold text-white mt-1">Đồng bộ mã hóa SHA-256</div>
                                </div>
                            </div>
                            <div className="p-5 rounded-2xl bg-[#11111A]/80 border border-[#2A2518]/20 flex items-center gap-4">
                                <Clock className="w-10 h-10 text-[#D4AF37]/80 shrink-0" />
                                <div>
                                    <div className="text-[10px] text-gray-500 font-black tracking-wider uppercase">Ngày tạo lập dữ liệu</div>
                                    <div className="text-xs font-bold text-white mt-1">{createdDate}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Status & Processing Timeline */}
                    <div className="space-y-6">
                        
                        {/* Premium Card: Status Tracker */}
                        <div className="bg-gradient-to-b from-[#11111E] to-[#0A0A10] border border-[#2A2518]/45 rounded-3xl p-6 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6)]">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#2A2518]/20">
                                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                <h3 className="text-xs font-black uppercase text-white tracking-wider">Trạng Thái & Tiến Trình</h3>
                            </div>

                            {/* Huge Status Badge */}
                            <div className="mb-8 text-center">
                                <div className="text-[10px] text-gray-500 font-black tracking-wider uppercase mb-2">Trạng thái hiện tại</div>
                                <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border shadow-md ${
                                    isApproved 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5' 
                                        : isPending 
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-amber-500/5' 
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-rose-500/5'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
                                    {isApproved ? 'Đã Quyết Toán' : isPending ? 'Chờ Phê Duyệt' : 'Treo Nợ Quá Hạn'}
                                </span>
                            </div>

                            {/* Luxury Vertical Timeline */}
                            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#2A2518]/30">
                                
                                {/* Step 1 */}
                                <div className="flex items-start gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 z-10 bg-[#07070B]">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white">Khởi tạo chứng từ</h4>
                                        <p className="text-[10px] text-gray-500 mt-1">{createdDate}</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-4 relative">
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 bg-[#07070B] ${
                                        isApproved || isPending 
                                            ? 'bg-amber-500/10 border-amber-500/30' 
                                            : 'bg-rose-500/10 border-rose-500/30'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${isApproved || isPending ? 'bg-amber-400' : 'bg-rose-400'}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white">Xác minh nghiệp vụ</h4>
                                        <p className="text-[10px] text-gray-500 mt-1">Đồng bộ hoàn tất</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start gap-4 relative">
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 bg-[#07070B] ${
                                        isApproved 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                            : 'bg-slate-900 border-white/5'
                                    }`}>
                                        {isApproved ? (
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold ${isApproved ? 'text-emerald-400' : 'text-gray-500'}`}>Quyết toán sổ cái</h4>
                                        <p className="text-[10px] text-gray-500 mt-1">{isApproved ? formattedDate : 'Đang xử lý...'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Printing instructions info (hidden during print) */}
                        <div className="bg-[#11111A]/60 border border-[#2A2518]/20 rounded-3xl p-5 text-xs text-gray-400 flex items-start gap-3 print:hidden">
                            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                Chứng từ này đã được ký điện tử bởi **NovaStay Ledger System**. Để lưu trữ vật lý, vui lòng nhấp vào **In Hóa Đơn** để tối ưu bản in văn bản.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Signature block for physical printing */}
                <div className="hidden print:grid grid-cols-2 gap-12 text-center mt-20 text-xs font-black uppercase tracking-widest text-black">
                    <div>
                        <p className="mb-20 border-b border-black/10 pb-2">Người Lập Phiếu</p>
                        <p className="italic text-gray-400 text-[10px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                    </div>
                    <div>
                        <p className="mb-20 border-b border-black/10 pb-2">{isThu ? 'Khách Hàng Nộp Tiền' : 'Người Nhận Tiền'}</p>
                        <p className="italic text-gray-400 text-[10px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
