import { useState, useEffect } from 'react';
import {
    Receipt,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    CalendarDays,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileSpreadsheet,
    Plus,
    Building,
    User,
    Layers,
    Sparkles,
    BarChart3,
    PieChart,
    ArrowRight,
    ShieldAlert,
    X
} from 'lucide-react';

// (SUMMARY_ANALYTICS, BASE_STATS_BY_FACILITY, and COST_STRUCTURES sample data arrays removed)

// Khai báo Enum maps cho Chi phí từ C# Backend
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
    17: 'Đi lại, vận chuyển',
    18: 'Chi phí khác'
};

const PAYMENT_METHOD_MAP = {
    0: 'Tiền mặt',
    1: 'Chuyển khoản',
    2: 'Thanh toán QRCode',
    3: 'Thẻ tín dụng',
    4: 'Thẻ ghi nợ',
    5: 'Ví điện tử',
    6: 'Tài khoản định danh',
    7: 'Trích nợ tự động',
    8: 'Khác'
};

const INCOME_CATEGORY_MAP = {
    0: 'Tiền phòng',
    1: 'Tiền dịch vụ',
    2: 'Tiền điện, nước, internet...',
    3: 'Tiền cọc giữ phòng',
    4: 'Tiền đặt cọc thuê phòng',
    5: 'Phí trả chậm (trễ hạn)',
    6: 'Bồi thường hư hỏng',
    7: 'Phí gửi xe',
    8: 'Phí giặt là',
    9: 'Phí vệ sinh',
    10: 'Khoản thu khác'
};

const getPaymentMethodEnumValue = (methodStr) => {
    if (!methodStr) return 1;
    if (methodStr.includes('Tiền mặt')) return 0;
    if (methodStr.includes('Chuyển khoản')) return 1;
    if (methodStr.includes('Ví điện tử')) return 5;
    return 1;
};

const getReceiptStatusEnumValue = (statusStr) => {
    if (statusStr === 'Success') return 1;
    if (statusStr === 'Pending') return 0;
    if (statusStr === 'Overdue') return 2;
    return 1;
};

// 2. DỮ LIỆU CHI TIẾT SỔ CÁI CHỨNG TỪ (cấu trúc khởi tạo trống)
const DETAILED_LEDGER = [];

