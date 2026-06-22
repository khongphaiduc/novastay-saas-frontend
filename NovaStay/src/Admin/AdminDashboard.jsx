import React, { useState } from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    DollarSign,
    TrendingUp,
    ShieldCheck,
    Layers,
    ChevronRight,
    PieChart,
    Home,
    Bell,
    Search,
    SlidersHorizontal,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    // Dữ liệu giả lập cho Thống kê tổng quan
    const stats = [
        { id: 1, name: 'Tổng Doanh Nghiệp', value: '1,248', change: '+12.5%', isPositive: true, icon: Building2 },
        { id: 2, name: 'Tổng Cư Dân / Khách', value: '45,892', change: '+8.2%', isPositive: true, icon: Users },
        { id: 3, name: 'Doanh Thu Hệ Thống', value: '$128,400', change: '+18.4%', isPositive: true, icon: DollarSign },
        { id: 4, name: 'Tỷ Lệ Lấp Đầy TB', value: '88.6%', change: '-1.2%', isPositive: false, icon: TrendingUp },
    ];

    // Phân loại phân khúc dịch vụ của Platform
    const accommodationTypes = [
        { type: 'Nhà trọ & Chung cư mini', count: '642 bđs', revenue: '$42,500', share: '45%', color: 'from-amber-500 to-yellow-600' },
        { type: 'Nhà nghỉ & Khách sạn', count: '312 bđs', revenue: '$52,100', share: '30%', color: 'from-yellow-600 to-golden-500' },
        { type: 'Homestay & Backbox', count: '294 bđs', revenue: '$33,800', share: '25%', color: 'from-orange-500 to-amber-600' },
    ];

    // Danh sách Doanh nghiệp VIP mới tham gia hệ thống
    const recentEnterprises = [
        { id: 'DN-9921', name: 'Aman Resorts Group', type: 'Khách sạn & Homestay', status: 'Active', Premium: true, date: 'Hôm nay' },
        { id: 'DN-9874', name: 'LuxeLiving Mini Apartments', type: 'Chung cư mini', status: 'Active', Premium: true, date: 'Hôm qua' },
        { id: 'DN-9851', name: 'Golden Nomad Stay', type: 'Homestay & Backbox', status: 'Pending', Premium: false, date: '2 ngày trước' },
        { id: 'DN-9742', name: 'Sài Gòn Cozy House', type: 'Nhà trọ hiện đại', status: 'Active', Premium: false, date: '3 ngày trước' },
    ];

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-200 font-sans antialiased selection:bg-amber-500 selection:text-black">

            {/* BACKGROUND GLOWS (Tạo hiệu ứng chiều sâu luxury) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-yellow-600/5 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="flex h-screen overflow-hidden relative z-10">

                {/* SIDEBAR */}
                <aside className="w-72 bg-[#0E131F]/80 backdrop-blur-md border-r border-slate-800/60 flex flex-col justify-between p-6">
                    <div>
                        {/* Logo */}
                        <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800/50 mb-8">
                            <div className="h-9 w-9 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Home className="text-slate-950 h-5 w-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <span className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-amber-400">
                                    AURA <span className="font-light text-xs text-amber-500 tracking-widest block uppercase">SaaS Property</span>
                                </span>
                            </div>
                        </div>

                        {/* Navigation Navigation */}
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-3">Core Hub</p>

                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'overview' ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span className="text-sm font-medium">Tổng Quan Hệ Thống</span>
                                </div>
                                <ChevronRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === 'overview' ? 'opacity-100' : ''}`} />
                            </button>

                            <button
                                onClick={() => setActiveTab('enterprises')}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'enterprises' ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">Quản Trị Doanh Nghiệp</span>
                                </div>
                                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">New</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('residents')}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'residents' ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm font-medium">Quản Lý Cư Dân</span>
                                </div>
                            </button>

                            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 pt-6 mb-3">Phân Loại Dịch Vụ</p>
                            <div className="space-y-1 text-xs px-3 text-slate-400">
                                <div className="flex items-center gap-2 py-1.5 hover:text-amber-400 cursor-pointer transition-colors">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Nhà trọ & CC Mini
                                </div>
                                <div className="flex items-center gap-2 py-1.5 hover:text-amber-400 cursor-pointer transition-colors">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-600"></span> Khách sạn & Nhà nghỉ
                                </div>
                                <div className="flex items-center gap-2 py-1.5 hover:text-amber-400 cursor-pointer transition-colors">
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span> Homestay & Backbox
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Profile */}
                    <div className="border-t border-slate-800/60 pt-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 p-[1px]">
                            <div className="h-full w-full bg-[#0E131F] rounded-full flex items-center justify-center text-xs font-bold text-amber-400">
                                AD
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white">Trung Đức</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-amber-500" /> Super Admin
                            </p>
                        </div>
                    </div>
                </aside>

                {/* MAIN DISPLAY AREA */}
                <main className="flex-1 flex flex-col overflow-y-auto">

                    {/* HEADER BAR */}
                    <header className="h-20 border-b border-slate-800/40 bg-[#0B0F17]/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/80 px-4 py-2 rounded-xl w-80">
                            <Search className="h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm doanh nghiệp, cư dân..."
                                className="bg-transparent text-xs w-full focus:outline-none text-slate-300 placeholder-slate-500"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all relative">
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                            </button>
                            <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 hover:brightness-110 transition-all">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                Thiết Lập Hệ Thống
                            </button>
                        </div>
                    </header>

                    {/* DASHBOARD CONTENT BODY */}
                    <div className="flex-1 p-8 space-y-8 max-w-[1600px] w-full mx-auto">

                        {/* Greeting Title */}
                        <div>
                            <h1 className="text-2xl font-light tracking-wide text-white">
                                Chào mừng trở lại, <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Trung Đức</span>
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">Dưới đây là báo cáo vận hành toàn diện của nền tảng lưu trú ngày hôm nay.</p>
                        </div>

                        {/* ROW 1: CORE STATS CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {stats.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <div key={item.id} className="bg-gradient-to-b from-[#121826] to-[#0E131F] border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-bl-full group-hover:bg-amber-500/[0.04] transition-all"></div>

                                        <div className="flex justify-between items-start">
                                            <p className="text-xs font-medium text-slate-400 tracking-wide">{item.name}</p>
                                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-500">
                                                <IconComponent className="h-4 w-4" />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-baseline gap-2">
                                            <span className="text-2xl font-bold tracking-tight text-white">{item.value}</span>
                                            <span className={`text-[10px] font-bold flex items-center px-1.5 py-0.5 rounded bg-slate-900 border ${item.isPositive ? 'text-emerald-400 border-emerald-500/10' : 'text-rose-400 border-rose-500/10'}`}>
                                                {item.isPositive ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
                                                {item.change}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ROW 2: LOẠI HÌNH LƯU TRÚ & DOANH NGHIỆP MỚI */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                            {/* Thống kê loại hình phân khúc */}
                            <div className="xl:col-span-1 bg-[#0E131F]/90 border border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-white tracking-wide">Phân Hệ Lưu Trú</h3>
                                            <p className="text-[11px] text-slate-500">Tỷ trọng doanh thu & số lượng phân khúc</p>
                                        </div>
                                        <PieChart className="h-4 w-4 text-amber-500" />
                                    </div>

                                    <div className="space-y-4">
                                        {accommodationTypes.map((accomm, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:bg-slate-900/80 transition-all">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-medium text-slate-300">{accomm.type}</span>
                                                    <span className="text-xs font-bold text-amber-400">{accomm.share}</span>
                                                </div>
                                                {/* Tiến trình thanh đồ thị sang trọng */}
                                                <div className="w-full h-[3px] bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r ${accomm.color} rounded-full`} style={{ width: accomm.share }}></div>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500">
                                                    <span>Quy mô: {accomm.count}</span>
                                                    <span>Doanh thu tháng: {accomm.revenue}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-800/40 text-center">
                                    <button className="text-xs font-medium text-amber-500 hover:text-amber-400 inline-flex items-center gap-1 transition-colors">
                                        Xem cấu hình phân hệ dịch vụ <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Danh sách quản trị doanh nghiệp mới */}
                            <div className="xl:col-span-2 bg-[#0E131F]/90 border border-slate-800/60 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white tracking-wide">Doanh Nghiệp Gia Nhập Mới</h3>
                                        <p className="text-[11px] text-slate-500">Phê duyệt và kiểm tra thông tin các đối tác SaaS</p>
                                    </div>
                                    <button className="text-xs text-amber-500 font-medium hover:underline">Xem tất cả</button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800/60 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                                <th className="pb-3 font-medium">Mã Đối Tác</th>
                                                <th className="pb-3 font-medium">Tên Doanh Nghiệp</th>
                                                <th className="pb-3 font-medium">Mô Hình Chính</th>
                                                <th className="pb-3 font-medium">Trạng Thái</th>
                                                <th className="pb-3 text-right font-medium">Thời Gian</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/30 text-xs">
                                            {recentEnterprises.map((ent) => (
                                                <tr key={ent.id} className="group hover:bg-slate-900/30 transition-all">
                                                    <td className="py-4 font-mono text-slate-400 group-hover:text-amber-400 transition-colors">{ent.id}</td>
                                                    <td className="py-4 font-medium text-white">
                                                        <div className="flex items-center gap-2">
                                                            {ent.name}
                                                            {ent.Premium && (
                                                                <span className="bg-amber-500/10 text-amber-500 text-[9px] px-1.5 py-0.2 rounded border border-amber-500/20 uppercase font-bold tracking-widest scale-90">Enterprise</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-slate-400">{ent.type}</td>
                                                    <td className="py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${ent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                            <span className={`h-1 w-1 rounded-full ${ent.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                                            {ent.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right text-slate-500">{ent.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                        {/* ROW 3: FOOTER SHORTCUTS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-gradient-to-r from-slate-900 to-[#121826] border border-slate-800/60 rounded-xl flex items-center justify-between group cursor-pointer hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-amber-500/5 text-amber-500">
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-white">Cấu hình biểu phí SaaS</h4>
                                        <p className="text-[10px] text-slate-500">Thay đổi gói dịch vụ đối tác</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                            </div>

                            <div className="p-4 bg-gradient-to-r from-slate-900 to-[#121826] border border-slate-800/60 rounded-xl flex items-center justify-between group cursor-pointer hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-amber-500/5 text-amber-500">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-white">Phân quyền phân hệ Admin</h4>
                                        <p className="text-[10px] text-slate-500">Quản lý kỹ thuật và CSKH</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                            </div>

                            <div className="p-4 bg-gradient-to-r from-slate-900 to-[#121826] border border-slate-800/60 rounded-xl flex items-center justify-between group cursor-pointer hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-amber-500/5 text-amber-500">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-white">Log tích hợp IoT phần cứng</h4>
                                        <p className="text-[10px] text-slate-500">Kiểm tra kết nối khóa từ, điện nước</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}