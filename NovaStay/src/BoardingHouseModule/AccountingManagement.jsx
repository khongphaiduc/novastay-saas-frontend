import { useState } from 'react';
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
    ShieldAlert
} from 'lucide-react';

// 1. DỮ LIỆU TỔNG QUAN CHIẾN LƯỢC QUÝ 2 / 2026
const SUMMARY_ANALYTICS = {
    currentQuarter: 'Q2-2026',
    stats: [
        { title: 'Doanh thu Lũy kế', value: '485.200.000đ', trend: '+12.4%', isPositive: true },
        { title: 'Chi phí Đã Duyệt', value: '64.150.000đ', trend: '-3.8%', isPositive: true },
        { title: 'Lợi Nhuận Thực Tế', value: '421.050.000đ', trend: '+15.2%', isPositive: true },
        { title: 'Nợ Đọng Cần Thu', value: '18.400.000đ', trend: '3 Phòng trễ', isPositive: false },
    ],
    costStructure: [
        { name: 'Điện & Nước tổng', amount: '28.500.000đ', percentage: 44 },
        { name: 'Bảo trì & Sửa chữa', amount: '18.200.000đ', percentage: 28 },
        { name: 'Khấu hao tài sản', amount: '12.000.000đ', percentage: 19 },
        { name: 'Dịch vụ vệ sinh/An ninh', amount: '5.450.000đ', percentage: 9 },
    ]
};

// 2. DỮ LIỆU CHI TIẾT SỔ CÁI CHỨNG TỪ
const DETAILED_LEDGER = [
    { id: 'TX-9041', room: 'Phòng 101', tenant: 'Nguyễn Minh Anh', type: 'Thu', category: 'Tiền phòng & Dịch vụ', amount: '4.850.000đ', date: '25/06/2026', method: 'Chuyển khoản (VCB)', status: 'Success' },
    { id: 'TX-9042', room: 'Phòng 202', tenant: 'Lê Thu Hà', type: 'Thu', category: 'Tiền phòng & Dịch vụ', amount: '4.300.000đ', date: '24/06/2026', method: 'Chuyển khoản (MB)', status: 'Success' },
    { id: 'TX-9043', room: 'Hệ thống', tenant: 'Công ty Điện lực', type: 'Chi', category: 'Chi phí điện tháng 5', amount: '14.250.000đ', date: '22/06/2026', method: 'Chuyển khoản (Ví DT)', status: 'Success' },
    { id: 'TX-9044', room: 'Phòng 201', tenant: 'Trần Gia Huy', type: 'Thu', category: 'Tiền cọc giữ phòng', amount: '5.200.000đ', date: '20/06/2026', method: 'Tiền mặt', status: 'Pending' },
    { id: 'TX-9045', room: 'Phòng 305', tenant: 'Phạm Đức Thắng', type: 'Thu', category: 'Tiền phòng trễ hạn', amount: '3.950.000đ', date: '18/06/2026', method: 'Chuyển khoản', status: 'Overdue' },
    { id: 'TX-9046', room: 'Cơ sở 1', tenant: 'Đội thi công Nova', type: 'Chi', category: 'Chống thấm ban công', amount: '3.500.000đ', date: '15/06/2026', method: 'Tiền mặt', status: 'Success' }
];

export default function AccountingDashboard({ isDarkMode = true }) {
    const [activeSubView, setActiveSubView] = useState('overview'); // overview | detailed
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

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

    const filteredTransactions = DETAILED_LEDGER.filter((tx) => {
        const matchesSearch = tx.tenant.toLowerCase().includes(searchTerm.toLowerCase()) || tx.room.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
        const matchesType = typeFilter === 'All' || tx.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
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

                {/* Chuyển đổi giữa TỔNG QUAN và CHI TIẾT */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className={`flex rounded-xl p-1 border w-full lg:w-auto ${theme.panelSoft}`}>
                        <button
                            onClick={() => setActiveSubView('overview')}
                            className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeSubView === 'overview' ? theme.tabActive : theme.tabIdle}`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" /> Tổng Quan Chiến Lược
                        </button>
                        <button
                            onClick={() => setActiveSubView('detailed')}
                            className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeSubView === 'detailed' ? theme.tabActive : theme.tabIdle}`}
                        >
                            <Layers className="w-3.5 h-3.5" /> Nhật Ký Chi Tiết
                        </button>
                    </div>

                    <button type="button" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02]">
                        <Plus className="w-4 h-4 text-black stroke-[3]" /> Phiếu Mới
                    </button>
                </div>
            </div>

            {/* ---------------- 4 THẺ CHỈ SỐ KẾ TOÁN ---------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {SUMMARY_ANALYTICS.stats.map((stat, index) => (
                    <div key={index} className={`${theme.panel} border rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm`}>
                        <div className="flex justify-between items-start">
                            <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.muted}`}>{stat.title}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className={`text-2xl font-black tracking-tight ${index === 2 ? 'text-[#D4AF37]' : index === 3 ? 'text-rose-500' : theme.title}`}>
                                {stat.value}
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
                                <path d="M 0,80 L 20,65 L 40,70 L 60,45 L 80,30 L 100,15 L 100,100 L 0,100 Z" fill="url(#areaGrad)" />
                                {/* Đường chỉ dẫn chính */}
                                <path d="M 0,80 L 20,65 L 40,70 L 60,45 L 80,30 L 100,15" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
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
                            {SUMMARY_ANALYTICS.costStructure.map((cost, idx) => (
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
                                    Phát hiện <span className="text-rose-500 font-bold">3 khoản công nợ trễ hạn quá 7 ngày</span> tại phòng 305, 102 và 204. Tổng giá trị thất thoát tạm thời đạt <span className="text-amber-500 font-bold">{SUMMARY_ANALYTICS.stats[3].value}</span>. Hệ thống đề xuất kế toán kích hoạt lệnh gửi thông báo nhắc nợ tự động qua SMS/Zalo để đảm bảo chỉ số dòng tiền ròng của Quý đạt đúng điểm mục tiêu.
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
                                                            <span className={`font-bold block ${theme.title}`}>{tx.room}</span>
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

        </div>
    );
}

// Hàm rút ngắn chuỗi danh mục tránh vỡ layout dữ liệu chi tiết
function costHgh(str) {
    return str.length > 24 ? str.substring(0, 24) + '...' : str;
}