export default function AccountingDashboard({ isDarkMode = true }) {
    const [activeSubView, setActiveSubView] = useState('overview'); // overview | detailed
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Mới: State lọc theo Cơ sở
    const [facilityFilter, setFacilityFilter] = useState('All');

    // State quản lý danh sách chứng từ và trạng thái biểu mẫu
    const [transactions, setTransactions] = useState(DETAILED_LEDGER);
    const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Mới: State chứa danh sách cơ sở lấy từ API
    const [properties, setProperties] = useState([]);
    const [loadingProperties, setLoadingProperties] = useState(false);

    // Mới: State chứa danh sách khoản chi lấy từ API
    const [apiExpenses, setApiExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);

    // Mới: State chứa danh sách phiếu thu lấy từ API
    const [apiReceipts, setApiReceipts] = useState([]);
    const [loadingReceipts, setLoadingReceipts] = useState(false);

    // State cho biểu mẫu Phiếu Thu (Receipt)
    const [isOpenReceiptModal, setIsOpenReceiptModal] = useState(false);
    const [receiptId, setReceiptId] = useState('');
    const [receiptDate, setReceiptDate] = useState('');
    const [receiptTenant, setReceiptTenant] = useState('');
    const [receiptRoom, setReceiptRoom] = useState('');
    const [receiptCategory, setReceiptCategory] = useState(0);
    const [receiptMethod, setReceiptMethod] = useState('Chuyển khoản (VCB)');
    const [receiptAmount, setReceiptAmount] = useState('');
    const [receiptStatus, setReceiptStatus] = useState('Success');
    const [receiptFacility, setReceiptFacility] = useState('');
    const [receiptReference, setReceiptReference] = useState('');
    const [receiptDescription, setReceiptDescription] = useState('');
    const [isSavingReceipt, setIsSavingReceipt] = useState(false);
    const [receiptResidentId, setReceiptResidentId] = useState('');
    const [residents, setResidents] = useState([]);
    const [loadingResidents, setLoadingResidents] = useState(false);

    // State cho biểu mẫu Phiếu Chi (Expense)
    const [isOpenExpenseModal, setIsOpenExpenseModal] = useState(false);
    const [expenseId, setExpenseId] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [expensePayee, setExpensePayee] = useState('');
    const [expenseCategory, setExpenseCategory] = useState(0); // Enum value
    const [expenseMethod, setExpenseMethod] = useState(1); // Enum value
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseStatus, setExpenseStatus] = useState('Success');
    const [expenseFacility, setExpenseFacility] = useState('');
    const [expenseReference, setExpenseReference] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [isSavingExpense, setIsSavingExpense] = useState(false);

    const theme = isDarkMode
        ? {
            panel: 'bg-[#11111A] border-[#2A2518]',
            panelSoft: 'bg-[#161622] border-[#2A2518]/40',
            tableHead: 'bg-[#0F0F17]/50 border-[#2A2518]/40',
            search: 'bg-[#11111A] border-[#2A2518]/60 text-gray-200 placeholder-gray-600',
            title: 'text-white',
            muted: 'text-gray-400',
            mutedSoft: 'text-gray-500',
            divider: 'border-[#2A2518]/40',
            tableHover: 'hover:bg-white/[0.01]',
            tabActive: 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/10',
            tabIdle: 'text-gray-400 hover:text-white hover:bg-white/5'
        }
        : {
            panel: 'bg-white border-[#E5D4AD]',
            panelSoft: 'bg-[#FFF9EC] border-[#E5D4AD]',
            tableHead: 'bg-[#FFF9EC] border-[#E5D4AD]',
            search: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400',
            title: 'text-slate-950',
            muted: 'text-slate-500',
            mutedSoft: 'text-slate-400',
            divider: 'border-[#E5D4AD]',
            tableHover: 'hover:bg-amber-50/40',
            tabActive: 'bg-gradient-to-r from-[#FFF1C7] to-white text-[#8A6212] border border-[#D4AF37]/40 shadow-sm',
            tabIdle: 'text-slate-600 hover:text-slate-950 hover:bg-amber-50'
        };

    // Các hàm hỗ trợ định dạng và xử lý sự kiện
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // Hàm gọi API lấy danh sách khoản chi của các cơ sở
    const fetchExpensesForProperties = async (propsList) => {
        setLoadingExpenses(true);
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

            // Gọi API song song cho từng cơ sở để lấy danh sách khoản chi
            const promises = propsList.map(async (prop) => {
                const pId = prop.id || prop.propertyId;
                try {
                    const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/properties/${pId}/expenses`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                            'accessToken': accessToken,
                        }
                    });

                    if (!res.ok) {
                        throw new Error('Lỗi tải dữ liệu khoản chi');
                    }

                    const data = await res.json();
                    return Array.isArray(data) ? data : [];
                } catch (err) {
                    console.error(`Fetch expenses error for property ${prop.id}:`, err);
                    return [];
                }
            });

            const results = await Promise.all(promises);
            const flatExpenses = results.flat();
            setApiExpenses(flatExpenses);
        } catch (err) {
            console.error('Fetch all expenses error:', err);
        } finally {
            setLoadingExpenses(false);
        }
    };

    // Đồng bộ danh sách khoản chi và phiếu thu từ API vào sổ cái giao dịch
    useEffect(() => {
        // Giữ lại các chứng từ tự tạo bằng tay (có ID bắt đầu bằng 'TX-')
        const manualTransactions = transactions.filter(tx => tx.id && tx.id.startsWith('TX-'));

        const mappedExpenses = apiExpenses.map(exp => {
            const categoryText = EXPENSE_CATEGORY_MAP[exp.expenseType] || exp.expenseCategoryName || 'Chi khác';
            const methodText = PAYMENT_METHOD_MAP[exp.paymentMethod] || exp.paymentMethodRaw || 'Tiền mặt';

            let displayDate = '';
            if (exp.spentAt) {
                try {
                    const dateObj = new Date(exp.spentAt);
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    displayDate = `${day}/${month}/${year}`;
                } catch (e) {
                    displayDate = exp.spentAt;
                }
            }

            return {
                id: exp.expenseNumber || exp.id.substring(0, 8),
                room: exp.roomNumber ? `Phòng ${exp.roomNumber}` : 'Hệ thống',
                tenant: exp.payeeName || 'Đối tác',
                type: 'Chi',
                category: categoryText,
                amount: formatCurrency(exp.amount),
                date: displayDate,
                method: methodText,
                status: exp.statusRaw === 'Pending' ? 'Pending' : (exp.statusRaw === 'Success' || exp.statusRaw === 'Approved' ? 'Success' : 'Pending'),
                facility: exp.propertyId
            };
        });

        const mappedReceipts = apiReceipts.map(rec => {
            const categoryText = INCOME_CATEGORY_MAP[rec.incomeType] || rec.incomeCategoryName || 'Thu khác';
            const methodText = PAYMENT_METHOD_MAP[rec.paymentMethod] || rec.paymentMethodRaw || 'Chuyển khoản';

            let displayDate = '';
            if (rec.collectedAt) {
                try {
                    const dateObj = new Date(rec.collectedAt);
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    displayDate = `${day}/${month}/${year}`;
                } catch (e) {
                    displayDate = rec.collectedAt;
                }
            }

            return {
                id: rec.receiptNumber || rec.id.substring(0, 8),
                room: rec.roomNumber ? `Phòng ${rec.roomNumber}` : 'Hệ thống',
                tenant: rec.payerName || rec.residentName || 'Khách nộp',
                type: 'Thu',
                category: categoryText,
                amount: formatCurrency(rec.amount),
                date: displayDate,
                method: methodText,
                status: rec.statusRaw === 'Pending' ? 'Pending' : (rec.statusRaw === 'Success' || rec.statusRaw === 'Approved' ? 'Success' : (rec.statusRaw === 'Overdue' ? 'Overdue' : 'Success')),
                facility: rec.propertyId
            };
        });

        setTransactions([...manualTransactions, ...mappedExpenses, ...mappedReceipts]);
    }, [apiExpenses, apiReceipts]);

    // Hàm gọi API lấy danh sách cơ sở
    const fetchProperties = async () => {
        setLoadingProperties(true);
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
            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/properties`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                    'accessToken': accessToken,
                }
            });

            if (!res.ok) {
                throw new Error('Mã phản hồi từ API không thành công');
            }

            const data = await res.json();
            const items = data.items || data.data || (Array.isArray(data) ? data : []);
            setProperties(items);
            if (items.length > 0) {
                const firstId = items[0].id || items[0].propertyId;
                setReceiptFacility(firstId);
                setExpenseFacility(firstId);
            }
            fetchExpensesForProperties(items);
            fetchReceiptsForProperties(items);
        } catch (err) {
            console.error('Fetch properties error:', err);
            setProperties([]);
        } finally {
            setLoadingProperties(false);
        }
    };

    // Hàm gọi API lấy danh sách phiếu thu của các cơ sở
    const fetchReceiptsForProperties = async (propsList) => {
        setLoadingReceipts(true);
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

            // Gọi API song song cho từng cơ sở để lấy danh sách phiếu thu
            const promises = propsList.map(async (prop) => {
                const pId = prop.id || prop.propertyId;
                try {
                    const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/properties/${pId}/income-receipts`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                            'accessToken': accessToken,
                        }
                    });

                    if (!res.ok) {
                        throw new Error('Lỗi tải dữ liệu phiếu thu');
                    }

                    const data = await res.json();
                    return Array.isArray(data) ? data : [];
                } catch (err) {
                    console.error(`Fetch receipts error for property ${prop.id}:`, err);
                    return [];
                }
            });

            const results = await Promise.all(promises);
            const flatReceipts = results.flat();
            setApiReceipts(flatReceipts);
        } catch (err) {
            console.error('Fetch all receipts error:', err);
        } finally {
            setLoadingReceipts(false);
        }
    };

    // Hàm gọi API lấy danh sách cư dân
    const fetchResidents = async () => {
        setLoadingResidents(true);
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
            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/residents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                    'accessToken': accessToken,
                }
            });

            if (res.ok) {
                const data = await res.json();
                const items = Array.isArray(data) ? data : (data.items || data.data || data.residents || data || []);
                setResidents(items);
            }
        } catch (err) {
            console.error('Fetch residents error:', err);
        } finally {
            setLoadingResidents(false);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchResidents();
    }, []);

    // Tra cứu tên Cơ sở dựa theo ID
    const getFacilityName = (facId) => {
        if (facId === 'Hệ thống') return 'Hệ thống';
        if (facId === 'Cơ sở 1') return 'Cơ sở 1';
        if (facId === 'Cơ sở 2') return 'Cơ sở 2';
        const found = properties.find(p => (p.id === facId || p.propertyId === facId));
        return found ? found.propertyName : facId;
    };

    // Danh sách cơ sở hoạt động cho bộ lọc
    const activeFacilities = [
        { id: 'All', name: 'Tất cả cơ sở' },
        ...properties.map(p => ({ id: p.id || p.propertyId, name: p.propertyName })),
        { id: 'Hệ thống', name: 'Chi phí Hệ thống' }
    ];

    const openReceiptModal = () => {
        const todayObj = new Date();
        const yyyy = todayObj.getFullYear();
        const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
        const dd = String(todayObj.getDate()).padStart(2, '0');
        const rand = String(Math.floor(1000 + Math.random() * 9000));
        const receiptNo = `INC-${yyyy}${mm}${dd}-${rand}`;

        setReceiptId(receiptNo);
        setReceiptDate(`${yyyy}-${mm}-${dd}`);
        setReceiptTenant('');
        setReceiptRoom('');
        setReceiptAmount('');
        setReceiptCategory(0);
        setReceiptMethod('Chuyển khoản (VCB)');
        setReceiptStatus('Success');
        setReceiptFacility(properties[0]?.id || properties[0]?.propertyId || 'cf72d72e-5c4a-4fce-a184-e9cc997223eb');
        setReceiptReference('');
        setReceiptDescription('');
        setReceiptResidentId('');
        setIsSavingReceipt(false);
        setIsOpenReceiptModal(true);
    };

    const openExpenseModal = () => {
        const todayObj = new Date();
        const yyyy = todayObj.getFullYear();
        const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
        const dd = String(todayObj.getDate()).padStart(2, '0');
        const rand = String(Math.floor(1000 + Math.random() * 9000));
        const expenseNo = `EXP-${yyyy}${mm}${dd}-${rand}`;

        setExpenseId(expenseNo);
        setExpenseDate(`${yyyy}-${mm}-${dd}`);
        setExpensePayee('');
        setExpenseAmount('');
        setExpenseCategory(0); // Tiền điện
        setExpenseMethod(1); // Chuyển khoản
        setExpenseStatus('Success');
        setExpenseFacility(properties[0]?.id || properties[0]?.propertyId || 'cf72d72e-5c4a-4fce-a184-e9cc997223eb');
        setExpenseReference('');
        setExpenseDescription('');
        setIsOpenExpenseModal(true);
    };

    const handleReceiptSubmit = async (e) => {
        e.preventDefault();
        if (!receiptAmount || Number(receiptAmount) <= 0) {
            showToast('Vui lòng nhập số tiền hợp lệ', 'error');
            return;
        }

        setIsSavingReceipt(true);
        try {
            const accountData = localStorage.getItem('ns_account');
            let organizationId = 'a31bfed6-ab82-44ac-9bd1-91a5c8fce4bb';
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    organizationId = parsed.organizationId || organizationId;
                    accessToken = parsed.accessToken || '';
                } catch (err) {
                    console.warn('Failed to parse ns_account', err);
                }
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const collectedAtTimestamp = receiptDate ? `${receiptDate}T12:00:00` : new Date().toISOString();

            const payload = {
                incomeCategoryId: null,
                roomId: null,
                residentId: (receiptResidentId && receiptResidentId !== 'custom') ? receiptResidentId : null,
                collectedByStaffUserId: null,
                receiptNumber: receiptId,
                incomeType: receiptCategory,
                payerName: receiptTenant.trim() || null,
                amount: Number(receiptAmount),
                collectedAt: collectedAtTimestamp,
                paymentMethod: getPaymentMethodEnumValue(receiptMethod),
                status: getReceiptStatusEnumValue(receiptStatus),
                referenceCode: receiptReference || `INV-ROOM-${receiptDate ? receiptDate.replace(/-/g, '').substring(2, 8) : '062026'}-${Math.floor(1000 + Math.random() * 9000)}`,
                description: receiptDescription || `Thu ${INCOME_CATEGORY_MAP[receiptCategory]}`
            };

            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/properties/${receiptFacility}/income-receipts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                    'accessToken': accessToken,
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 201 || res.status === 200 || res.ok) {
                const numericAmount = Number(receiptAmount);
                const newTx = {
                    id: receiptId,
                    room: receiptRoom ? `Phòng ${receiptRoom.replace(/Phòng\s+/i, '')}` : 'Hệ thống',
                    tenant: receiptTenant.trim() || 'Khách nộp',
                    type: 'Thu',
                    category: INCOME_CATEGORY_MAP[receiptCategory],
                    amount: formatCurrency(numericAmount),
                    date: formatDate(receiptDate),
                    method: receiptMethod,
                    status: receiptStatus,
                    facility: receiptFacility
                };

                setTransactions(prev => [newTx, ...prev]);
                setIsOpenReceiptModal(false);
                showToast(`Tạo thành công phiếu thu ${receiptId}!`);
                setActiveSubView('detailed');
                fetchReceiptsForProperties(properties);
            } else {
                let errMsg = 'Tạo phiếu thu thất bại';
                try {
                    const errData = await res.json();
                    errMsg = errData.message || errData.error || errMsg;
                } catch (_) { }
                throw new Error(errMsg);
            }
        } catch (err) {
            console.error('Create receipt error:', err);
            showToast(err.message || 'Lỗi khi kết nối với máy chủ', 'error');
        } finally {
            setIsSavingReceipt(false);
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!expensePayee.trim() || !expenseAmount || Number(expenseAmount) <= 0) {
            showToast('Vui lòng nhập đầy đủ thông tin hợp lệ', 'error');
            return;
        }

        setIsSavingExpense(true);
        try {
            const accountData = localStorage.getItem('ns_account');
            let organizationId = 'a31bfed6-ab82-44ac-9bd1-91a5c8fce4bb';
            let accessToken = '';
            if (accountData) {
                try {
                    const parsed = JSON.parse(accountData);
                    organizationId = parsed.organizationId || organizationId;
                    accessToken = parsed.accessToken || '';
                } catch (err) {
                    console.warn('Failed to parse ns_account', err);
                }
            }

            const API_ROOT = import.meta.env.VITE_API_URL || '';
            const spentAtTimestamp = expenseDate ? `${expenseDate}T12:00:00` : new Date().toISOString();

            const payload = {
                expenseCategoryId: "f5a0f82c-98f8-40a6-e5c0-505231305005",
                roomId: null,
                relatedMaintenanceTicketId: null,
                relatedBrokerId: null,
                approvedByStaffUserId: null,
                createdByStaffUserId: null,
                expenseNumber: expenseId,
                expenseType: expenseCategory,
                payeeName: expensePayee,
                amount: Number(expenseAmount),
                spentAt: spentAtTimestamp,
                paymentMethod: expenseMethod,
                status: expenseStatus === 'Success' ? 1 : 0, // 0 for Pending, 1 for Success/Approved
                referenceCode: expenseReference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
                description: expenseDescription || 'Chi phí vận hành'
            };

            const res = await fetch(`${API_ROOT}/api/organizations/${organizationId}/properties/${expenseFacility}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                    'accessToken': accessToken,
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 201 || res.status === 200 || res.ok) {
                const categoryText = EXPENSE_CATEGORY_MAP[expenseCategory] || 'Chi khác';
                const methodText = PAYMENT_METHOD_MAP[expenseMethod] || 'Tiền mặt';

                const newTx = {
                    id: expenseId,
                    room: 'Hệ thống',
                    tenant: expensePayee,
                    type: 'Chi',
                    category: categoryText,
                    amount: formatCurrency(Number(expenseAmount)),
                    date: formatDate(expenseDate),
                    method: methodText,
                    status: expenseStatus,
                    facility: expenseFacility
                };

                setTransactions(prev => [newTx, ...prev]);
                setIsOpenExpenseModal(false);
                showToast(`Tạo thành công phiếu chi ${expenseId}!`);
                setActiveSubView('detailed');
                fetchExpensesForProperties(properties);
            } else {
                let errMsg = 'Tạo phiếu chi thất bại';
                try {
                    const errData = await res.json();
                    errMsg = errData.message || errData.error || errMsg;
                } catch (_) { }
                throw new Error(errMsg);
            }
        } catch (err) {
            console.error('Create expense error:', err);
            showToast(err.message || 'Lỗi khi kết nối với máy chủ', 'error');
        } finally {
            setIsSavingExpense(false);
        }
    };

    // Hàm lấy cấu trúc chi phí động từ dữ liệu thực tế
    const getDynamicCostStructure = () => {
        const costMap = {};
        let totalChi = 0;

        transactions.forEach(tx => {
            if (tx.type === 'Chi' && (facilityFilter === 'All' || tx.facility === facilityFilter)) {
                const amountNum = Number(tx.amount.replace(/[^0-9]/g, '')) || 0;
                costMap[tx.category] = (costMap[tx.category] || 0) + amountNum;
                totalChi += amountNum;
            }
        });

        const costList = Object.keys(costMap).map(category => {
            const amountVal = costMap[category];
            const pct = totalChi > 0 ? Math.round((amountVal / totalChi) * 100) : 0;
            return {
                name: category,
                amount: formatCurrency(amountVal),
                percentage: pct
            };
        });

        costList.sort((a, b) => b.percentage - a.percentage);

        if (costList.length === 0) {
            return [
                { name: 'Chưa có khoản chi', amount: '0đ', percentage: 0 }
            ];
        }

        return costList;
    };

    // Tính toán số liệu thống kê kế toán động dựa trên Cơ sở (Hoàn toàn tự động từ dữ liệu thực tế)
    const getStatsForFacility = (fac) => {
        let revenue = 0;
        let expenses = 0;
        let debt = 0;

        transactions.forEach(tx => {
            if (fac === 'All' || tx.facility === fac) {
                const amountNum = Number(tx.amount.replace(/[^0-9]/g, '')) || 0;
                if (tx.type === 'Thu') {
                    if (tx.status === 'Success' || tx.status === 'Pending') {
                        revenue += amountNum;
                    } else if (tx.status === 'Overdue') {
                        debt += amountNum;
                    }
                } else if (tx.type === 'Chi') {
                    if (tx.status === 'Success' || tx.status === 'Pending') {
                        expenses += amountNum;
                    }
                }
            }
        });

        const profit = revenue - expenses;

        return [
            { title: 'Doanh thu Lũy kế', value: revenue, trend: fac === 'All' ? 'Đã cập nhật' : 'Cơ sở', isPositive: true },
            { title: 'Chi phí Đã Duyệt', value: expenses, trend: fac === 'All' ? 'Đã cập nhật' : 'Cơ sở', isPositive: true },
            { title: 'Lợi Nhuận Thực Tế', value: profit, trend: fac === 'All' ? 'Đã cập nhật' : 'Cơ sở', isPositive: true },
            { title: 'Nợ Đọng Cần Thu', value: debt, trend: fac === 'All' ? 'Đã cập nhật' : 'Ổn định', isPositive: false }
        ];
    };

    const stats = getStatsForFacility(facilityFilter);

    // Trục tọa độ vẽ biểu đồ vùng động dựa trên Cơ sở được chọn
    const getChartPath = () => {
        switch (facilityFilter) {
            case 'Cơ sở 1':
                return {
                    area: "M 0,85 L 20,72 L 40,78 L 60,52 L 80,38 L 100,24 L 100,100 L 0,100 Z",
                    line: "M 0,85 L 20,72 L 40,78 L 60,52 L 80,38 L 100,24"
                };
            case 'Cơ sở 2':
                return {
                    area: "M 0,75 L 20,58 L 40,62 L 60,38 L 80,22 L 100,8 L 100,100 L 0,100 Z",
                    line: "M 0,75 L 20,58 L 40,62 L 60,38 L 80,22 L 100,8"
                };
            case 'Hệ thống':
                return {
                    area: "M 0,90 L 20,85 L 40,88 L 60,82 L 80,75 L 100,70 L 100,100 L 0,100 Z",
                    line: "M 0,90 L 20,85 L 40,88 L 60,82 L 80,75 L 100,70"
                };
            default:
                return {
                    area: "M 0,80 L 20,65 L 40,70 L 60,45 L 80,30 L 100,15 L 100,100 L 0,100 Z",
                    line: "M 0,80 L 20,65 L 40,70 L 60,45 L 80,30 L 100,15"
                };
        }
    };
    const chartPath = getChartPath();

    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch = tx.tenant.toLowerCase().includes(searchTerm.toLowerCase()) || tx.room.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
        const matchesType = typeFilter === 'All' || tx.type === typeFilter;

        // Mới: Lọc theo cơ sở
        const matchesFacility = facilityFilter === 'All' || tx.facility === facilityFilter;

        return matchesSearch && matchesStatus && matchesType && matchesFacility;
    });

    return (
        <div className="p-8 space-y-6">

            {/* ---------------- CONTROL PANEL HEADER ---------------- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" /> HỆ THỐNG KẾ TOÁN TRUNG TÂM & QUẢN LÝ TÀI CHÍNH
                    </span>
                    <h2 className={`text-2xl font-black tracking-tight ${theme.title} mt-0.5`}>
                        Giám Sát Doanh Thu & Kiểm Toán Dòng Tiền
                    </h2>
                </div>

                {/* Bộ điều khiển & Chuyển đổi Cơ sở/SubView */}
                <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto">
                    {/* Bộ lọc Cơ sở Tổng */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={facilityFilter}
                            onChange={(e) => setFacilityFilter(e.target.value)}
                            className={`text-xs font-bold border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37] w-full sm:w-44 transition-all ${isDarkMode
                                    ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37]'
                                    : 'bg-[#FFF9EC] border-[#E5D4AD] text-[#AA7C11] shadow-sm'
                                }`}
                        >
                            {activeFacilities.map(fac => (
                                <option key={fac.id} value={fac.id}>{fac.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={`flex rounded-xl p-1 border w-full sm:w-auto ${theme.panelSoft}`}>
                        <button
                            onClick={() => setActiveSubView('overview')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeSubView === 'overview' ? theme.tabActive : theme.tabIdle}`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" /> Tổng Quan
                        </button>
                        <button
                            onClick={() => setActiveSubView('detailed')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeSubView === 'detailed' ? theme.tabActive : theme.tabIdle}`}
                        >
                            <Layers className="w-3.5 h-3.5" /> Nhật Ký
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={openReceiptModal}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-emerald-950/20"
                    >
                        <Plus className="w-4 h-4 text-white stroke-[3]" /> Lập Phiếu Thu
                    </button>
                    <button
                        type="button"
                        onClick={openExpenseModal}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-rose-950/20"
                    >
                        <Plus className="w-4 h-4 text-white stroke-[3]" /> Lập Phiếu Chi
                    </button>
                </div>
            </div>

            {/* ---------------- 4 THẺ CHỈ SỐ KẾ TOÁN ---------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, index) => (
                    <div key={index} className={`${theme.panel} border rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm`}>
                        <div className="flex justify-between items-start">
                            <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.muted}`}>{stat.title}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className={`text-2xl font-black tracking-tight ${index === 2 ? 'text-[#D4AF37]' : index === 3 ? 'text-rose-500' : theme.title}`}>
                                {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
                            </h3>
                            <div className={`w-full h-1 mt-2 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`}>
                                <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: index === 0 ? '82%' : index === 1 ? '34%' : index === 2 ? '88%' : '15%' }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---------------- 1. PHÂN HỆ TỔNG QUAN CHIẾN LƯỢC ---------------- */}
            {activeSubView === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Biểu đồ vùng (Area Chart) Native SVG xu hướng dòng tiền */}
                    <div className={`lg:col-span-2 ${theme.panel} border rounded-2xl p-6 flex flex-col justify-between shadow-sm`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className={`text-sm font-bold ${theme.title}`}>Xu Hướng Biến Động Quỹ Dòng Tiền (6 Tháng)</h3>
                                <p className={`text-xs ${theme.muted}`}>Tương quan biểu đồ vùng giữa Thu nhập thực tế và Ngân sách dự chi</p>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">Tăng trưởng ổn định <ArrowUpRight className="w-3.5 h-3.5" /></span>
                        </div>

                        {/* Trực quan đồ họa bằng SVG nguyên bản */}
                        <div className="relative h-60 w-full mt-4 border-b border-l border-slate-500/20 px-2 flex items-end">
                            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                {/* Gradient nền vùng */}
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.00" />
                                    </linearGradient>
                                </defs>
                                {/* Vùng đổ màu phía dưới */}
                                <path d={chartPath.area} fill="url(#areaGrad)" />
                                {/* Đường chỉ dẫn chính */}
                                <path d={chartPath.line} fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
                                {/* Điểm nút dữ liệu */}
                                <circle cx="20" cy="65" r="2" fill="#fff" stroke="#D4AF37" strokeWidth="1" />
                                <circle cx="60" cy="45" r="2" fill="#fff" stroke="#D4AF37" strokeWidth="1" />
                                <circle cx="100" cy="15" r="2" fill="#fff" stroke="#D4AF37" strokeWidth="1" />
                            </svg>

                            {/* Nhãn trục X tháng dưới chân đồ thị */}
                            <div className="w-full flex justify-between text-[10px] font-bold tracking-wide text-slate-500 pt-2 relative z-10">
                                <span>Tháng 1</span><span>Tháng 2</span><span>Tháng 3</span><span>Tháng 4</span><span>Tháng 5</span><span>Tháng 6</span>
                            </div>
                        </div>
                    </div>

                    {/* Biểu đồ Cột Ngang cấu trúc chi phí vận hành */}
                    <div className={`${theme.panel} border rounded-2xl p-6 flex flex-col justify-between shadow-sm`}>
                        <div>
                            <h3 className={`text-sm font-bold ${theme.title}`}>Cấu Trúc Chi Phí Vận Hành</h3>
                            <p className={`text-xs ${theme.muted} mb-4`}>Tỷ trọng các nhóm chi phí trong Quý</p>
                        </div>

                        <div className="space-y-4 flex-1 flex flex-col justify-center">
                            {getDynamicCostStructure().map((cost, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className={theme.title}>{cost.name}</span>
                                        <span className={theme.muted}>{cost.amount} ({cost.percentage}%)</span>
                                    </div>
                                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                                        <div
                                            className={`h-full rounded-full ${idx === 0 ? 'bg-[#D4AF37]' : idx === 1 ? 'bg-amber-600' : idx === 2 ? 'bg-amber-700' : 'bg-slate-400'}`}
                                            style={{ width: `${cost.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`mt-4 p-2.5 rounded-xl text-center text-[11px] font-medium ${theme.panelSoft} ${theme.mutedSoft}`}>
                            Tổng chi phí đang nằm trong hạn ngạch an toàn 15% doanh thu.
                        </div>
                    </div>

                    {/* AI / Phân tích cảnh báo rủi ro dòng tiền thông minh */}
                    <div className={`lg:col-span-3 border rounded-2xl p-5 relative overflow-hidden shadow-sm ${isDarkMode ? 'bg-gradient-to-r from-[#1E1609] to-[#11111A]' : 'bg-[#FFFBEA]'}`}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/10 text-[#D4AF37] rounded-xl mt-0.5"><Sparkles className="w-4 h-4 animate-pulse" /></div>
                            <div>
                                <h4 className={`text-sm font-black ${theme.title}`}>Báo cáo khuyến nghị rủi ro thanh khoản</h4>
                                <p className={`text-xs font-medium leading-relaxed mt-1 ${theme.muted}`}>
                                    Phát hiện <span className="text-rose-500 font-bold">3 khoản công nợ trễ hạn quá 7 ngày</span> tại phòng 305, 102 và 204. Tổng giá trị thất thoát tạm thời đạt <span className="text-amber-500 font-bold">{typeof stats[3].value === 'number' ? formatCurrency(stats[3].value) : stats[3].value}</span>. Hệ thống đề xuất kế toán kích hoạt lệnh gửi thông báo nhắc nợ tự động qua SMS/Zalo để đảm bảo chỉ số dòng tiền ròng của Quý đạt đúng điểm mục tiêu.
                                </p>
                                <button
                                    onClick={() => setActiveSubView('detailed')}
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline"
                                >
                                    Đi tới xử lý công nợ phòng trễ hạn <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- 2. PHÂN HỆ NHẬT KÝ CHI TIẾT (LEDGER GRID) ---------------- */}
            {activeSubView === 'detailed' && (
                <div className="space-y-4 animate-in fade-in duration-200">

                    {/* Thanh tìm kiếm & Bộ lọc nâng cao chuyên dùng cho Kế toán */}
                    <div className={`${theme.panel} border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}>
                        <div className={`flex items-center border rounded-xl px-3 py-2 w-full md:w-80 ${theme.search}`}>
                            <Search className={`w-4 h-4 mr-2 ${theme.mutedSoft}`} />
                            <input
                                type="text"
                                placeholder="Tìm mã chứng từ, tên cư dân, số phòng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:inherit"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${theme.mutedSoft}`}><Layers className="w-3.5 h-3.5 inline mr-1" />Phân mục:</span>
                                <div className="flex rounded-lg border overflow-hidden text-xs font-bold">
                                    {['All', 'Thu', 'Chi'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTypeFilter(t)}
                                            className={`px-3 py-1.5 border-r last:border-none text-[11px] transition-colors ${typeFilter === t ? 'bg-[#D4AF37] text-black' : `${isDarkMode ? 'bg-[#161622] hover:bg-white/5' : 'bg-white hover:bg-amber-50'} ${theme.muted}`}`}
                                        >
                                            {t === 'All' ? 'Tất cả' : t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${theme.mutedSoft}`}><Filter className="w-3.5 h-3.5 inline mr-1" />Trạng thái:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={`text-xs font-bold border rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#D4AF37] ${isDarkMode ? 'bg-[#161622] border-[#2A2518] text-white' : 'bg-white border-[#E5D4AD] text-slate-800'}`}
                                >
                                    <option value="All">Tất cả chứng từ</option>
                                    <option value="Success">Đã quyết toán</option>
                                    <option value="Pending">Chờ duyệt chi</option>
                                    <option value="Overdue">Quá hạn nợ</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bảng dữ liệu hạch toán chi tiết */}
                    <div className={`border rounded-2xl overflow-hidden shadow-sm ${theme.panel}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${theme.tableHead} ${theme.muted}`}>
                                        <th className="p-4">Mã chứng từ</th>
                                        <th className="p-4">Đối tượng / Phòng</th>
                                        <th className="p-4">Phân loại nghiệp vụ</th>
                                        <th className="p-4">Ngày hạch toán</th>
                                        <th className="p-4">Phương thức</th>
                                        <th className="p-4">Trạng thái duyệt</th>
                                        <th className="p-4 text-right">Giá trị hóa đơn</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme.divider}`}>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className={`p-8 text-center text-xs font-medium italic ${theme.mutedSoft}`}>Không tìm thấy dữ liệu hạch toán khớp bộ lọc.</td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((tx) => (
                                            <tr key={tx.id} className={`${theme.tableHover} transition-colors group text-sm`}>
                                                <td className="p-4 font-mono font-bold text-[#D4AF37]">{tx.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-md ${tx.room.startsWith('Phòng') ? 'bg-amber-500/10 text-[#D4AF37]' : 'bg-slate-500/10 text-slate-400'}`}><Building className="w-3.5 h-3.5" /></div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`font-bold ${theme.title}`}>{tx.room}</span>
                                                                <span className={`text-[9px] font-black px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded uppercase tracking-wider`}>
                                                                    {getFacilityName(tx.facility)}
                                                                </span>
                                                            </div>
                                                            <span className={`text-[11px] block ${theme.mutedSoft}`}>{tx.tenant}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'Thu' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {tx.type === 'Thu' ? '+' : '-'} {costHgh(tx.category)}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-xs font-medium ${theme.muted}`}>{tx.date}</td>
                                                <td className={`p-4 text-xs font-semibold ${theme.muted}`}>{tx.method}</td>
                                                <td className="p-4 text-xs">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${tx.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {tx.status === 'Success' ? 'Đã quyết toán' : tx.status === 'Pending' ? 'Chờ kiểm tra' : 'Treo nợ quá hạn'}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-right font-black ${tx.type === 'Thu' ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.type === 'Thu' ? '+' : '-'} {tx.amount}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal lập Phiếu Thu mới */}
            {isOpenReceiptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setIsOpenReceiptModal(false)}
                    />

                    <div className={`relative w-full max-w-xl rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 ${theme.panel}`}>
                        <button
                            type="button"
                            onClick={() => setIsOpenReceiptModal(false)}
                            className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-colors ${isDarkMode
                                    ? 'border-[#2A2518] hover:bg-white/5 text-gray-400 hover:text-white'
                                    : 'border-[#E5D4AD] hover:bg-amber-50 text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-6">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/25">
                                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <h3 className={`text-lg font-black tracking-tight ${theme.title}`}>Lập Phiếu Thu Mới</h3>
                                <p className={`text-xs ${theme.muted}`}>Thu dòng tiền vào hệ thống quản lý</p>
                            </div>
                        </div>

                        <form onSubmit={handleReceiptSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Mã phiếu thu</label>
                                    <input
                                        type="text"
                                        value={receiptId}
                                        readOnly
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border font-mono font-bold ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37]/80'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-[#AA7C11]'
                                            }`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Ngày hạch toán</label>
                                    <input
                                        type="date"
                                        value={receiptDate}
                                        required
                                        onChange={(e) => setReceiptDate(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Cơ sở quản lý</label>
                                    <select
                                        value={receiptFacility}
                                        onChange={(e) => setReceiptFacility(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        {properties.map((p, idx) => (
                                            <option key={p.id || p.propertyId || idx} value={p.id || p.propertyId}>{p.propertyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Số phòng</label>
                                    <input
                                        type="text"
                                        value={receiptRoom}
                                        placeholder="Ví dụ: Phòng 101"
                                        onChange={(e) => setReceiptRoom(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white placeholder-gray-500 focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400 focus:border-[#D4AF37]'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Khách thuê (Người nộp)</label>
                                {residents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <select
                                            value={receiptResidentId}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setReceiptResidentId(val);
                                                if (val === 'custom' || val === '') {
                                                    setReceiptTenant('');
                                                } else {
                                                    const found = residents.find(r => r.residentId === val);
                                                    if (found) {
                                                        setReceiptTenant(found.fullName || '');
                                                    }
                                                }
                                            }}
                                            className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                    ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                    : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                                }`}
                                        >
                                            <option value="">-- Chọn cư dân --</option>
                                            {residents.map((r, idx) => (
                                                <option key={r.residentId || idx} value={r.residentId}>
                                                    {r.fullName} ({r.phone || 'Không có SĐT'})
                                                </option>
                                            ))}
                                            <option value="custom">Khách ngoài (Nhập thủ công)</option>
                                        </select>
                                        {(receiptResidentId === 'custom' || !receiptResidentId) && (
                                            <input
                                                type="text"
                                                value={receiptTenant}
                                                placeholder="Nhập tên người nộp"
                                                onChange={(e) => setReceiptTenant(e.target.value)}
                                                className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                        ? 'bg-[#161622] border-[#2A2518] text-white placeholder-gray-500 focus:border-[#D4AF37]'
                                                        : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400 focus:border-[#D4AF37]'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={receiptTenant}
                                        placeholder="Ví dụ: Nguyễn Minh Anh"
                                        onChange={(e) => setReceiptTenant(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white placeholder-gray-500 focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400 focus:border-[#D4AF37]'
                                            }`}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Phân loại khoản thu</label>
                                    <select
                                        value={receiptCategory}
                                        onChange={(e) => setReceiptCategory(Number(e.target.value))}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        {Object.entries(INCOME_CATEGORY_MAP).map(([key, name]) => (
                                            <option key={key} value={Number(key)}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Phương thức thanh toán</label>
                                    <select
                                        value={receiptMethod}
                                        onChange={(e) => setReceiptMethod(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        <option value="Chuyển khoản (VCB)">Chuyển khoản (VCB)</option>
                                        <option value="Chuyển khoản (MB)">Chuyển khoản (MB)</option>
                                        <option value="Tiền mặt">Tiền mặt</option>
                                        <option value="Ví điện tử">Ví điện tử</option>
                                        <option value="Chuyển khoản">Chuyển khoản khác</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Số tiền thu (VNĐ)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={receiptAmount}
                                            required
                                            placeholder="0"
                                            onChange={(e) => setReceiptAmount(e.target.value)}
                                            className={`w-full rounded-xl pl-3.5 pr-8 py-2.5 text-xs border focus:outline-none transition-all font-bold ${isDarkMode
                                                    ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                    : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                                }`}
                                        />
                                        <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.muted}`}>đ</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Trạng thái phiếu</label>
                                    <select
                                        value={receiptStatus}
                                        onChange={(e) => setReceiptStatus(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        <option value="Success">Đã quyết toán</option>
                                        <option value="Pending">Chờ kiểm tra</option>
                                        <option value="Overdue">Treo nợ quá hạn</option>
                                    </select>
                                </div>
                            </div>

                            {/* Mã tham chiếu & Diễn giải chi tiết */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Mã tham chiếu / Số Hóa đơn</label>
                                    <input
                                        type="text"
                                        value={receiptReference}
                                        placeholder="Ví dụ: INV-ROOM-062026-001"
                                        onChange={(e) => setReceiptReference(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Diễn giải chi tiết</label>
                                    <input
                                        type="text"
                                        value={receiptDescription}
                                        placeholder="Ví dụ: Phí trả chậm tiền dịch vụ"
                                        onChange={(e) => setReceiptDescription(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className={`pt-4 border-t flex justify-end gap-3 ${theme.divider}`}>
                                <button
                                    type="button"
                                    onClick={() => setIsOpenReceiptModal(false)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDarkMode
                                            ? 'border-[#2A2518] text-gray-300 hover:bg-white/5'
                                            : 'border-[#E5D4AD] text-slate-600 hover:bg-amber-50'
                                        }`}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingReceipt}
                                    className={`px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 ${isSavingReceipt ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSavingReceipt ? (
                                        <>
                                            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang lưu...
                                        </>
                                    ) : 'Lập Phiếu Thu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal lập Phiếu Chi mới */}
            {isOpenExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setIsOpenExpenseModal(false)}
                    />

                    <div className={`relative w-full max-w-xl rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 transform scale-100 ${theme.panel}`}>
                        <button
                            type="button"
                            onClick={() => setIsOpenExpenseModal(false)}
                            className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-colors ${isDarkMode
                                    ? 'border-[#2A2518] hover:bg-white/5 text-gray-400 hover:text-white'
                                    : 'border-[#E5D4AD] hover:bg-amber-50 text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-6">
                            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/25">
                                <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <h3 className={`text-lg font-black tracking-tight ${theme.title}`}>Lập Phiếu Chi Mới</h3>
                                <p className={`text-xs ${theme.muted}`}>Chi quỹ vận hành của hệ thống</p>
                            </div>
                        </div>

                        <form onSubmit={handleExpenseSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Mã phiếu chi</label>
                                    <input
                                        type="text"
                                        value={expenseId}
                                        readOnly
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border font-mono font-bold ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37]/80'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-[#AA7C11]'
                                            }`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Ngày hạch toán</label>
                                    <input
                                        type="date"
                                        value={expenseDate}
                                        required
                                        onChange={(e) => setExpenseDate(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Cơ sở chi trả</label>
                                <select
                                    value={expenseFacility}
                                    onChange={(e) => setExpenseFacility(e.target.value)}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                            ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                            : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                        }`}
                                >
                                    {properties.map((p, idx) => (
                                        <option key={p.id || p.propertyId || idx} value={p.id || p.propertyId}>{p.propertyName}</option>
                                    ))}
                                    <option value="Hệ thống">Chi phí Hệ thống</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Đối tác (Người nhận tiền)</label>
                                <input
                                    type="text"
                                    value={expensePayee}
                                    required
                                    placeholder="Ví dụ: Công ty Điện lực, Siêu thị X"
                                    onChange={(e) => setExpensePayee(e.target.value)}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                            ? 'bg-[#161622] border-[#2A2518] text-white placeholder-gray-500 focus:border-[#D4AF37]'
                                            : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400 focus:border-[#D4AF37]'
                                        }`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Hạng mục chi</label>
                                    <select
                                        value={expenseCategory}
                                        onChange={(e) => setExpenseCategory(Number(e.target.value))}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        {Object.entries(EXPENSE_CATEGORY_MAP).map(([key, val]) => (
                                            <option key={key} value={Number(key)}>{val}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Phương thức chi</label>
                                    <select
                                        value={expenseMethod}
                                        onChange={(e) => setExpenseMethod(Number(e.target.value))}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        {Object.entries(PAYMENT_METHOD_MAP).map(([key, val]) => (
                                            <option key={key} value={Number(key)}>{val}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Số tiền chi (VNĐ)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={expenseAmount}
                                            required
                                            placeholder="0"
                                            onChange={(e) => setExpenseAmount(e.target.value)}
                                            className={`w-full rounded-xl pl-3.5 pr-8 py-2.5 text-xs border focus:outline-none transition-all font-bold ${isDarkMode
                                                    ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                    : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                                }`}
                                        />
                                        <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.muted}`}>đ</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Trạng thái duyệt</label>
                                    <select
                                        value={expenseStatus}
                                        onChange={(e) => setExpenseStatus(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    >
                                        <option value="Success">Đã quyết toán</option>
                                        <option value="Pending">Chờ kiểm tra</option>
                                    </select>
                                </div>
                            </div>

                            {/* Mã tham chiếu & Diễn giải chi tiết */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Mã tham chiếu / Số Hóa đơn</label>
                                    <input
                                        type="text"
                                        value={expenseReference}
                                        placeholder="Ví dụ: INV-20260629-001"
                                        onChange={(e) => setExpenseReference(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black tracking-wider uppercase block ${theme.muted}`}>Diễn giải chi tiết</label>
                                    <input
                                        type="text"
                                        value={expenseDescription}
                                        placeholder="Ví dụ: Thanh toán tiền điện tháng 6/2026"
                                        onChange={(e) => setExpenseDescription(e.target.value)}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none transition-all ${isDarkMode
                                                ? 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37]'
                                                : 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37]'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className={`pt-4 border-t flex justify-end gap-3 ${theme.divider}`}>
                                <button
                                    type="button"
                                    onClick={() => setIsOpenExpenseModal(false)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDarkMode
                                            ? 'border-[#2A2518] text-gray-300 hover:bg-white/5'
                                            : 'border-[#E5D4AD] text-slate-600 hover:bg-amber-50'
                                        }`}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingExpense}
                                    className={`px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 ${isSavingExpense ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSavingExpense ? (
                                        <>
                                            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang lưu...
                                        </>
                                    ) : 'Lập Phiếu Chi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Thông báo Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[99] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-xs font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

// Hàm rút ngắn chuỗi danh mục tránh vỡ layout dữ liệu chi tiết
function costHgh(str) {
    return str.length > 24 ? str.substring(0, 24) + '...' : str;
}