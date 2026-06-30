import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const PAYMENT_METHOD_MAP = {
    0: 'Tiền mặt',
    1: 'Chuyển khoản',
    2: 'Ví điện tử'
};

export default function TransactionDetailSubPage({
    isOpen,
    onClose,
    tx,
    isDarkMode,
    getFacilityName,
    showToast,
    setTransactions,
    INCOME_CATEGORY_MAP,
    EXPENSE_CATEGORY_MAP
}) {
    const [detailData, setDetailData] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const theme = isDarkMode
        ? {
            panel: 'bg-[#11111A] border-[#2A2518]',
            panelSoft: 'bg-[#161622] border-[#2A2518]/40',
            title: 'text-white',
            muted: 'text-gray-400',
            mutedSoft: 'text-gray-500',
            divider: 'border-[#2A2518]/40'
        }
        : {
            panel: 'bg-white border-[#E5D4AD]',
            panelSoft: 'bg-[#FFF9EC] border-[#E5D4AD]',
            title: 'text-slate-950',
            muted: 'text-slate-500',
            mutedSoft: 'text-slate-400',
            divider: 'border-[#E5D4AD]'
        };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
    };

    useEffect(() => {
        console.log('TransactionDetailSubPage useEffect triggered, isOpen:', isOpen, 'tx:', tx);
        if (!isOpen || !tx) return;

        const fetchDetail = async () => {
            console.log('fetchDetail started for tx:', tx);
            setLoadingDetail(true);
            setDetailData(null);

            if (!tx.realId) {
                console.log('tx.realId is missing, using local mock fallback');
                // Local mock transaction detail fallback
                if (tx.type === 'Thu') {
                    setDetailData({
                        receiptNumber: tx.id,
                        incomeCategoryName: tx.category,
                        payerName: tx.tenant,
                        roomNumber: tx.room.replace('Phòng ', ''),
                        amount: Number(tx.amount.replace(/[^0-9]/g, '')),
                        collectedAt: new Date().toISOString(),
                        paymentMethodRaw: tx.method,
                        statusRaw: tx.status,
                        description: 'Chứng từ tạo thủ công trên hệ thống',
                        isLocalMock: true
                    });
                } else {
                    setDetailData({
                        expenseNumber: tx.id,
                        expenseCategoryName: tx.category,
                        payeeName: tx.tenant,
                        roomNumber: tx.room.replace('Phòng ', ''),
                        amount: Number(tx.amount.replace(/[^0-9]/g, '')),
                        spentAt: new Date().toISOString(),
                        paymentMethodRaw: tx.method,
                        statusRaw: tx.status,
                        description: 'Chứng từ tạo thủ công trên hệ thống',
                        isLocalMock: true
                    });
                }
                setLoadingDetail(false);
                return;
            }

            try {
                const accountData = localStorage.getItem('ns_account');
                let organizationId = 'a31bfed6-ab82-44ac-9bd1-91a5c8fce4bb';
                let accessToken = '';
                if (accountData) {
                    try {
                        const parsed = JSON.parse(accountData);
                        organizationId = parsed.organizationId || organizationId;
                        accessToken = parsed.accessToken || '';
                    } catch (e) {
                        console.warn('Failed to parse ns_account', e);
                    }
                }

                const API_ROOT = import.meta.env.VITE_API_URL || '';
                const endpoint = tx.type === 'Thu'
                    ? `${API_ROOT}/api/organizations/${organizationId}/properties/${tx.facility}/income-receipts/${tx.realId}`
                    : `${API_ROOT}/api/organizations/${organizationId}/properties/${tx.facility}/expenses/${tx.realId}`;

                console.log('Fetching endpoint:', endpoint);
                const res = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                        'accessToken': accessToken,
                    }
                });

                console.log('Fetch response status:', res.status);
                if (res.ok) {
                    const data = await res.json();
                    console.log('Fetch succeeded, data:', data);
                    setDetailData(data);
                } else {
                    console.error('Fetch failed with status:', res.status);
                    showToast(`Không thể tải thông tin chi tiết phiếu ${tx.type === 'Thu' ? 'thu' : 'chi'}`, 'error');
                }
            } catch (err) {
                console.error('Fetch transaction detail error:', err);
                showToast('Lỗi kết nối máy chủ', 'error');
            } finally {
                setLoadingDetail(false);
            }
        };

        fetchDetail();
    }, [isOpen, tx]);

    const handleChangeStatusMock = (newStatus) => {
        setDetailData(prev => prev ? { ...prev, statusRaw: newStatus } : null);
        showToast('Cập nhật trạng thái thành công! (Sẵn sàng kết nối API backend)', 'success');

        if (tx) {
            setTransactions(prev => prev.map(item => {
                if (item.id === tx.id) {
                    const statusText = newStatus === 'Success' || newStatus === 'Approved' ? 'Success' : (newStatus === 'Pending' ? 'Pending' : 'Overdue');
                    return { ...item, status: statusText };
                }
                return item;
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-xl rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 ${theme.panel}`}>
                <button
                    type="button"
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-colors ${isDarkMode
                        ? 'border-[#2A2518] hover:bg-white/5 text-gray-400 hover:text-white'
                        : 'border-[#E5D4AD] hover:bg-amber-50 text-slate-500 hover:text-slate-900'
                        }`}
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3.5 mb-6">
                    <div className={`p-2.5 rounded-xl ${tx?.type === 'Thu' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-500 border border-rose-500/25'}`}>
                        {tx?.type === 'Thu' ? <ArrowUpRight className="w-5 h-5 stroke-[2.5]" /> : <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />}
                    </div>
                    <div>
                        <h3 className={`text-lg font-black tracking-tight ${theme.title}`}>
                            {tx?.type === 'Thu' ? 'Chi Tiết Phiếu Thu' : 'Chi Tiết Phiếu Chi'}
                        </h3>
                        <p className={`text-xs ${theme.muted}`}>
                            {tx?.type === 'Thu' ? 'Thông tin hạch toán chi tiết của dòng tiền vào' : 'Thông tin hạch toán chi tiết của dòng tiền ra'}
                        </p>
                    </div>
                </div>

                {loadingDetail ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className={`text-xs mt-3 ${theme.muted}`}>Đang tải thông tin...</span>
                    </div>
                ) : detailData ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Info Card */}
                        <div className={`p-4 rounded-xl border ${theme.panelSoft} flex justify-between items-center`}>
                            <div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.muted}`}>Số phiếu</span>
                                <div className={`text-base font-mono font-bold ${theme.title}`}>
                                    {tx?.type === 'Thu' ? (detailData.receiptNumber || 'N/A') : (detailData.expenseNumber || 'N/A')}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.muted}`}>Giá trị</span>
                                <div className={`text-lg font-black ${tx?.type === 'Thu' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tx?.type === 'Thu' ? '+' : '-'}{formatCurrency(detailData.amount)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>
                                    {tx?.type === 'Thu' ? 'Hạng mục thu' : 'Hạng mục chi'}
                                </span>
                                <span className={`font-semibold ${theme.title}`}>
                                    {tx?.type === 'Thu'
                                        ? (INCOME_CATEGORY_MAP[detailData.incomeType] || detailData.incomeCategoryName || 'Thu khác')
                                        : (EXPENSE_CATEGORY_MAP[detailData.expenseType] || detailData.expenseCategoryName || 'Chi khác')
                                    }
                                </span>
                            </div>
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Cơ sở quản lý / chi trả</span>
                                <span className={`font-semibold ${theme.title}`}>
                                    {getFacilityName(detailData.propertyId || detailData.property_id || tx?.facility)}
                                </span>
                            </div>
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>
                                    {tx?.type === 'Thu' ? 'Người nộp tiền (Khách thuê)' : 'Người nhận tiền (Đối tác)'}
                                </span>
                                <span className={`font-semibold ${theme.title}`}>
                                    {tx?.type === 'Thu'
                                        ? (detailData.payerName || 'Khách nộp')
                                        : (detailData.payeeName || 'Đối tác')
                                    }
                                </span>
                            </div>
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Cư dân liên kết</span>
                                <span className={`font-semibold ${theme.title}`}>
                                    {tx?.type === 'Thu'
                                        ? (detailData.residentName || 'Không có liên kết')
                                        : 'Không có'
                                    }
                                </span>
                            </div>
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Số phòng</span>
                                <span className={`font-semibold ${theme.title}`}>
                                    {detailData.roomNumber ? `Phòng ${detailData.roomNumber}` : 'Hệ thống'}
                                </span>
                            </div>
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Phương thức thanh toán</span>
                                <span className={`font-semibold ${theme.title}`}>
                                    {detailData.paymentMethodRaw === 'BankTransfer' ? 'Chuyển khoản' : (detailData.paymentMethodRaw === 'Cash' ? 'Tiền mặt' : detailData.paymentMethodRaw || 'Chuyển khoản')}
                                </span>
                            </div>
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Ngày hạch toán</span>
                                <span className={`font-semibold ${theme.title}`}>
                                    {tx?.type === 'Thu'
                                        ? (detailData.collectedAt ? new Date(detailData.collectedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A')
                                        : (detailData.spentAt ? new Date(detailData.spentAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A')
                                    }
                                </span>
                            </div>
                            <div>
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Trạng thái</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold border ${detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success'
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : detailData.statusRaw === 'Pending'
                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                        }`}>
                                        {detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success' ? 'Đã quyết toán' : detailData.statusRaw === 'Pending' ? 'Chờ kiểm tra' : 'Treo nợ'}
                                    </span>

                                    <select
                                        value={detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success' ? 'Success' : detailData.statusRaw}
                                        onChange={(e) => handleChangeStatusMock(e.target.value)}
                                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all cursor-pointer ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37] focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-[#AA7C11] focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        <option value="Success">Quyết toán</option>
                                        <option value="Pending">Chờ duyệt</option>
                                        {tx?.type === 'Thu' && (
                                            <option value="Overdue">Báo trễ hạn</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Mã tham chiếu / Số Hóa đơn</span>
                                <span className={`font-mono font-semibold ${theme.title}`}>{detailData.referenceCode || 'Không có'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className={`block font-bold mb-1 ${theme.muted}`}>Diễn giải chi tiết</span>
                                <p className={`p-3 rounded-xl border leading-relaxed ${theme.panelSoft} ${theme.title}`}>
                                    {detailData.description || 'Không có diễn giải'}
                                </p>
                            </div>
                        </div>

                        {!detailData.isLocalMock && (
                            <div className={`pt-4 border-t text-[10px] text-gray-500 flex justify-between ${theme.divider}`}>
                                <span>Ngày tạo: {detailData.createdAt ? new Date(detailData.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                <span>Cập nhật cuối: {detailData.updatedAt ? new Date(detailData.updatedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-5 py-2.5 bg-[#D4AF37] hover:bg-[#AA7C11] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md`}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`text-center py-6 ${theme.muted}`}>Không tìm thấy dữ liệu.</div>
                )}
            </div>
        </div>
    );
}
