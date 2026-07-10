import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bed,
  UserCheck,
  Receipt,
  Bell,
  ShieldCheck,
  Compass,
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
  KeyRound,
  ConciergeBell,
  Moon,
  Sun,
  FileText,
  Package,
  LogOut,
  X,
  Building2,
  BarChart3,
  CalendarDays,
  ArrowUpRight,
  PieChart,
  LineChart,
  Activity,
  Send,
  Terminal,
  CreditCard,
  Edit3
} from 'lucide-react';
import ResidentManagementSubPage from './ResidentManagement';
import RoomManagementSubPage from './RoomManagementSubPage';
import ServiceSetupSubPage from './ServiceSetupSubPage';
import AssetManagementSubPage from './AssetManagementSubPage';
import ContractManagementSubPage from './ContractManagementSubPage';
import PropertyManagementSubPage from './PropertyManagementSubPage';
import AccountingManagement from './AccountingManagement';
import PricingMatrix from './PricingMatrix';
import BillingConfig from './BillingConfig';
import RoomServiceInput from './RoomServiceInput';
import DeveloperContactModal from './DeveloperContactModal';
import ChangePasswordModal from './ChangePasswordModal';
import assistantIcon from '../assets/Assistantv3.png';

const QUARTERLY_DATA = {
  currentQuarter: 'Q2-2026',
  metrics: [
    {
      title: 'Doanh thu Thuần Quý',
      value: '745.5 Tr',
      subtext: 'Mục tiêu: 800 Tr',
      progress: 93,
      trend: '+14.2%',
      isPositive: true,
      chartBars: [45, 62, 58, 74, 90, 85]
    },
    {
      title: 'Tỷ lệ Lấp đầy Toàn chuỗi',
      value: '94.8%',
      subtext: 'Đang vận hành: 45/48 Phòng',
      progress: 94.8,
      trend: '+2.5%',
      isPositive: true,
      chartBars: [88, 90, 92, 91, 93, 94]
    },
    {
      title: 'Chi phí Vận hành Quý',
      value: '112.4 Tr',
      subtext: 'Ngân sách Quý: 130 Tr',
      progress: 86.4,
      trend: '-4.1%',
      isPositive: true,
      chartBars: [30, 28, 35, 32, 29, 25]
    },
    {
      title: 'Dự báo Tăng trưởng Q3',
      value: '+18.5%',
      subtext: 'Dựa trên lượng hợp đồng ký mới',
      progress: 75,
      trend: 'Độ tin cậy 92%',
      isPositive: true,
      chartBars: [50, 55, 62, 70, 78, 85]
    }
  ]
};

// Dữ liệu biểu đồ cột: Doanh thu 6 tháng gần nhất (Tr VND)
const BAR_CHART_DATA = [
  { month: 'Tháng 1', revenue: 180, cost: 40 },
  { month: 'Tháng 2', revenue: 210, cost: 38 },
  { month: 'Tháng 3', revenue: 195, cost: 45 },
  { month: 'Tháng 4', revenue: 230, cost: 42 },
  { month: 'Tháng 5', revenue: 248, cost: 39 },
  { month: 'Tháng 6', revenue: 265, cost: 41 },
];

