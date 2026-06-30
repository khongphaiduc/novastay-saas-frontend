import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    ArrowUpRight, ArrowDownRight, Printer, XCircle, Building, Calendar, 
    CreditCard, DollarSign, FileText, User, ShieldCheck, Clock, MapPin, 
    ArrowRight, Sparkles, Receipt, Info, Tag, Award
} from 'lucide-react';

const INCOME_CATEGORY_MAP = {
    0: 'Tiền phòng trọ',
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
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const triggerConfirm = (statusVal) => {
        const isTypeThu = type === 'Thu';
        const labelText = isTypeThu ? 'phiếu thu' : 'phiếu chi';
        const actionText = statusVal === 1 ? 'duyệt và quyết toán' : 'từ chối duyệt';
        setConfirmModal({
            isOpen: true,
            title: statusVal === 1 ? 'Phê Duyệt Chứng Từ' : 'Từ Chối Chứng Từ',
            message: `Bạn có chắc chắn muốn ${actionText} ${labelText} này không? Hành động này sẽ cập nhật trực tiếp vào hệ thống sổ cái tài chính.`,
            onConfirm: () => handleUpdateStatus(statusVal)
        });
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

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
                        payerName: isTypeThu ? 'Nguyễn Văn An' : 'Công ty Điện lực Hà Nội',
                        payeeName: isTypeThu ? 'Nguyễn Văn An' : 'Công ty Điện lực Hà Nội',
                        roomNumber: '402',
                        amount: 3850000,
                        collectedAt: new Date().toISOString(),
                        spentAt: new Date().toISOString(),
                        paymentMethodRaw: 'BankTransfer',
                        statusRaw: 'Success',
                        referenceCode: 'REF-2026-8891',
                        description: 'Giao dịch hạch toán điện tử chính thức được đối soát tự động bởi hệ thống quản lý.',
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

    const handleUpdateStatus = async (newStatusValue) => {
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
            
            const isTypeThu = type === 'Thu';
            const labelText = isTypeThu ? 'phiếu thu' : 'phiếu chi';

            // Fallback for mocks
            if (!realId || realId === 'mock' || realId === 'undefined') {
                showToast(newStatusValue === 1 ? `Xác nhận duyệt ${labelText} thành công! (Mock)` : `Từ chối duyệt ${labelText} thành công! (Mock)`, 'success');
                const statusString = newStatusValue === 1 ? 'Approved' : (newStatusValue === 2 ? 'Rejected' : 'Cancelled');
                setDetailData(prev => prev ? { ...prev, statusRaw: statusString } : null);
                return;
            }

            const typeSegment = isTypeThu ? 'income-receipts' : 'expenses';
            const endpoint = `${API_ROOT}/api/organizations/${organizationId}/properties/${facility}/${typeSegment}/${realId}/status`;
            
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                    'accessToken': accessToken,
                },
                body: JSON.stringify({
                    Status: newStatusValue
                })
            });

            if (res.status === 200) {
                showToast(newStatusValue === 1 ? `Xác nhận duyệt ${labelText} thành công!` : `Từ chối duyệt ${labelText} thành công!`, 'success');
                const statusString = newStatusValue === 1 ? 'Approved' : (newStatusValue === 2 ? 'Rejected' : 'Cancelled');
                setDetailData(prev => prev ? { ...prev, statusRaw: statusString } : null);
            } else {
                showToast(`Không thể cập nhật trạng thái ${labelText}. Vui lòng thử lại!`, 'error');
            }
        } catch (err) {
            console.error('Error updating receipt status:', err);
            showToast('Lỗi kết nối máy chủ.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F2EA]">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="w-12 h-12 border-2 border-b-[#AA7C11] border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin absolute" style={{ animationDirection: 'reverse' }}></div>
                    <Sparkles className="w-5 h-5 text-[#D4AF37] absolute animate-pulse" />
                </div>
                <span className="text-[10px] mt-6 font-bold text-[#AA7C11] tracking-[0.25em] uppercase">Vui lòng chờ giây lát...</span>
            </div>
        );
    }

    if (!detailData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F2EA] text-slate-800 p-4">
                <XCircle className="w-16 h-16 text-rose-600/80 mb-4 drop-shadow-[0_4px_10px_rgba(225,29,72,0.15)]" />
                <h2 className="text-xl font-serif font-bold tracking-tight text-[#2D2A26] mb-2">Chứng từ không khả dụng</h2>
                <p className="text-[#6E6864] text-xs mb-6 text-center max-w-sm">Dữ liệu chứng từ chưa được đồng bộ hoặc liên kết truy cập đã hết hiệu lực.</p>
                <button 
                    onClick={() => window.close()}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:from-[#AA7C11] hover:to-[#8C620C] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
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
        <div className="h-screen w-screen bg-[#F5F2EA] text-[#2D2A26] font-sans p-6 overflow-hidden flex flex-col print:bg-white print:text-black print:p-0 print:h-auto print:w-auto print:overflow-visible">
            <div className="w-full flex-1 flex flex-col min-h-0 space-y-4">
                
                {/* Header Action Panel (hidden during print) */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-white border border-[#D4B055]/35 p-4 rounded-xl shadow-[0_15px_45px_rgba(139,115,85,0.06)] shrink-0 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isThu ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                            {isThu ? <ArrowUpRight className="w-5 h-5 stroke-[2.5]" /> : <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold ${isThu ? 'text-emerald-600' : 'text-rose-600'} tracking-widest`}>
                                    {isThu ? 'Biên nhận doanh thu cư dân' : 'Chứng từ quyết toán chi quỹ'}
                                </span>
                                <span className={`w-1.5 h-1.5 rounded-full ${isThu ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                            </div>
                            <h2 className="text-xs font-bold text-slate-800 mt-0.5">Mã số chứng từ: {docNo}</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isPending && (
                            <>
                                <button
                                    onClick={() => triggerConfirm(1)}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border border-emerald-500 text-xs font-black uppercase tracking-wider transition-all shadow-md"
                                >
                                    Xác nhận duyệt
                                </button>
                                <button
                                    onClick={() => triggerConfirm(2)}
                                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl border border-rose-500 text-xs font-black uppercase tracking-wider transition-all shadow-md"
                                >
                                    Từ chối
                                </button>
                            </>
                        )}
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FAF6EE] hover:bg-[#F3EBE0] text-[#8A6212] rounded-xl border border-[#E5D2A6]/80 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                        >
                            <Printer className="w-4 h-4 text-[#D4AF37]" />
                            In Hóa Đơn
                        </button>
                        <button
                            onClick={() => window.close()}
                            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Đóng Tab
                        </button>
                    </div>
                </div>

                {isThu ? (
                    /* ================= 5-STAR LUXURY HOTEL RECEIPT ================= */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 print:mt-0 print:grid-cols-1 print:gap-0 print:block">
                        <div className="lg:col-span-3 flex flex-col h-full print:h-auto">
                            {/* Paper textured card */}
                            <div className="relative overflow-hidden bg-white border border-[#D4B055]/35 rounded-2xl p-6 shadow-[0_25px_60px_rgba(139,115,85,0.12)] flex flex-col justify-between flex-1 print:border-black print:p-0 print:shadow-none print:bg-white print:text-black print:h-auto">
                                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                                
                                <div>
                                    {/* Header section */}
                                    <div className="flex justify-between items-start border-b border-[#E5D2A6]/40 pb-4 mb-4 print:border-black">
                                        <div>
                                            <h3 className="text-2xl font-hotel-title font-bold tracking-wide text-[#AA7C11] flex items-center gap-2">
                                                NovaStay <span className="text-[10px] font-sans uppercase font-black tracking-widest px-2 py-0.5 bg-[#D4AF37]/10 text-[#AA7C11] border border-[#D4AF37]/20 rounded-md">Elite Collection</span>
                                            </h3>
                                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1 print:text-black">BIÊN LAI XÁC NHẬN DOANH THU (RECEIPT)</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border bg-[#F1FAF5] text-emerald-700 border-emerald-200">
                                                ĐÃ THU ĐỐI SOÁT
                                            </span>
                                        </div>
                                    </div>

                                    {/* Luxury Paper Amount Card */}
                                    <div className="text-center py-8 px-4 rounded-xl bg-[#FFFDF9] border border-[#D4B055]/40 mb-6 relative shadow-inner">
                                        {isApproved && (
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none transform rotate-12 opacity-80 print:opacity-100">
                                                <div className="border-4 border-emerald-600/55 rounded-full px-5 py-2.5 text-emerald-600 font-hotel-title font-black text-xs tracking-widest uppercase bg-white/90">
                                                    ★ ĐÃ THU TIỀN ★
                                                </div>
                                            </div>
                                        )}
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.25em] print:text-black">TỔNG SỐ TIỀN THANH TOÁN</span>
                                        <div className="text-4xl md:text-5xl font-hotel-title font-bold mt-2 tracking-tight text-[#AA7C11] print:text-black">
                                            {formatCurrency(amountVal)}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono font-bold mt-2 uppercase tracking-wider">Mã chứng từ: {realId || 'MOCK-RECEIPT-ID'}</div>
                                    </div>

                                    {/* Grid parameters */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 text-xs pb-6 border-b border-[#E5D2A6]/40">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Cơ sở lưu trú
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">
                                                {getFacilityName(detailData.propertyId || facility)}
                                                {detailData.roomNumber && ` - Phòng ${detailData.roomNumber}`}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Thời điểm lập phiếu
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">{formattedDate}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Nội dung thu phí
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">{categoryName}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Khách hàng thanh toán
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">{personName}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Phương thức giao dịch
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">
                                                {detailData.paymentMethodRaw === 'BankTransfer' ? 'Chuyển khoản điện tử' : (detailData.paymentMethodRaw === 'Cash' ? 'Giao dịch tiền mặt' : detailData.paymentMethodRaw || 'Chuyển khoản')}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Số hóa đơn liên kết
                                            </span>
                                            <span className="font-mono font-bold text-[#AA7C11] text-sm block print:text-black">{detailData.referenceCode || 'Không có'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="pt-4">
                                    <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2">
                                        <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Mô tả chi tiết hóa đơn
                                    </span>
                                    <p className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5D2A6]/50 leading-relaxed text-[#5C5753] text-xs print:bg-transparent print:border-none print:p-0 print:text-black">
                                        {detailData.description || 'Không có ghi chú diễn giải kèm theo cho chứng từ này.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column details */}
                        <div className="flex flex-col gap-6 h-full print:hidden">
                            <div className="bg-white border border-[#D4B055]/35 rounded-2xl p-5 shadow-[0_25px_60px_rgba(139,115,85,0.12)] flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E5D2A6]/40">
                                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Đối soát tự động</h3>
                                    </div>

                                    <div className="mb-6 text-center">
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            ĐÃ HOÀN TẤT THU
                                        </span>
                                    </div>

                                    {/* Timeline step */}
                                    <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E5D2A6] text-xs">
                                        <div className="flex items-start gap-4 relative">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 z-10 bg-white">
                                                <span className="w-2 h-2 rounded-full bg-emerald-555 bg-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">Lập phiếu biên nhận</h4>
                                                <p className="text-[10px] text-gray-500 mt-1">{createdDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 relative">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 z-10 bg-white">
                                                <span className="w-2 h-2 rounded-full bg-emerald-555 bg-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">Ghi nhận tài chính</h4>
                                                <p className="text-[10px] text-gray-500 mt-1">Đối soát ngân hàng</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 relative">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center shrink-0 z-10 bg-white shadow-md">
                                                <span className="w-2 h-2 rounded-full bg-emerald-555 bg-emerald-500 animate-pulse" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-emerald-600">Quyết toán biên nhận</h4>
                                                <p className="text-[10px] text-gray-500 mt-1">{formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-[#E5D2A6]/40">
                                    <div className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase">Chuẩn mã hóa tài chính</div>
                                    <div className="text-xs font-serif font-bold text-slate-700 mt-1">Giao dịch bảo mật 5 sao</div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden bg-gradient-to-tr from-[#FCFAF2] to-[#FAF8F5] border border-dashed border-[#D4B055]/50 rounded-2xl p-5 text-xs text-[#5C5753] flex gap-4 print:hidden shadow-sm shrink-0">
                                <div className="p-2 bg-[#D4AF37]/10 text-[#AA7C11] rounded-xl shrink-0 h-fit">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-hotel-title font-bold text-sm uppercase tracking-widest text-[#AA7C11]">Thông tin bản quyền & In ấn</h4>
                                    <p className="leading-relaxed font-light text-xs text-[#6E6864]">
                                        Chứng từ điện tử này thuộc bản quyền <span className="font-semibold text-slate-800">NovaStay Luxury Club</span>. Vui lòng nhấp vào <span className="font-semibold text-slate-800">In Hóa Đơn</span> để kết xuất bản giấy chất lượng cao phục vụ lưu trữ kế toán.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ================= 5-STAR LUXURY HOTEL EXPENSE VOUCHER ================= */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 print:mt-0 print:grid-cols-1 print:gap-0 print:block">
                        <div className="lg:col-span-3 flex flex-col h-full print:h-auto">
                            {/* Paper textured card */}
                            <div className="relative overflow-hidden bg-white border border-[#D4B055]/35 rounded-2xl p-6 shadow-[0_25px_60px_rgba(139,115,85,0.12)] flex flex-col justify-between flex-1 print:border-black print:p-0 print:shadow-none print:bg-white print:text-black print:h-auto">
                                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                                
                                <div>
                                    {/* Header section */}
                                    <div className="flex justify-between items-start border-b border-[#E5D2A6]/40 pb-4 mb-4 print:border-black">
                                        <div>
                                            <h3 className="text-2xl font-hotel-title font-bold tracking-wide text-[#AA7C11] flex items-center gap-2">
                                                NovaStay <span className="text-[10px] font-sans uppercase font-black tracking-widest px-2 py-0.5 bg-[#D4AF37]/10 text-[#AA7C11] border border-[#D4AF37]/20 rounded-md">Debit Portal</span>
                                            </h3>
                                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1 print:text-black">ỦY NHIỆM CHI QUYẾT TOÁN HẠNG MỤC (VOUCHER)</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border bg-rose-50 text-rose-700 border-rose-200">
                                                ĐÃ GIẢI NGÂN
                                            </span>
                                        </div>
                                    </div>

                                    {/* Luxury Paper Amount Card */}
                                    <div className="text-center py-8 px-4 rounded-xl bg-[#FFFDF9] border border-[#D4B055]/40 mb-6 relative shadow-inner">
                                        {isApproved && (
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none transform rotate-12 opacity-80 print:opacity-100">
                                                <div className="border-4 border-rose-600/55 rounded-full px-5 py-2.5 text-rose-600 font-hotel-title font-black text-xs tracking-widest uppercase bg-white/90">
                                                    ★ ĐÃ XUẤT QUỸ ★
                                                </div>
                                            </div>
                                        )}
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.25em] print:text-black">TỔNG GIÁ TRỊ GIẢI NGÂN CHI</span>
                                        <div className="text-4xl md:text-5xl font-hotel-title font-bold mt-2 tracking-tight text-rose-600 print:text-black">
                                            -{formatCurrency(amountVal)}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono font-bold mt-2 uppercase tracking-wider">Mã chứng từ: {realId || 'MOCK-EXPENSE-ID'}</div>
                                    </div>

                                    {/* Grid parameters */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 text-xs pb-6 border-b border-[#E5D2A6]/40">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Đơn vị giải ngân chi
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">
                                                {getFacilityName(detailData.propertyId || facility)}
                                                {detailData.roomNumber && ` - Phòng ${detailData.roomNumber}`}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Ngày thực hiện giao dịch
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">{formattedDate}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Hạng mục chi trả
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">{categoryName}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Đơn vị thụ hưởng (Đối tác)
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">{personName}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Phương thức trích chi
                                            </span>
                                            <span className="font-serif font-bold text-slate-800 text-sm block print:text-black">
                                                {detailData.paymentMethodRaw === 'BankTransfer' ? 'Chuyển khoản điện tử' : (detailData.paymentMethodRaw === 'Cash' ? 'Chi tiền mặt' : detailData.paymentMethodRaw || 'Chuyển khoản')}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                Hóa đơn đính kèm
                                            </span>
                                            <span className="font-mono font-bold text-[#AA7C11] text-sm block print:text-black">{detailData.referenceCode || 'Không có'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="pt-4">
                                    <span className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2">
                                        <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        Mô tả chi tiết lý do chi
                                    </span>
                                    <p className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5D2A6]/50 leading-relaxed text-[#5C5753] text-xs print:bg-transparent print:border-none print:p-0 print:text-black">
                                        {detailData.description || 'Không có ghi chú diễn giải kèm theo cho chứng từ này.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column details */}
                        <div className="flex flex-col gap-6 h-full print:hidden">
                            <div className="bg-white border border-[#D4B055]/35 rounded-2xl p-5 shadow-[0_25px_60px_rgba(139,115,85,0.12)] flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E5D2A6]/40">
                                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Trạng thái giải ngân</h3>
                                    </div>

                                    <div className="mb-6 text-center">
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border bg-rose-50 text-rose-700 border-rose-200">
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                            XUẤT QUỸ THÀNH CÔNG
                                        </span>
                                    </div>

                                    {/* Timeline step */}
                                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E5D2A6] text-xs">
                                        <div className="flex items-start gap-4 relative">
                                            <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 z-10 bg-white">
                                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">Yêu cầu chi quỹ</h4>
                                                <p className="text-[10px] text-gray-500 mt-1">{createdDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 relative">
                                            <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 z-10 bg-white">
                                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">Phê duyệt chi ngân sách</h4>
                                                <p className="text-[10px] text-gray-500 mt-1">Cấp quản lý đồng ý</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 relative">
                                            <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-300 flex items-center justify-center shrink-0 z-10 bg-white shadow-md">
                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-rose-600">Đã xuất quỹ thành công</h4>
                                                <p className="text-[10px] text-gray-500 mt-1">{formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-[#E5D2A6]/40">
                                    <div className="text-[10px] text-[#8C857B] font-bold tracking-wider uppercase">Chuẩn mã hóa tài chính</div>
                                    <div className="text-xs font-serif font-bold text-slate-700 mt-1">Giao dịch bảo mật 5 sao</div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden bg-gradient-to-tr from-[#FCFAF2] to-[#FAF8F5] border border-dashed border-[#D4B055]/50 rounded-2xl p-5 text-xs text-[#5C5753] flex gap-4 print:hidden shadow-sm shrink-0">
                                <div className="p-2 bg-[#D4AF37]/10 text-[#AA7C11] rounded-xl shrink-0 h-fit">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-hotel-title font-bold text-sm uppercase tracking-widest text-[#AA7C11]">Thông tin bản quyền & In ấn</h4>
                                    <p className="leading-relaxed font-light text-xs text-[#6E6864]">
                                        Chứng từ chi điện tử này đã hoàn tất giải ngân chính thức. Vui lòng bấm <span className="font-semibold text-slate-800">In Hóa Đơn</span> để kết xuất bản giấy chất lượng cao phục vụ trích lục chứng từ kế toán.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Signature block for physical printing */}
                {isThu ? (
                    <div className="hidden print:grid grid-cols-2 gap-12 text-center mt-12 text-xs font-black uppercase tracking-widest text-black">
                        <div>
                            <p className="mb-14 border-b border-black/10 pb-2">Người Lập Phiếu</p>
                            <p className="italic text-gray-400 text-[10px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div>
                            <p className="mb-14 border-b border-black/10 pb-2">Khách Hàng Nộp Tiền</p>
                            <p className="italic text-gray-400 text-[10px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                        </div>
                    </div>
                ) : (
                    <div className="hidden print:grid grid-cols-4 gap-6 text-center mt-12 text-[9px] font-black uppercase tracking-widest text-black">
                        <div>
                            <p className="mb-14 border-b border-black/10 pb-2">Giám Đốc (Phê duyệt)</p>
                            <p className="italic text-gray-400 text-[8px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div>
                            <p className="mb-14 border-b border-black/10 pb-2">Kế Toán Trưởng</p>
                            <p className="italic text-gray-400 text-[8px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div>
                            <p className="mb-14 border-b border-black/10 pb-2">Thủ Quỹ</p>
                            <p className="italic text-gray-400 text-[8px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div>
                            <p className="mb-14 border-b border-black/10 pb-2">Người Nhận Tiền</p>
                            <p className="italic text-gray-400 text-[8px] lowercase font-normal">(Ký và ghi rõ họ tên)</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Modern Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
                    <div className="relative w-full max-w-sm rounded-2xl border border-[#D4B055]/35 bg-white p-6 shadow-2xl transition-all duration-300 transform scale-100 text-slate-800 space-y-4 z-50">
                        <div className="flex items-center gap-3 pb-3 border-b border-[#E5D2A6]/40">
                            <div className="p-2 bg-[#D4AF37]/10 text-[#AA7C11] rounded-xl">
                                <Award className="w-5 h-5 animate-pulse" />
                            </div>
                            <h4 className="font-hotel-title font-bold text-sm uppercase tracking-wider text-[#AA7C11]">
                                {confirmModal.title}
                            </h4>
                        </div>
                        <p className="text-xs font-serif leading-relaxed text-slate-600">
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                }}
                                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#AA7C11] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Elegant luxury toast message */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 print:hidden">
                    <div className={`flex items-center space-x-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-md max-w-sm ${toast.type === 'success'
                        ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50/95 border-rose-200 text-rose-800'
                        }`}>
                        <div className={`p-1.5 rounded-lg ${toast.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 font-bold'
                            : 'bg-rose-500/10 text-rose-600 font-bold'
                            }`}>
                            {toast.type === 'success' ? '✓' : '✗'}
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-none">Thông báo</p>
                            <p className="text-[11px] opacity-95 mt-1 font-medium">{toast.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
