import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

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
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const triggerConfirm = (statusVal) => {
        const labelText = tx.type === 'Thu' ? 'phiếu thu' : 'phiếu chi';
        const actionText = statusVal === 1 ? 'duyệt và quyết toán' : 'từ chối duyệt';
        setConfirmModal({
            isOpen: true,
            title: statusVal === 1 ? 'Phê Duyệt Chứng Từ' : 'Từ Chối Chứng Từ',
            message: `Bạn có chắc chắn muốn ${actionText} ${labelText} này không? Hành động này sẽ cập nhật trực tiếp vào hệ thống sổ cái tài chính.`,
            onConfirm: () => handleUpdateStatus(statusVal)
        });
    };

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
        if (!isOpen || !tx) return;

        const fetchDetail = async () => {
            setLoadingDetail(true);
            setDetailData(null);

            if (!tx.realId) {
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

                const res = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                        'accessToken': accessToken,
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setDetailData(data);
                } else {
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

    const handleUpdateStatus = async (newStatusValue) => {
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
            const propertyId = tx.facility;
            const receiptId = tx.realId;

            // Fallback for mocks
            if (!receiptId || receiptId === 'mock') {
                showToast('Cập nhật trạng thái thành công! (Mock)', 'success');
                const statusString = newStatusValue === 1 ? 'Approved' : (newStatusValue === 2 ? 'Rejected' : 'Cancelled');
                setDetailData(prev => prev ? { ...prev, statusRaw: statusString } : null);
                if (tx) {
                    setTransactions(prev => prev.map(item => {
                        if (item.id === tx.id) {
                            return { ...item, status: newStatusValue === 1 ? 'Success' : 'Overdue' };
                        }
                        return item;
                    }));
                }
                return;
            }

            const typeSegment = tx.type === 'Thu' ? 'income-receipts' : 'expenses';
            const endpoint = `${API_ROOT}/api/organizations/${organizationId}/properties/${propertyId}/${typeSegment}/${receiptId}/status`;
            
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
                const label = tx.type === 'Thu' ? 'phiếu thu' : 'phiếu chi';
                showToast(newStatusValue === 1 ? `Xác nhận duyệt ${label} thành công!` : `Từ chối duyệt ${label} thành công!`, 'success');
                const statusString = newStatusValue === 1 ? 'Approved' : (newStatusValue === 2 ? 'Rejected' : 'Cancelled');
                setDetailData(prev => prev ? { ...prev, statusRaw: statusString } : null);
                if (tx) {
                    setTransactions(prev => prev.map(item => {
                        if (item.realId === receiptId) {
                            return { ...item, status: newStatusValue === 1 ? 'Success' : 'Overdue' };
                        }
                        return item;
                    }));
                }
            } else {
                showToast('Không thể cập nhật trạng thái phiếu thu. Vui lòng thử lại!', 'error');
            }
        } catch (err) {
            console.error('Update status error:', err);
            showToast('Lỗi kết nối máy chủ', 'error');
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
                    tx?.type === 'Thu' ? (
                        /* Phiếu Thu Modal View */
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className={`p-4 rounded-xl border bg-emerald-500/[0.02] border-emerald-500/20 flex justify-between items-center`}>
                                <div>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.muted}`}>Số phiếu thu</span>
                                    <div className="text-base font-mono font-bold text-emerald-400">
                                        {detailData.receiptNumber || 'N/A'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.muted}`}>Giá trị thực thu</span>
                                    <div className="text-lg font-black text-emerald-500">
                                        +{formatCurrency(detailData.amount)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Hạng mục thu</span>
                                    <span className="font-semibold text-white">
                                        {INCOME_CATEGORY_MAP[detailData.incomeType] || detailData.incomeCategoryName || 'Thu khác'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Cơ sở quản lý</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {getFacilityName(detailData.propertyId || detailData.property_id || tx?.facility)}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Khách hàng nộp tiền</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.payerName || 'Khách nộp'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Cư dân liên kết</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.residentName || 'Không có liên kết'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Phòng phát sinh</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.roomNumber ? `Phòng ${detailData.roomNumber}` : 'Hệ thống'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Phương thức nhận</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.paymentMethodRaw === 'BankTransfer' ? 'Chuyển khoản' : (detailData.paymentMethodRaw === 'Cash' ? 'Tiền mặt' : detailData.paymentMethodRaw || 'Chuyển khoản')}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Ngày hạch toán thu</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.collectedAt ? new Date(detailData.collectedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Trạng thái quyết toán</span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                            {detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success' ? 'Đã quyết toán' : detailData.statusRaw === 'Pending' ? 'Chờ kiểm tra' : 'Treo nợ'}
                                        </span>

                                        <select
                                            value={detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success' ? 'Success' : detailData.statusRaw}
                                            onChange={(e) => handleChangeStatusMock(e.target.value)}
                                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all cursor-pointer ${isDarkMode
                                                    ? 'bg-[#161622] border-[#2A2518] text-[#10b981] focus:border-emerald-500'
                                                    : 'bg-[#FFF9EC] border-[#E5D4AD] text-emerald-600 focus:border-emerald-500'
                                                }`}
                                        >
                                            <option value="Success">Quyết toán</option>
                                            <option value="Pending">Chờ duyệt</option>
                                            <option value="Overdue">Báo trễ hạn</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Mã tham chiếu / Số hóa đơn</span>
                                    <span className="font-mono font-semibold text-emerald-300">{detailData.referenceCode || 'Không có'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Diễn giải chi tiết</span>
                                    <p className="p-3 rounded-xl border leading-relaxed bg-emerald-500/[0.01] border-emerald-500/10 text-gray-300 text-xs">
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

                            <div className="flex justify-end gap-3 pt-2">
                                {(detailData.statusRaw === 'Pending' || detailData.status === 'Pending' || detailData.statusRaw === 0 || detailData.status === 0) && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => triggerConfirm(1)}
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                                        >
                                            Xác nhận duyệt
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerConfirm(2)}
                                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                                        >
                                            Từ chối
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#AA7C11] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Phiếu Chi Modal View */
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className={`p-4 rounded-xl border bg-rose-500/[0.02] border-rose-500/20 flex justify-between items-center`}>
                                <div>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.muted}`}>Số phiếu chi</span>
                                    <div className="text-base font-mono font-bold text-rose-400">
                                        {detailData.expenseNumber || 'N/A'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.muted}`}>Giá trị chi xuất</span>
                                    <div className="text-lg font-black text-rose-500">
                                        -{formatCurrency(detailData.amount)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Hạng mục chi</span>
                                    <span className="font-semibold text-white">
                                        {EXPENSE_CATEGORY_MAP[detailData.expenseType] || detailData.expenseCategoryName || 'Chi khác'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Cơ sở chi trả</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {getFacilityName(detailData.propertyId || detailData.property_id || tx?.facility)}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Người nhận tiền (Đối tác)</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.payeeName || 'Đối tác'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Số phòng phát sinh</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.roomNumber ? `Phòng ${detailData.roomNumber}` : 'Hệ thống'}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Phương thức giải ngân</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.paymentMethodRaw === 'BankTransfer' ? 'Chuyển khoản trực tiếp' : (detailData.paymentMethodRaw === 'Cash' ? 'Chi tiền mặt' : detailData.paymentMethodRaw || 'Chuyển khoản')}
                                    </span>
                                </div>
                                <div>
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Ngày hạch toán chi</span>
                                    <span className={`font-semibold ${theme.title}`}>
                                        {detailData.spentAt ? new Date(detailData.spentAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Trạng thái xuất quỹ</span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold border bg-rose-500/10 text-rose-500 border-rose-500/20">
                                            {detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success' ? 'Đã xuất quỹ' : detailData.statusRaw === 'Pending' ? 'Chờ kiểm duyệt' : 'Hủy bỏ'}
                                        </span>

                                        <select
                                            value={detailData.statusRaw === 'Approved' || detailData.statusRaw === 'Success' ? 'Success' : detailData.statusRaw}
                                            onChange={(e) => handleChangeStatusMock(e.target.value)}
                                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all cursor-pointer ${isDarkMode
                                                    ? 'bg-[#161622] border-[#2A2518] text-[#f43f5e] focus:border-rose-500'
                                                    : 'bg-[#FFF9EC] border-[#E5D4AD] text-rose-600 focus:border-rose-500'
                                                }`}
                                        >
                                            <option value="Success">Quyết toán chi</option>
                                            <option value="Pending">Chờ duyệt chi</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Số hóa đơn liên quan</span>
                                    <span className="font-mono font-semibold text-rose-300">{detailData.referenceCode || 'Không có'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`block font-bold mb-1 ${theme.muted}`}>Diễn giải chi tiết</span>
                                    <p className="p-3 rounded-xl border leading-relaxed bg-rose-500/[0.01] border-rose-500/10 text-gray-300 text-xs">
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

                            <div className="flex justify-end gap-3 pt-2">
                                {(detailData.statusRaw === 'Pending' || detailData.status === 'Pending' || detailData.statusRaw === 0 || detailData.status === 0) && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => triggerConfirm(1)}
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                                        >
                                            Xác nhận duyệt
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerConfirm(2)}
                                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                                        >
                                            Từ chối
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#AA7C11] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className={`text-center py-6 ${theme.muted}`}>Không tìm thấy dữ liệu.</div>
                )}
            </div>

            {/* Modern Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
                    <div className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl transition-all duration-300 transform scale-100 space-y-4 z-50 ${theme.panel}`}>
                        <div className={`flex items-center gap-3 pb-3 border-b ${theme.divider}`}>
                            <div className="p-2 bg-[#D4AF37]/10 text-[#AA7C11] rounded-xl">
                                <Award className="w-5 h-5 animate-pulse" />
                            </div>
                            <h4 className="font-hotel-title font-bold text-sm uppercase tracking-wider text-[#AA7C11]">
                                {confirmModal.title}
                            </h4>
                        </div>
                        <p className={`text-xs font-serif leading-relaxed opacity-90 ${theme.title}`}>
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${isDarkMode 
                                    ? 'bg-[#1b1b29] hover:bg-[#252538] text-gray-300' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
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
        </div>
    );
}
