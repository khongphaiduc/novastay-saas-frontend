import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    TrendingUp,
    ShieldCheck,
    ChevronRight,
    Search,
    LogOut,
    Activity,
    UserCheck,
} from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    // ── Auth ──────────────────────────────────────────────────────
    const [adminInfo, setAdminInfo] = useState({ customerName: '', email: '' });

    useEffect(() => {
        try {
            const raw = localStorage.getItem('ns_account');
            if (!raw) { navigate('/login/owner'); return; }
            const acc = JSON.parse(raw);
            if (acc.accountType !== 'Admin') { navigate('/login/owner'); return; }
            setAdminInfo({ customerName: acc.customerName || 'Admin', email: acc.email || '' });
        } catch {
            navigate('/login/owner');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('ns_account');
        navigate('/login/owner');
    };

    const getInitials = (name) => {
        if (!name) return 'AD';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // ── API State ─────────────────────────────────────────────────
    const [dashStats, setDashStats] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [residents, setResidents] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState('');
    const [orgsPage, setOrgsPage] = useState(1);
    const [resPage, setResPage] = useState(1);
    const [orgsLoading, setOrgsLoading] = useState(false);
    const [resLoading, setResLoading] = useState(false);
    const [orgsSearch, setOrgsSearch] = useState('');
    const [orgsStatus, setOrgsStatus] = useState('');
    const [resSearch, setResSearch] = useState('');
    const [resStatus, setResStatus] = useState('');
    const API_ROOT = import.meta.env.VITE_API_URL || '';

    const getHeaders = () => {
        const raw = localStorage.getItem('ns_account');
        if (!raw) return {};
        const { accessToken } = JSON.parse(raw);
        return { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
    };

    // Fetch overview stats on mount
    useEffect(() => {
        const load = async () => {
            try {
                const headers = getHeaders();
                const [sRes, oRes] = await Promise.all([
                    fetch(`${API_ROOT}/api/admin/dashboard/stats`, { headers }),
                    fetch(`${API_ROOT}/api/admin/organizations?page=1&pageSize=10`, { headers }),
                ]);
                if (!sRes.ok || !oRes.ok) throw new Error('Không thể tải dữ liệu.');
                const [s, o] = await Promise.all([sRes.json(), oRes.json()]);
                setDashStats(s);
                setOrganizations(o);
            } catch (err) {
                setDataError(err.message || 'Lỗi kết nối server.');
            } finally {
                setDataLoading(false);
            }
        };
        load();
    }, [API_ROOT]);

    // Fetch orgs tab
    useEffect(() => {
        if (activeTab !== 'enterprises') return;
        const timer = setTimeout(async () => {
            setOrgsLoading(true);
            try {
                const params = new URLSearchParams({ page: orgsPage, pageSize: 20 });
                if (orgsSearch) params.set('search', orgsSearch);
                if (orgsStatus) params.set('status', orgsStatus);
                const res = await fetch(`${API_ROOT}/api/admin/organizations?${params}`, { headers: getHeaders() });
                if (!res.ok) throw new Error();
                setOrganizations(await res.json());
            } catch { /* silent */ }
            finally { setOrgsLoading(false); }
        }, orgsSearch ? 400 : 0);
        return () => clearTimeout(timer);
    }, [activeTab, orgsPage, orgsSearch, orgsStatus, API_ROOT]);

    // Fetch residents tab
    useEffect(() => {
        if (activeTab !== 'residents') return;
        const timer = setTimeout(async () => {
            setResLoading(true);
            try {
                const params = new URLSearchParams({ page: resPage, pageSize: 20 });
                if (resSearch) params.set('search', resSearch);
                if (resStatus) params.set('status', resStatus);
                const res = await fetch(`${API_ROOT}/api/admin/residents?${params}`, { headers: getHeaders() });
                if (!res.ok) throw new Error();
                setResidents(await res.json());
            } catch { /* silent */ }
            finally { setResLoading(false); }
        }, resSearch ? 400 : 0);
        return () => clearTimeout(timer);
    }, [activeTab, resPage, resSearch, resStatus, API_ROOT]);

    // ── Helpers ───────────────────────────────────────────────────
    const fmt = (n) => n?.toLocaleString('en-US') ?? '0';

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const days = Math.floor((Date.now() - d) / 86400000);
        if (days === 0) return 'Hôm nay';
        if (days === 1) return 'Hôm qua';
        if (days < 7) return `${days} ngày trước`;
        return d.toLocaleDateString('vi-VN');
    };

    const statusBadge = (s, map) => {
        const cfg = map[s] || { bg: 'bg-slate-700/40', text: 'text-slate-400', dot: 'bg-slate-400', border: 'border-slate-700' };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {s || '—'}
            </span>
        );
    };

    const orgStatusMap = {
        'Active': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
        'Trial': { bg: 'bg-sky-500/10', text: 'text-sky-400', dot: 'bg-sky-400', border: 'border-sky-500/20' },
        'Expired': { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400', border: 'border-rose-500/20' },
        'Suspended': { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400', border: 'border-orange-500/20' },
    };

    const resStatusMap = {
        'Active': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
        'Pending': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', border: 'border-amber-500/20' },
        'Inactive': { bg: 'bg-slate-700/40', text: 'text-slate-400', dot: 'bg-slate-400', border: 'border-slate-700' },
    };

    const NAV = [
        { id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
        { id: 'enterprises', label: 'Doanh Nghiệp', icon: Building2 },
        { id: 'residents', label: 'Cư Dân', icon: Users },
    ];

    const STATS = dashStats ? [
        { label: 'Tổng Doanh Nghiệp', value: fmt(dashStats.totalOrganizations), icon: Building2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Tổng Cư Dân', value: fmt(dashStats.totalResidents), icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Tài Khoản Business', value: fmt(dashStats.totalBusinessOwnerAccounts), icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { label: 'Tổng Tài Khoản', value: fmt(dashStats.totalAllAccounts), icon: ShieldCheck, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    ] : [];

    // ── Shared UI: Search + Filter bar ──────────────────────────
    const FilterBar = ({ searchVal, onSearch, statusVal, onStatus, onClear, placeholder, statusOptions }) => (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-slate-900/60 border border-slate-800 px-3.5 py-2.5 rounded-xl group focus-within:border-amber-500/40 transition-all">
                <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchVal}
                    onChange={e => onSearch(e.target.value)}
                    className="bg-transparent text-xs text-slate-200 placeholder:text-slate-600 outline-none w-full"
                />
            </div>
            <select
                value={statusVal}
                onChange={e => onStatus(e.target.value)}
                className="bg-slate-900/60 border border-slate-800 text-xs text-slate-300 px-3.5 py-2.5 rounded-xl outline-none cursor-pointer hover:border-amber-500/40 transition-all"
            >
                <option value="">Tất cả trạng thái</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {(searchVal || statusVal) && (
                <button
                    onClick={onClear}
                    className="text-xs px-3.5 py-2.5 rounded-xl border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                    × Xóa bộ lọc
                </button>
            )}
        </div>
    );

    // ── Shared UI: Data Table ─────────────────────────────────────
    const DataTable = ({ columns, rows, isLoading, emptyText, pagination }) => (
        <div className="bg-[#0D1220] border border-slate-800/70 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800/60 bg-slate-900/30">
                            {columns.map(c => (
                                <th key={c.key} className={`px-5 py-3.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase ${c.right ? 'text-right' : ''}`}>
                                    {c.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30 text-xs">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {columns.map(c => (
                                        <td key={c.key} className="px-5 py-4">
                                            <div className="h-3.5 bg-slate-800/60 rounded animate-pulse" style={{ width: c.right ? '60px' : '80%' }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-600 text-xs">
                                    {emptyText}
                                </td>
                            </tr>
                        ) : rows}
                    </tbody>
                </table>
            </div>
            {pagination && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/40 bg-slate-900/20">
                    <button
                        onClick={pagination.onPrev}
                        disabled={pagination.page === 1}
                        className="text-xs px-4 py-2 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700/50"
                    >
                        ← Trước
                    </button>
                    <span className="text-xs text-slate-500 font-medium">Trang {pagination.page}</span>
                    <button
                        onClick={pagination.onNext}
                        disabled={pagination.hasMore === false}
                        className="text-xs px-4 py-2 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700/50"
                    >
                        Tiếp →
                    </button>
                </div>
            )}
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#080C14] text-slate-200 font-sans antialiased">

            {/* Ambient glows */}
            <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-amber-500/[0.06] rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[160px] pointer-events-none" />

            <div className="flex h-screen overflow-hidden relative z-10">

                {/* ── SIDEBAR ──────────────────────────────────────── */}
                <aside className="w-64 bg-[#0C1120]/90 backdrop-blur-xl border-r border-slate-800/50 flex flex-col justify-between py-6 px-4 shrink-0">
                    <div className="space-y-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3 px-3 pb-5 border-b border-slate-800/50">
                            <div className="h-8 w-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                                <Activity className="text-slate-950 h-4 w-4 stroke-[2.5]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white tracking-wide">NovaStay</p>
                                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-medium">Admin Console</p>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="space-y-1">
                            <p className="text-[9px] font-bold tracking-widest text-slate-600 uppercase px-3 mb-2">Điều Hành</p>
                            {NAV.map(({ id, label, icon: Icon }) => {
                                const active = activeTab === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                            active
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                        {label}
                                        {active && <ChevronRight className="h-3 w-3 ml-auto text-amber-500/60" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Profile */}
                    <div className="border-t border-slate-800/50 pt-4 flex items-center gap-3 px-1">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-slate-950 shadow-md">
                            {getInitials(adminInfo.customerName)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{adminInfo.customerName}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="h-2.5 w-2.5 text-amber-500" /> Super Admin
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Đăng xuất"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </aside>

                {/* ── MAIN ─────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-y-auto">

                    {/* Topbar */}
                    <header className="h-16 border-b border-slate-800/40 bg-[#080C14]/60 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-sm font-semibold text-white capitalize">
                                {NAV.find(n => n.id === activeTab)?.label}
                            </h2>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                                {activeTab === 'overview' && 'Tổng quan vận hành hệ thống'}
                                {activeTab === 'enterprises' && 'Danh sách doanh nghiệp đang hoạt động'}
                                {activeTab === 'residents' && 'Quản lý cư dân toàn nền tảng'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-2 rounded-xl w-56">
                                <Search className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="bg-transparent text-xs w-full focus:outline-none text-slate-300 placeholder-slate-600"
                                />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-[10px] font-bold text-slate-950">
                                {getInitials(adminInfo.customerName)}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 p-7 space-y-7">

                        {/* ══ TAB: TỔNG QUAN ══════════════════════════════ */}
                        {activeTab === 'overview' && (<>

                            {/* Page title */}
                            <div>
                                <h1 className="text-xl font-semibold text-white">
                                    Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">{adminInfo.customerName}</span>
                                </h1>
                                <p className="text-xs text-slate-500 mt-1">Báo cáo thời gian thực của nền tảng NovaStay SaaS</p>
                            </div>

                            {/* Stats grid */}
                            {dataLoading ? (
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="bg-[#0D1220] border border-slate-800/50 rounded-2xl p-5 animate-pulse">
                                            <div className="h-3 bg-slate-800 rounded w-1/2 mb-4" />
                                            <div className="h-7 bg-slate-700 rounded w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            ) : dataError ? (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-sm">
                                    ⚠️ {dataError}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                                    {STATS.map((s, i) => (
                                        <div key={i} className="bg-[#0D1220] border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700 transition-all group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/0 to-slate-900/30 opacity-0 group-hover:opacity-100 transition-all" />
                                            <div className="flex items-center justify-between mb-4 relative">
                                                <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
                                                <div className={`p-2 rounded-xl ${s.bg}`}>
                                                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                                                </div>
                                            </div>
                                            <p className={`text-2xl font-bold tracking-tight ${s.color} relative`}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recent enterprises */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Doanh Nghiệp Mới Nhất</h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5">10 doanh nghiệp đăng ký gần đây nhất</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('enterprises')}
                                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                                    >
                                        Xem tất cả <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                                <DataTable
                                    isLoading={dataLoading}
                                    emptyText="Chưa có doanh nghiệp nào."
                                    columns={[
                                        { key: 'name', label: 'Doanh Nghiệp' },
                                        { key: 'area', label: 'Lĩnh Vực' },
                                        { key: 'residents', label: 'Cư Dân' },
                                        { key: 'status', label: 'Trạng Thái' },
                                        { key: 'date', label: 'Ngày Tạo', right: true },
                                    ]}
                                    rows={organizations.map(org => (
                                        <tr key={org.organizationId} className="hover:bg-slate-900/30 transition-all">
                                            <td className="px-5 py-3.5 font-medium text-slate-200 max-w-[180px] truncate">{org.businessName}</td>
                                            <td className="px-5 py-3.5 text-slate-500 max-w-[120px] truncate">{org.businessArea}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-amber-400 font-bold">{org.residentCount}</span>
                                                <span className="text-slate-600 ml-1 text-[11px]">người</span>
                                            </td>
                                            <td className="px-5 py-3.5">{statusBadge(org.subscriptionStatus, orgStatusMap)}</td>
                                            <td className="px-5 py-3.5 text-right text-slate-600">{formatDate(org.createdAt)}</td>
                                        </tr>
                                    ))}
                                />
                            </div>
                        </>)}

                        {/* ══ TAB: DOANH NGHIỆP ═══════════════════════════ */}
                        {activeTab === 'enterprises' && (
                            <div className="space-y-5">
                                <div>
                                    <h1 className="text-xl font-semibold text-white">Quản Trị <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Doanh Nghiệp</span></h1>
                                    <p className="text-xs text-slate-500 mt-1">Toàn bộ doanh nghiệp trên nền tảng kèm thống kê cư dân</p>
                                </div>

                                <FilterBar
                                    searchVal={orgsSearch}
                                    onSearch={v => { setOrgsSearch(v); setOrgsPage(1); }}
                                    statusVal={orgsStatus}
                                    onStatus={v => { setOrgsStatus(v); setOrgsPage(1); }}
                                    onClear={() => { setOrgsSearch(''); setOrgsStatus(''); setOrgsPage(1); }}
                                    placeholder="Tìm theo tên, lĩnh vực, email..."
                                    statusOptions={['Active', 'Trial', 'Expired', 'Suspended']}
                                />

                                <DataTable
                                    isLoading={orgsLoading}
                                    emptyText="Không tìm thấy doanh nghiệp nào."
                                    columns={[
                                        { key: 'name', label: 'Tên Doanh Nghiệp' },
                                        { key: 'area', label: 'Lĩnh Vực' },
                                        { key: 'email', label: 'Email Chủ' },
                                        { key: 'res', label: 'Cư Dân' },
                                        { key: 'status', label: 'Trạng Thái' },
                                        { key: 'date', label: 'Ngày Tạo', right: true },
                                    ]}
                                    rows={organizations.map(org => (
                                        <tr key={org.organizationId} className="hover:bg-slate-900/30 transition-all">
                                            <td className="px-5 py-3.5 font-medium text-slate-200 max-w-[180px] truncate">{org.businessName}</td>
                                            <td className="px-5 py-3.5 text-slate-500 max-w-[120px] truncate">{org.businessArea}</td>
                                            <td className="px-5 py-3.5 text-slate-500 max-w-[180px] truncate">{org.ownerEmail}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-amber-400 font-bold">{org.residentCount}</span>
                                                <span className="text-slate-600 ml-1 text-[11px]">người</span>
                                            </td>
                                            <td className="px-5 py-3.5">{statusBadge(org.subscriptionStatus, orgStatusMap)}</td>
                                            <td className="px-5 py-3.5 text-right text-slate-600">{formatDate(org.createdAt)}</td>
                                        </tr>
                                    ))}
                                    pagination={{
                                        page: orgsPage,
                                        onPrev: () => setOrgsPage(p => Math.max(1, p - 1)),
                                        onNext: () => setOrgsPage(p => p + 1),
                                        hasMore: organizations.length === 20,
                                    }}
                                />
                            </div>
                        )}

                        {/* ══ TAB: CƯ DÂN ══════════════════════════════════ */}
                        {activeTab === 'residents' && (
                            <div className="space-y-5">
                                <div>
                                    <h1 className="text-xl font-semibold text-white">Quản Lý <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Cư Dân</span></h1>
                                    <p className="text-xs text-slate-500 mt-1">Danh sách cư dân toàn hệ thống kèm thông tin tổ chức</p>
                                </div>

                                <FilterBar
                                    searchVal={resSearch}
                                    onSearch={v => { setResSearch(v); setResPage(1); }}
                                    statusVal={resStatus}
                                    onStatus={v => { setResStatus(v); setResPage(1); }}
                                    onClear={() => { setResSearch(''); setResStatus(''); setResPage(1); }}
                                    placeholder="Tìm theo họ tên, số điện thoại..."
                                    statusOptions={['Active', 'Pending', 'Inactive']}
                                />

                                <DataTable
                                    isLoading={resLoading}
                                    emptyText="Không tìm thấy cư dân nào."
                                    columns={[
                                        { key: 'name', label: 'Họ Tên' },
                                        { key: 'email', label: 'Email' },
                                        { key: 'phone', label: 'Điện Thoại' },
                                        { key: 'org', label: 'Doanh Nghiệp' },
                                        { key: 'status', label: 'Trạng Thái' },
                                        { key: 'date', label: 'Tham Gia', right: true },
                                    ]}
                                    rows={residents.map(r => (
                                        <tr key={r.residentId} className="hover:bg-slate-900/30 transition-all">
                                            <td className="px-5 py-3.5 font-medium text-slate-200">{r.fullName || '—'}</td>
                                            <td className="px-5 py-3.5 text-slate-500 max-w-[160px] truncate">{r.email || '—'}</td>
                                            <td className="px-5 py-3.5 text-slate-500">{r.phone || '—'}</td>
                                            <td className="px-5 py-3.5 max-w-[160px] truncate">
                                                {r.organizationName
                                                    ? <span className="text-slate-300">{r.organizationName}</span>
                                                    : <span className="text-slate-700 italic text-[11px]">Chưa thuộc tổ chức</span>}
                                            </td>
                                            <td className="px-5 py-3.5">{statusBadge(r.membershipStatus, resStatusMap)}</td>
                                            <td className="px-5 py-3.5 text-right text-slate-600">{formatDate(r.joinedAt)}</td>
                                        </tr>
                                    ))}
                                    pagination={{
                                        page: resPage,
                                        onPrev: () => setResPage(p => Math.max(1, p - 1)),
                                        onNext: () => setResPage(p => p + 1),
                                        hasMore: residents.length === 20,
                                    }}
                                />
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}