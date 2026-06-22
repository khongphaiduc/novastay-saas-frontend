import { useState } from 'react';
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
  Sparkles,
  Wine,
  KeyRound,
  ConciergeBell,
  Moon,
  Sun,
  FileText,
  Package
} from 'lucide-react';
import ResidentManagementSubPage from './ResidentManagement';
import RoomManagementSubPage from './RoomManagementSubPage';
import ServiceSetupSubPage from './ServiceSetupSubPage';
import AssetManagementSubPage from './AssetManagementSubPage';
import ContractManagementSubPage from './ContractManagementSubPage';

const roomStatusLabels = {
  Occupied: 'Đang thuê',
  Available: 'Còn trống',
  Maintenance: 'Bảo trì',
};

const ROOMS_DATA = [
  {
    id: '101',
    type: 'Phòng cao cấp',
    tenant: 'Nguyễn Minh Anh',
    status: 'Occupied',
    rate: '4,5 triệu/tháng',
    service: 'Gói cao cấp',
  },
  {
    id: '102',
    type: 'Studio đầy đủ nội thất',
    tenant: 'Trần Gia Huy',
    status: 'Occupied',
    rate: '3,8 triệu/tháng',
    service: 'Gói tiêu chuẩn',
  },
  {
    id: '201',
    type: 'Phòng ban công rộng',
    tenant: 'Empty',
    status: 'Available',
    rate: '5,2 triệu/tháng',
    service: 'Gói VIP',
  },
  {
    id: '202',
    type: 'Phòng đôi',
    tenant: 'Lê Thu Hà',
    status: 'Maintenance',
    rate: '4 triệu/tháng',
    service: 'Gói cao cấp',
  },
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
    page: 'bg-[#F8F4EA] text-slate-900 selection:bg-[#D4AF37] selection:text-black',
    sidebar: 'bg-white border-[#E5D4AD]',
    sidebarLine: 'border-[#E5D4AD]',
    panel: 'bg-white border-[#E5D4AD]',
    panelSoft: 'bg-[#FFF9EC] border-[#E5D4AD]',
    topbar: 'bg-white/85 border-[#E5D4AD]',
    search: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 placeholder-slate-400',
    muted: 'text-slate-500',
    mutedSoft: 'text-slate-400',
    title: 'text-slate-950',
    navIdle: 'text-slate-600 hover:text-slate-950 hover:bg-amber-50',
    navActive: 'bg-gradient-to-r from-[#FFF1C7] to-white text-[#8A6212] border border-[#D4AF37]/40 shadow-sm',
    banner: 'bg-gradient-to-r from-[#FFF3CC] via-white to-white border-[#E5D4AD]',
    tableHead: 'bg-[#FFF9EC] border-[#E5D4AD]',
    tableDivide: 'divide-[#E5D4AD]',
    tableHover: 'hover:bg-amber-50/70',
    rowText: 'text-slate-700',
    emptyText: 'text-slate-400',
    divider: 'bg-[#E5D4AD]',
  },
};