const themeConfig = {
  dark: {
    page: 'bg-[#0B0B12] text-slate-100 selection:bg-[#D4AF37] selection:text-black',
    sidebar: 'bg-[#11111A] border-[#2A2518]',
    sidebarLine: 'border-[#2A2518]/60',
    panel: 'bg-[#11111A] border-[#2A2518]',
    panelSoft: 'bg-[#161622] border-[#2A2518]/40',
    topbar: 'bg-[#0B0B12]/80 border-[#2A2518]/40',
    search: 'bg-[#11111A] border-[#2A2518]/60 text-gray-200 placeholder-gray-600',
    muted: 'text-gray-400',
    mutedSoft: 'text-gray-500',
    title: 'text-white',
    navIdle: 'text-gray-400 hover:text-white hover:bg-white/5',
    navActive: 'bg-gradient-to-r from-[#211C10] to-[#161208] text-[#D4AF37] border border-[#D4AF37]/30 shadow-md',
    banner: 'bg-gradient-to-r from-[#161208] via-[#11111A] to-[#11111A] border-[#2A2518]',
    tableHead: 'bg-[#0F0F17]/50 border-[#2A2518]/40',
    tableDivide: 'divide-[#2A2518]/30',
    tableHover: 'hover:bg-white/[0.02]',
    rowText: 'text-gray-300',
    emptyText: 'text-gray-600',
    divider: 'bg-[#2A2518]',
  },
  light: {
    page: 'bg-white text-slate-900 selection:bg-[#D4AF37] selection:text-black',
    sidebar: 'bg-white border-[#E5D4AD]',
    sidebarLine: 'border-[#E5D4AD]',
    panel: 'bg-white border-[#E5D4AD]',
    panelSoft: 'bg-white border-[#E5D4AD]',
    topbar: 'bg-white/85 border-[#E5D4AD]',
    search: 'bg-white border-[#E5D4AD] text-slate-800 placeholder-slate-400',
    muted: 'text-slate-500',
    mutedSoft: 'text-slate-400',
    title: 'text-slate-950',
    navIdle: 'text-slate-600 hover:text-slate-950 hover:bg-amber-50',
    navActive: 'bg-gradient-to-r from-[#FFF1C7] to-white text-[#8A6212] border border-[#D4AF37]/40 shadow-sm',
    banner: 'bg-white border-[#E5D4AD]',
    tableHead: 'bg-white border-[#E5D4AD]',
    tableDivide: 'divide-[#E5D4AD]',
    tableHover: 'hover:bg-amber-50/70',
    rowText: 'text-slate-700',
    emptyText: 'text-slate-400',
    divider: 'bg-[#E5D4AD]',
  },
};

