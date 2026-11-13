import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, Wrench } from 'lucide-react';
import { getOrganizationTickets, updateTicketStatus } from '../api/ticketApi';

const STATUS_LABEL = { Pending: 'Chờ xử lý', InProgress: 'Đang xử lý', Resolved: 'Đã xử lý' };
const OPEN_STATUSES = ['Pending', 'InProgress'];

function getOrgId() {
    try {
        return JSON.parse(localStorage.getItem('ns_account') || '{}').organizationId || '';
    } catch {
        return '';
    }
}

// Chuông thông báo trên topbar của chủ nhà: hiện số phiếu cư dân gửi chưa xử lý xong
export default function MaintenanceInbox({ isDarkMode }) {
    const [open, setOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState(null);
    const orgId = getOrgId();

    const loadTickets = useCallback(async () => {
        if (!orgId) return;
        try {
            const all = await getOrganizationTickets(orgId);
            setTickets(all.filter(t => OPEN_STATUSES.includes(t.status)));
            setError('');
        } catch (err) {
            setError(err.message || 'Không tải được thông báo');
        }
    }, [orgId]);

    // Tải khi mở trang và làm mới mỗi 60 giây để chuông cập nhật
    useEffect(() => {
        Promise.resolve().then(loadTickets);
        const timer = setInterval(loadTickets, 60000);
        return () => clearInterval(timer);
    }, [loadTickets]);

    const changeStatus = async (ticketId, status) => {
        setBusyId(ticketId);
        try {
            await updateTicketStatus(ticketId, status);
            await loadTickets();
        } catch (err) {
            setError(err.message || 'Không cập nhật được phiếu');
        } finally {
            setBusyId(null);
        }
    };

    const panelBg = isDarkMode ? 'bg-[#11111A] border-[#2A2518] text-white' : 'bg-white border-slate-200 text-slate-800';
    const muted = isDarkMode ? 'text-gray-400' : 'text-slate-500';
    const itemBg = isDarkMode ? 'bg-[#161622] border-[#2A2518]' : 'bg-slate-50 border-slate-200';

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => { setOpen(o => !o); if (!open) loadTickets(); }}
                className={`relative p-2 rounded-xl border transition-all ${isDarkMode ? 'border-[#2A2518] text-gray-300 hover:border-[#D4AF37]' : 'border-slate-200 text-slate-600 hover:border-[#D4AF37]'}`}
                aria-label="Thông báo sự cố"
            >
                <Bell size={20} />
                {tickets.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {tickets.length}
                    </span>
                )}
            </button>

            {open && (
                <div className={`absolute right-0 mt-2 w-[360px] max-w-[90vw] max-h-[70vh] overflow-y-auto rounded-2xl border shadow-2xl z-30 p-4 ${panelBg}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-black flex items-center gap-2">
                            <Wrench size={16} className="text-[#D4AF37]" /> Sự cố cần xử lý
                        </h4>
                        <button type="button" onClick={() => setOpen(false)} className={muted}><X size={18} /></button>
                    </div>

                    {error && <p className="text-xs text-rose-400 mb-2">{error}</p>}
                    {!error && tickets.length === 0 && (
                        <p className={`text-xs ${muted}`}>Không có sự cố nào đang chờ xử lý.</p>
                    )}

                    <div className="space-y-3">
                        {tickets.map(t => (
                            <div key={t.id} className={`p-3 rounded-xl border ${itemBg}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-bold">{t.category}</p>
                                    <span className="text-[10px] font-bold text-[#D4AF37] whitespace-nowrap">
                                        {STATUS_LABEL[t.status] || t.status}
                                    </span>
                                </div>
                                <p className={`text-[11px] mt-1 ${muted}`}>
                                    {t.roomNumber ? `Phòng ${t.roomNumber}` : 'Chưa rõ phòng'}
                                    {t.residentName ? ` • ${t.residentName}` : ''}
                                </p>
                                <p className="text-xs mt-2 whitespace-pre-line">{t.userDescription}</p>
                                <p className={`text-[10px] mt-2 ${muted}`}>
                                    {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : ''}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    {t.status === 'Pending' && (
                                        <button
                                            type="button"
                                            disabled={busyId === t.id}
                                            onClick={() => changeStatus(t.id, 'InProgress')}
                                            className="flex-1 text-[11px] font-bold py-1.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:opacity-50"
                                        >
                                            Nhận xử lý
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        disabled={busyId === t.id}
                                        onClick={() => changeStatus(t.id, 'Resolved')}
                                        className="flex-1 text-[11px] font-bold py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-1"
                                    >
                                        <Check size={12} /> Đã xử lý xong
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