export default function LuxuryDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? themeConfig.dark : themeConfig.light;

  const [businessName] = useState(() => {
    try {
      const account = localStorage.getItem('ns_account');
      if (account) {
        const parsed = JSON.parse(account);
        return parsed.businessName || '';
      }
    } catch (e) {
      console.warn('Failed to parse ns_account', e);
    }
    return '';
  });

  const navButtonClass = (tabName) =>
    `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tabName ? theme.navActive : theme.navIdle
    }`;

  const cardClass = `${theme.panel} border rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all duration-300 group`;

  return (
    <div className={`min-h-screen font-sans antialiased flex transition-colors duration-300 ${theme.page}`}>

      {/* SIDEBAR */}
      <aside className={`w-72 border-r flex flex-col justify-between p-6 hidden md:flex transition-colors duration-300 ${theme.sidebar}`}>
        <div>
          {/* Logo Brand: Đổi font chữ vuông vức, hiện đại */}
          <div className={`flex items-center gap-3 px-2 py-4 mb-6 border-b ${theme.sidebarLine}`}>
            <div className="bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] p-2 rounded-xl shadow-lg shadow-[#D4AF37]/10">
              <Compass className="w-5 h-5 text-[#0B0B12]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-[#D4AF37]">
                NOVA TRỌ
              </h1>
              <p className="text-[10px] font-bold tracking-wide text-amber-600/90 uppercase">
                Hệ thống vận hành
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <p className={`px-3 text-[10px] font-bold tracking-wider uppercase mb-2 ${theme.mutedSoft}`}>
              Chức năng chính
            </p>

            <button type="button" onClick={() => setActiveTab('overview')} className={navButtonClass('overview')}>
              <LayoutDashboard className="w-4.5 h-4.5" />
              Tổng quan vận hành
            </button>

            <button type="button" onClick={() => setActiveTab('rooms')} className={navButtonClass('rooms')}>
              <Bed className="w-4.5 h-4.5" />
              Danh sách phòng trọ
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('residents')}
              className={navButtonClass('residents')}
            >
              <UserCheck className="w-4.5 h-4.5" />
              Quản lý cư dân
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contracts')}
              className={navButtonClass('contracts')}
            >
              <FileText className="w-4.5 h-4.5" />
              Quản lý hợp đồng
            </button>

            <button type="button" className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${theme.navIdle}`}>
              <Receipt className="w-4.5 h-4.5" />
              Thu chi và công nợ
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assets')}
              className={navButtonClass('assets')}
            >
              <Package className="w-4.5 h-4.5" />
              Quản lý tài sản
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={navButtonClass('services')}
            >
              <ConciergeBell className="w-4.5 h-4.5" />
              Dịch vụ
            </button>
          </nav>
        </div>

        {/* User Profile Bottom */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${theme.panelSoft}`}>
          <div className={`w-9 h-9 rounded-full border border-[#D4AF37] ${isDarkMode ? 'bg-amber-900/30 text-[#D4AF37]' : 'bg-[#FFF9EC] text-[#8A6212]'} flex items-center justify-center text-sm font-bold`}>
            Q
          </div>
          <div>
            <h4 className={`text-xs font-bold ${theme.title}`}>Quản lý nhà trọ</h4>
            <p className={`text-[11px] ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#8A6212]'} font-medium flex items-center gap-1 mt-0.5`}>
              <ShieldCheck className="w-3 h-3" /> Admin Portal
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* TOPBAR */}
        <header className={`h-16 backdrop-blur-md border-b px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300 ${theme.topbar}`}>
          <div className="flex items-center gap-4">
            <div className={`flex items-center border rounded-xl px-3 py-1.5 w-72 ${theme.search}`}>
              <Search className={`w-4 h-4 mr-2 ${theme.mutedSoft}`} />
              <input
                type="text"
                placeholder="Tìm phòng, cư dân..."
                className="bg-transparent text-xs font-medium focus:outline-none w-full placeholder:inherit"
              />
            </div>
            {businessName && (
              <span className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold tracking-wide uppercase transition-all duration-300 ${isDarkMode ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/35 shadow-md shadow-[#D4AF37]/5' : 'bg-[#FFF9EC] text-[#8A6212] border-[#E5D4AD] shadow-sm'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                Chào mừng đến Trung tâm Vận hành {businessName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setIsDarkMode((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${theme.panel} ${theme.muted} hover:border-[#D4AF37] hover:text-[#D4AF37]`}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {isDarkMode ? 'Giao diện sáng' : 'Giao diện tối'}
            </button>

            <div className={`relative cursor-pointer transition ${theme.muted} hover:text-[#D4AF37]`}>
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span>
            </div>

            <div className={`h-5 w-px ${theme.divider}`}></div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span className={`text-[11px] font-bold tracking-wide ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#8A6212]'}`}>
                HỆ THỐNG: ỔN ĐỊNH
              </span>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        {activeTab === 'residents' ? (
          <div className="flex-1 overflow-y-auto">
            <ResidentManagementSubPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'rooms' ? (
          <div className="flex-1 overflow-y-auto">
            <RoomManagementSubPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'services' ? (
          <div className="flex-1 overflow-y-auto">
            <ServiceSetupSubPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'assets' ? (
          <div className="flex-1 overflow-y-auto">
            <AssetManagementSubPage isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === 'contracts' ? (
          <div className="flex-1 overflow-y-auto">
            <ContractManagementSubPage isDarkMode={isDarkMode} />
          </div>
        ) : (
          <div className="p-8 overflow-y-auto flex-1 space-y-6">

            {/* BANNER CHÀO MỪNG */}
            <div className={`relative rounded-2xl overflow-hidden border p-6 shadow-xl ${theme.banner}`}>
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Wine className="w-32 h-32 text-[#D4AF37]" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#D4AF37] block mb-1">
                  Welcome Back
                </span>
                <h2 className={`text-2xl font-extrabold mb-1.5 tracking-tight ${theme.title}`}>
                  Bảng điều hành nhà trọ NovaStay
                </h2>
                <p className={`text-xs font-medium leading-relaxed opacity-90 ${theme.muted}`}>
                  Theo dõi tình trạng phòng, cư dân, doanh thu, công nợ và yêu cầu dịch vụ trong một bảng điều hành tập trung cho mô hình nhà trọ.
                </p>
              </div>
            </div>

            {/* 4 CARDS KINH DOANH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className={cardClass}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold tracking-wide uppercase ${theme.muted}`}>
                    Doanh thu tháng
                  </span>
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-[#D4AF37] group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-xl font-black ${theme.title}`}>
                  248,5 triệu
                </h3>
                <p className="text-[11px] font-bold text-emerald-500 mt-1.5 flex items-center gap-1">
                  +12,4% <span className={`font-medium ${theme.mutedSoft}`}>so với tháng trước</span>
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold tracking-wide uppercase ${theme.muted}`}>
                    Tỷ lệ lấp đầy
                  </span>
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-[#D4AF37] group-hover:scale-105 transition-transform">
                    <Bed className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-xl font-black ${theme.title}`}>92,5%</h3>
                <p className="text-[11px] font-bold text-emerald-500 mt-1.5 flex items-center gap-1">
                  12/14 <span className={`font-medium ${theme.mutedSoft}`}>phòng hoạt động</span>
                </p>
              </div>

              <div className={cardClass}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold tracking-wide uppercase ${theme.muted}`}>
                    Yêu cầu đang xử lý
                  </span>
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-[#D4AF37] group-hover:scale-105 transition-transform">
                    <ConciergeBell className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#8A6212]'}`}>
                  3 yêu cầu
                </h3>
                <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-amber-500' : 'text-amber-700'} mt-1.5`}>Phản hồi nhanh: ~4 phút</p>
              </div>

              <div className={cardClass}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold tracking-wide uppercase ${theme.muted}`}>
                    An ninh truy cập
                  </span>
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-[#D4AF37] group-hover:scale-105 transition-transform">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-xl font-black ${theme.title}`}>100%</h3>
                <p className="text-[11px] font-medium text-emerald-500 mt-1.5">
                  Khóa thông minh đều online
                </p>
              </div>
            </div>

            {/* BẢNG DỮ LIỆU DANH SÁCH PHÒNG */}
            <div className={`border rounded-2xl overflow-hidden shadow-xl ${theme.panel}`}>
              <div className={`p-5 border-b flex justify-between items-center ${theme.tableHead}`}>
                <div>
                  <h3 className={`text-base font-bold ${theme.title}`}>
                    Tình trạng danh sách phòng
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme.muted}`}>
                    Theo dõi phòng trọ, cư dân, giá thuê và gói dịch vụ
                  </p>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 bg-transparent border ${isDarkMode ? 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black' : 'border-[#8A6212] text-[#8A6212] hover:bg-[#8A6212] hover:text-white'} text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-300`}
                >
                  + Thêm phòng mới
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${theme.tableHead}`}>
                      <th className={`p-4 text-xs font-bold tracking-wider uppercase ${theme.muted}`}>
                        Mã phòng
                      </th>
                      <th className={`p-4 text-xs font-bold tracking-wider uppercase ${theme.muted}`}>
                        Loại phòng
                      </th>
                      <th className={`p-4 text-xs font-bold tracking-wider uppercase ${theme.muted}`}>
                        Người thuê chính
                      </th>
                      <th className={`p-4 text-xs font-bold tracking-wider uppercase ${theme.muted}`}>
                        Trạng thái
                      </th>
                      <th className={`p-4 text-xs font-bold tracking-wider uppercase ${theme.muted}`}>
                        Giá thuê
                      </th>
                      <th className={`p-4 text-xs font-bold tracking-wider uppercase ${theme.muted}`}>
                        Gói dịch vụ
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.tableDivide}`}>
                    {ROOMS_DATA.map((room) => (
                      <tr key={room.id} className={`${theme.tableHover} transition-colors group`}>
                        <td className={`p-4 text-sm font-bold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#8A6212]'}`}>
                          #{room.id}
                        </td>
                        <td className={`p-4 text-sm font-semibold ${theme.title}`}>{room.type}</td>
                        <td className={`p-4 text-sm font-medium ${theme.rowText}`}>
                          {room.tenant === 'Empty' ? (
                            <span className={`${theme.emptyText} italic font-normal`}>Chưa có người thuê</span>
                          ) : (
                            room.tenant
                          )}
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`px-2.5 py-1 rounded-lg font-bold tracking-wide border ${room.status === 'Occupied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            room.status === 'Available' ? 'bg-amber-500/10 text-[#D4AF37] border-[#D4AF37]/20' :
                              'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                            {roomStatusLabels[room.status]}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-bold ${theme.rowText}`}>
                          {room.rate}
                        </td>
                        <td className={`p-4 text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} font-bold tracking-wide`}>
                          ✦ {room.service}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}