export default function LuxuryDashboard() {
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('ns_active_tab') || 'overview';
  });

  const setActiveTab = (tabName) => {
    setActiveTabState(tabName);
    localStorage.setItem('ns_active_tab', tabName);
  };

  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? themeConfig.dark : themeConfig.light;
  const navigate = useNavigate();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const [bubbleText, setBubbleText] = useState('NovaBot: Chúc ngày mới tốt lành! ✦');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Chúc bạn một ngày mới tốt lành. Tôi là Trợ lý Ảo NovaStay AI. Hôm nay tôi có thể giúp gì cho bạn trong việc quản lý vận hành nhà trọ?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAssistantOpen) {
        const messages = [
          'NovaBot: Bạn có muốn tôi giúp gì khummm? ✦',
          'NovaBot: Hay quá ta ơi! ✦',
          'NovaBot: Cần hỗ trợ gì thêm cứ nhắn tôi nhé! ✦',
          'NovaBot: Cục cưng của tôi ơi! ✦',
          'NovaBot: Boss ơiiii! ✦',
          'NovaBot: Yêu Boss! ✦',

          'NovaBot: NovaBot luôn sẵn sàng phục vụ Boss! ✨',
          'NovaBot: Hôm nay Boss muốn xử lý việc gì nào? 🚀',
          'NovaBot: Chỉ cần nhắn một câu, để tôi lo phần còn lại! 💙',
          'NovaBot: Có NovaBot ở đây rồi, đừng lo nhé! 🌟',
          'NovaBot: Chúc Boss một ngày thật nhiều khách thuê! 🏡',
          'NovaBot: Quản lý nhà trọ chưa bao giờ dễ đến thế! 😎',
          'NovaBot: Boss cần báo cáo hay thống kê? Tôi làm ngay! 📊',
          'NovaBot: Tôi đang lắng nghe đây! 👂',
          'NovaBot: Sẵn sàng hỗ trợ 24/7 cho Boss! ⏰',
          'NovaBot: Hãy giao việc cho tôi nhé! 🤖',
          'NovaBot: NovaStay đồng hành cùng Boss mỗi ngày! 💎',
          'NovaBot: Có gì khó cứ để NovaBot xử lý! ⚡',
          'NovaBot: Chỉ một tin nhắn là tôi có mặt ngay! 💬',
          'NovaBot: Hôm nay Boss trông đầy năng lượng đó! ☀️',
          'NovaBot: Tôi có thể giúp quản lý hóa đơn, cư dân và nhiều hơn nữa! 🧾',
          'NovaBot: Cảm ơn Boss đã tin tưởng NovaStay! ❤️',
          'NovaBot: Boss cần tìm kiếm thông tin gì? 🔍',
          'NovaBot: Đừng ngại hỏi, tôi thích được giúp đỡ lắm! 😊',
          'NovaBot: Chúng ta cùng hoàn thành công việc nào! 💪',
          'NovaBot: Chúc Boss kinh doanh phát đạt! 💰',
          'NovaBot: NovaBot luôn ở đây mỗi khi Boss cần! 🌸',
          'NovaBot: Chào mừng Boss quay trở lại! 🎉',
          'NovaBot: Hãy để tôi tiết kiệm thời gian cho Boss nhé! ⏳',
          'NovaBot: Chúc Boss có một ngày làm việc hiệu quả! 🚀',
          'NovaBot: Tôi luôn sẵn sàng giải đáp mọi thắc mắc! 💡',
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setBubbleText(randomMsg);
        setShowWelcomeBubble(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAssistantOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');

    setTimeout(() => {
      let botReply = 'Tôi đang phân tích yêu cầu của bạn. Bạn cần tôi truy xuất báo cáo, cập nhật chỉ số phòng hay cấu hình lại biểu phí dịch vụ?';
      const msgLower = userMsg.toLowerCase();
      if (msgLower.includes('doanh thu') || msgLower.includes('tiền') || msgLower.includes('tài chính') || msgLower.includes('kế toán')) {
        botReply = 'Dựa trên sổ cái kế toán Quý 2-2026, doanh thu thực tế đạt 485,2 Tr VND, lợi nhuận ròng 421 Tr VND (~87.7%). Bạn có muốn xuất file Excel báo cáo dòng tiền chi tiết không?';
      } else if (msgLower.includes('phòng') || msgLower.includes('trống')) {
        botReply = 'Hiện toàn hệ thống có 45/48 phòng đang hoạt động (tỷ lệ lấp đầy 94.8%), còn 3 phòng trống. Bạn có muốn xem danh sách phòng trống để tạo hợp đồng mới không?';
      } else if (msgLower.includes('dịch vụ') || msgLower.includes('biểu phí')) {
        botReply = 'Hệ thống biểu phí dịch vụ hiện tại gồm có Điện (3.500đ/kWh), Nước (100.000đ/người) và các dịch vụ phòng vệ sinh. Bạn có thể bấm vào mục "Dịch vụ" ở thanh Sidebar để tùy chỉnh bất cứ lúc nào!';
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 800);
  };

  const navButtonClass = (tabName) =>
    `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tabName ? theme.navActive : theme.navIdle}`;

  return (
    <div className={`h-screen overflow-hidden font-sans antialiased flex transition-colors duration-300 ${theme.page}`}>

      {/* SIDEBAR */}
      <aside className={`w-72 h-full border-r flex flex-col justify-between p-6 hidden md:flex transition-colors duration-300 ${theme.sidebar}`}>
        <div>
          <div className={`flex items-center gap-3 px-2 py-4 mb-6 border-b ${theme.sidebarLine}`}>
            <div className="bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] p-2 rounded-xl shadow-lg shadow-[#D4AF37]/10">
              <Compass className="w-5 h-5 text-[#0B0B12]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-[#D4AF37]">NOVA TRỌ</h1>
              <p className="text-[10px] font-bold tracking-wide text-amber-600/90 uppercase">Hệ thống vận hành</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className={`px-3 text-[10px] font-bold tracking-wider uppercase mb-2 ${theme.mutedSoft}`}>Chức năng chính</p>
            <button type="button" onClick={() => setActiveTab('overview')} className={navButtonClass('overview')}><LayoutDashboard className="w-4.5 h-4.5" />Tổng quan vận hành</button>
            <button type="button" onClick={() => setActiveTab('properties')} className={navButtonClass('properties')}><Building2 className="w-4.5 h-4.5" />Quản lý cơ sở</button>
            <button type="button" onClick={() => setActiveTab('rooms')} className={navButtonClass('rooms')}><Bed className="w-4.5 h-4.5" />Danh sách phòng trọ</button>
            <button type="button" onClick={() => setActiveTab('residents')} className={navButtonClass('residents')}><UserCheck className="w-4.5 h-4.5" />Quản lý cư dân</button>
            <button type="button" onClick={() => setActiveTab('contracts')} className={navButtonClass('contracts')}><FileText className="w-4.5 h-4.5" />Quản lý hợp đồng</button>
            <button type="button" onClick={() => setActiveTab('accounting')} className={navButtonClass('accounting')}><Receipt className="w-4.5 h-4.5" />Thu chi và công nợ</button>
            <button type="button" onClick={() => setActiveTab('billing')} className={navButtonClass('billing')}><CalendarDays className="w-4.5 h-4.5" />Lịch thu tiền</button>
            <button type="button" onClick={() => setActiveTab('serviceInput')} className={navButtonClass('serviceInput')}><Edit3 className="w-4.5 h-4.5" />Ghi số dịch vụ</button>
            <button type="button" onClick={() => setActiveTab('assets')} className={navButtonClass('assets')}><Package className="w-4.5 h-4.5" />Quản lý tài sản</button>
            <button type="button" onClick={() => setActiveTab('services')} className={navButtonClass('services')}><ConciergeBell className="w-4.5 h-4.5" />Dịch vụ</button>
            <button type="button" onClick={() => setActiveTab('packages')} className={navButtonClass('packages')}><CreditCard className="w-4.5 h-4.5" />Gói Của Bạn</button>
            <button type="button" onClick={() => setActiveTab('developer')} className={navButtonClass('developer')}><Terminal className="w-4.5 h-4.5" />Thông tin nhà phát triển</button>
          </nav>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={() => setIsChangePasswordOpen(true)} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isDarkMode ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-[#8A6212] hover:bg-amber-50'}`}><KeyRound className="w-4.5 h-4.5" />Đổi mật khẩu</button>
          <button type="button" onClick={() => { localStorage.removeItem('ns_account'); localStorage.removeItem('ns_active_tab'); navigate('/'); }} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}><LogOut className="w-4.5 h-4.5" />Đăng xuất</button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOPBAR */}
        <header className={`h-16 backdrop-blur-md border-b px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300 ${theme.topbar}`}>
          <div className="flex items-center gap-4">
            <div className={`flex items-center border rounded-xl px-3 py-1.5 w-72 ${theme.search}`}>
              <Search className={`w-4 h-4 mr-2 ${theme.mutedSoft}`} />
              <input type="text" placeholder="Tìm phòng, cư dân..." className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:inherit" />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => setIsDarkMode((c) => !c)} className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${theme.panel} ${theme.muted} hover:border-[#D4AF37]`}>
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {isDarkMode ? 'Giao diện sáng' : 'Giao diện tối'}
            </button>
            <div className={`relative cursor-pointer transition ${theme.muted} hover:text-[#D4AF37]`}><Bell className="w-4.5 h-4.5" /><span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span></div>
          </div>
        </header>

        {/* CONTENT CHÍNH */}
        {activeTab !== 'overview' ? (
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'properties' && <PropertyManagementSubPage />}
            {activeTab === 'residents' && <ResidentManagementSubPage isDarkMode={isDarkMode} />}
            {activeTab === 'rooms' && <RoomManagementSubPage isDarkMode={isDarkMode} />}
            {activeTab === 'services' && <ServiceSetupSubPage isDarkMode={isDarkMode} />}
            {activeTab === 'assets' && <AssetManagementSubPage isDarkMode={isDarkMode} />}
            {activeTab === 'contracts' && <ContractManagementSubPage isDarkMode={isDarkMode} />}
            {activeTab === 'accounting' && <AccountingManagement isDarkMode={isDarkMode} />}
            {activeTab === 'billing' && <BillingConfig isDarkMode={isDarkMode} />}
            {activeTab === 'serviceInput' && <RoomServiceInput isDarkMode={isDarkMode} />}
            {activeTab === 'packages' && <PricingMatrix isDarkMode={isDarkMode} />}
            {activeTab === 'developer' && <DeveloperContactModal isOpen={true} isDarkMode={isDarkMode} onClose={() => setActiveTab('overview')} />}
          </div>
        ) : (
          <div className="p-8 overflow-y-auto flex-1 space-y-6">

            {/* TIÊU ĐỀ PHÂN TÍCH */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3" /> TRUNG TÂM PHÂN TÍCH DÒNG TIỀN VÀ BIẾN ĐỘNG VẬN HÀNH
                </span>
                <h2 className={`text-2xl font-black tracking-tight ${theme.title} mt-0.5`}>
                  Báo Cáo Tài Chính & Hiệu Suất Quý {QUARTERLY_DATA.currentQuarter}
                </h2>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${theme.panelSoft}`}>
                <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
                <span>Chu kỳ 6 tháng đầu năm 2026</span>
              </div>
            </div>

            {/* HỆ THỐNG LƯỚI 4 CARD CHỈ SỐ QUÝ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUARTERLY_DATA.metrics.map((metric, idx) => (
                <div key={idx} className={`${theme.panel} border rounded-2xl p-5 flex flex-col justify-between h-40`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[11px] font-bold tracking-wider uppercase max-w-[70%] ${theme.muted}`}>{metric.title}</span>
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${metric.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {metric.trend}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-2xl font-black tracking-tight ${theme.title}`}>{metric.value}</h3>
                      <span className={`text-[10px] font-medium ${theme.mutedSoft}`}>{metric.progress}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-[#AA7C11] to-[#D4AF37]" style={{ width: `${metric.progress}%` }}></div>
                    </div>
                    <p className={`text-[10px] font-medium mt-1.5 ${theme.mutedSoft}`}>{metric.subtext}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* KHU VỰC TRỰC QUAN HÓA BIỂU ĐỒ NÂNG CAO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* 1. BIỂU ĐỒ CỘT VÀ ĐƯỜNG PHỐI HỢP (Doanh thu & Chi phí 6 tháng) */}
              <div className={`lg:col-span-2 ${theme.panel} border rounded-2xl p-6 flex flex-col justify-between shadow-xl`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-[#D4AF37]" />
                      <h3 className={`text-sm font-bold tracking-wide ${theme.title}`}>Xu Hướng Doanh Thu Khớp Chi Phí</h3>
                    </div>
                    <p className={`text-xs ${theme.muted} mt-0.5`}>Biểu đồ dạng cột hỗn hợp nhịp độ tăng trưởng định kỳ</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-sm"></span>
                      <span className={theme.muted}>Doanh thu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-500/30 border border-[#D4AF37]/50 rounded-sm"></span>
                      <span className={theme.muted}>Chi phí</span>
                    </div>
                  </div>
                </div>

                {/* Vùng vẽ đồ thị trực quan bằng SVG linh hoạt */}
                <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-4 border-b border-l border-slate-500/20 px-2">

                  {/* Đường Line xu hướng chạy xuyên suốt phía trên các cột vẽ bằng SVG Path */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path
                      d="M 8,45 L 25,32 L 42,38 L 59,24 L 76,18 L 93,10"
                      fill="none"
                      stroke="#emerald-500"
                      className="stroke-emerald-400"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 8,45 L 25,32 L 42,38 L 59,24 L 76,18 L 93,10"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  </svg>

                  {BAR_CHART_DATA.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                      {/* Tooltip khi hover xem số liệu chi tiết */}
                      <div className="absolute -top-4 bg-[#161622] text-white border border-[#D4AF37]/40 text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                        Thu: {item.revenue}Tr | Chi: {item.cost}Tr
                      </div>

                      <div className="w-full flex justify-center items-end gap-1.5 h-full max-w-[60px]">
                        {/* Cột Chi Phí */}
                        <div
                          style={{ height: `${(item.cost / 300) * 100}%` }}
                          className="w-1/2 bg-amber-500/20 border-t border-x border-[#D4AF37]/30 rounded-t-sm transition-all duration-500 group-hover:bg-amber-500/40"
                        ></div>
                        {/* Cột Doanh Thu */}
                        <div
                          style={{ height: `${(item.revenue / 300) * 100}%` }}
                          className="w-1/2 bg-gradient-to-t from-[#AA7C11] to-[#D4AF37] rounded-t-sm transition-all duration-500 group-hover:brightness-110 shadow-lg shadow-[#D4AF37]/5"
                        ></div>
                      </div>

                      <span className={`text-[10px] font-medium mt-2 whitespace-nowrap ${theme.mutedSoft}`}>
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. BIỂU ĐỒ TRÒN/DONUT TRỰC QUAN (Cấu trúc phân bổ phòng) */}
              <div className={`${theme.panel} border rounded-2xl p-6 flex flex-col justify-between shadow-xl`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-[#D4AF37]" />
                      <h3 className={`text-sm font-bold tracking-wide ${theme.title}`}>Trạng Thái Lấp Đầy</h3>
                    </div>
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  </div>
                  <p className={`text-xs ${theme.muted}`}>Tỷ lệ cấu phần danh mục phòng hiện tại</p>
                </div>

                {/* Biểu đồ Donut dựng bằng vòng tròn SVG nguyên bản (Stroke Dasharray) */}
                <div className="flex justify-center items-center my-4 relative">
                  <svg width="140" height="140" viewBox="0 0 42 42" className="transform -rotate-90">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={isDarkMode ? "#161622" : "#FFF9EC"} strokeWidth="4.5"></circle>

                    {/* Đang thuê: 85% (Màu Emerald) */}
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray="85 15" strokeDashoffset="0"></circle>

                    {/* Còn trống: 10% (Màu Vàng Gold) */}
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#D4AF37" strokeWidth="4.5" strokeDasharray="10 90" strokeDashoffset="-85"></circle>

                    {/* Bảo trì: 5% (Màu Đỏ Rose) */}
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f43f5e" strokeWidth="4.5" strokeDasharray="5 95" strokeDashoffset="-95"></circle>
                  </svg>

                  {/* Chèn Text chính giữa vòng tròn để tạo cấu trúc Donut Chart hiện đại */}
                  <div className="absolute text-center">
                    <span className={`text-xl font-black block leading-none ${theme.title}`}>94.8%</span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5 block">Hiệu suất</span>
                  </div>
                </div>

                {/* Chú thích thông tin chi tiết */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-500/10 text-center">
                  <div>
                    <span className="text-[10px] font-medium text-emerald-500 block">● Đang thuê</span>
                    <strong className={`text-xs ${theme.title}`}>85%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-[#D4AF37] block">● Còn trống</span>
                    <strong className={`text-xs ${theme.title}`}>10%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-rose-500 block">● Bảo trì</span>
                    <strong className={`text-xs ${theme.title}`}>5%</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* PHÂN HỆ DỰ BÁO TRƯỞNG & ĐÁNH GIÁ THÔNG MINH AI */}
            <div className={`border rounded-2xl p-6 relative overflow-hidden shadow-xl ${theme.banner}`}>
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Sparkles className="w-32 h-32 text-[#D4AF37]" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#D4AF37] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> MÔ PHỎNG DỰ BÁO CHIẾN LƯỢC QUÝ KẾ TIẾP (Q3-2026)
                  </span>
                  <h3 className={`text-base font-extrabold mt-1 tracking-tight ${theme.title}`}>
                    Khấu hao vận hành & Điểm bùng phát dòng tiền dự kiến
                  </h3>
                  <p className={`text-xs font-medium leading-relaxed mt-2 ${theme.muted}`}>
                    Hệ thống nhận dạng chu kỳ gia hạn hợp đồng tự động vào Quý 3 cho thấy xu hướng dòng tiền sẽ đạt <strong className="text-emerald-500">+820 Tr VND</strong>. Khuyến nghị chủ trọ tối ưu hóa thêm 5% định mức hao phí năng lượng điện và nước tại các khu vực hành lang chung để duy trì biên lợi nhuận ròng đạt mức tối ưu.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className={`p-3 rounded-xl border ${theme.panelSoft}`}>
                    <span className={`text-[10px] font-bold block ${theme.mutedSoft}`}>DÒNG TIỀN ƯỚC TÍNH</span>
                    <span className="text-sm font-black text-emerald-500">+820 Tr</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${theme.panelSoft}`}>
                    <span className={`text-[10px] font-bold block ${theme.mutedSoft}`}>HỆ SỐ RỦI RO TRỐNG</span>
                    <span className="text-sm font-black text-rose-500">2.1% (Rất thấp)</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${theme.panelSoft}`}>
                    <span className={`text-[10px] font-bold block ${theme.mutedSoft}`}>TỶ SUẤT LỢI NHUẬN</span>
                    <span className="text-sm font-black text-amber-500">~78.4%</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${theme.panelSoft}`}>
                    <span className={`text-[10px] font-bold block ${theme.mutedSoft}`}>ĐỘ TIN CẬY MÔ HÌNH</span>
                    <span className="text-sm font-black text-blue-500">92%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* AI ASSISTANT FLOATING BUTTON & PANEL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Small greeting bubble outside when chat is closed */}
        {!isAssistantOpen && showWelcomeBubble && (
          <div className={`mb-3 mr-2 px-4 py-2.5 rounded-2xl border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-5 duration-300 relative ${isDarkMode ? 'bg-[#16171E] border-[#D4AF37]/40 text-white' : 'bg-white border-[#E5D4AD] text-slate-800'}`}>
            {/* Little pointer arrow */}
            <div className={`absolute bottom-[-6px] right-6 w-3 h-3 rotate-45 border-r border-b ${isDarkMode ? 'bg-[#16171E] border-[#D4AF37]/40' : 'bg-white border-[#E5D4AD]'}`}></div>

            <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
              <Sparkles size={12} className="text-[#D4AF37] animate-pulse" />
              <span>{bubbleText}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeBubble(false);
              }}
              className="opacity-50 hover:opacity-100 transition-opacity ml-1 p-0.5 rounded-full hover:bg-white/10"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Chat window panel */}
        {isAssistantOpen && (
          <div className={`mb-4 w-80 sm:w-96 h-[480px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ${theme.panel}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2C2D35]/50 bg-gradient-to-r from-[#AA7C11]/10 to-[#D4AF37]/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h4 className={`text-xs font-bold ${theme.title} uppercase tracking-wider`}>Trợ Lý Vận Hành AI</h4>
                  <span className="text-[9px] text-emerald-400 font-mono">NovaBot Online</span>
                </div>
              </div>
              <button
                onClick={() => setIsAssistantOpen(false)}
                className={`${theme.muted} hover:text-white transition-colors`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${msg.sender === 'bot'
                    ? `${isDarkMode ? 'bg-[#1F212A]' : 'bg-[#FFF9EC]'} self-start ${theme.title}`
                    : 'bg-gradient-to-tr from-[#AA7C11] to-[#D4AF37] text-black font-semibold self-end'
                    }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2C2D35]/50 flex gap-2">
              <input
                type="text"
                placeholder="Hỏi trợ lý ảo về doanh thu, phòng..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`flex-1 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#D4AF37] border ${theme.search}`}
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-gradient-to-tr from-[#AA7C11] to-[#D4AF37] text-black font-bold hover:scale-105 active:scale-95 transition-transform"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        {/* Floating Circle Button */}
        <button
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 group overflow-hidden border border-[#D4AF37]/50 bg-[#16171E]"
        >
          {/* Glowing pulse ring */}
          <span className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/50 animate-ping opacity-20 pointer-events-none"></span>
          <img 
            src={assistantIcon} 
            alt="Assistant" 
            className="w-full h-full object-cover" 
            style={{ imageRendering: '-webkit-optimize-contrast', transform: 'translateZ(0)' }}
          />
        </button>
      </div>

      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  );
}