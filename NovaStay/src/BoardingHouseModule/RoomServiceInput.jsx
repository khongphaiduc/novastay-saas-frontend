import React, { useState, useEffect, useCallback } from 'react';
import { Home, CheckCircle2, AlertCircle, Edit3, User, Zap, Droplet, Wifi, Trash2, X, Save, Sparkles, Bell, AlertTriangle, Info, Check, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { getProperties } from '../api/propertyApi';
import { getRooms } from '../api/roomApi';
import { getMetersByRoom, recordReading } from '../api/utilityApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOrgId() {
    try {
        return JSON.parse(localStorage.getItem('ns_account'))?.organizationId || '';
    } catch { return ''; }
}

function getCurrentBillingPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────
const RoomServiceInput = ({ isDarkMode = true }) => {
    // ── State: danh sách phòng thật từ API
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [fetchError, setFetchError] = useState('');

    // ── State: active tab
    const [activeTab, setActiveTab] = useState('rooms');

    // ── State: nhật ký hoạt động (lưu trong RAM, không cần API)
    const [logs, setLogs] = useState([]);

    // ── State: phòng đang được chọn nhập số
    const [selectedRoom, setSelectedRoom] = useState(null);
    // meters của phòng đang chọn
    const [selectedRoomMeters, setSelectedRoomMeters] = useState([]);
    const [loadingMeters, setLoadingMeters] = useState(false);

    // ── State: form nhập số liệu (map meterId -> currentReading)
    const [meterForms, setMeterForms] = useState({});
    const [note, setNote] = useState('');
    const [billingPeriod, setBillingPeriod] = useState(getCurrentBillingPeriod());
    const [saving, setSaving] = useState(false);
    const [validationError, setValidationError] = useState('');

    // ─── Load danh sách phòng ─────────────────────────────────────────────────
    const loadRooms = useCallback(async () => {
        setLoadingRooms(true);
        setFetchError('');
        try {
            const orgId = getOrgId();
            const propsRes = await getProperties(orgId);
            const properties = propsRes.items || [];

            const roomLists = await Promise.all(
                properties.map(async p => {
                    try {
                        const res = await getRooms({ propertyId: p.id, pageSize: 100 });
                        return (res.items || []).map(r => ({
                            ...r,
                            name: r.roomNumber || r.name || `Phòng ${r.id?.slice(0, 6)}`,
                            propertyName: p.name,
                        }));
                    } catch { return []; }
                })
            );
            setRooms(roomLists.flat());
        } catch (err) {
            setFetchError('Không tải được danh sách phòng. Kiểm tra kết nối.');
        } finally {
            setLoadingRooms(false);
        }
    }, []);

    useEffect(() => { loadRooms(); }, [loadRooms]);

    // ─── Khi chọn phòng: load meters ─────────────────────────────────────────
    const handleRoomClick = async (room) => {
        if (room.status === 'empty' || room.status === 'Empty') {
            addLog('warning', `Phòng ${room.name} đang trống, không thể ghi số liệu.`);
            return;
        }

        setSelectedRoom(room);
        setValidationError('');
        setNote('');
        setBillingPeriod(getCurrentBillingPeriod());
        setMeterForms({});
        setLoadingMeters(true);

        try {
            const meters = await getMetersByRoom(room.id);
            setSelectedRoomMeters(meters);
            // Prefill form với currentReading là previousReading (số cũ) nếu có
            const initial = {};
            meters.forEach(m => {
                initial[m.id] = '';
            });
            setMeterForms(initial);
        } catch (err) {
            addLog('error', `Lỗi tải đồng hồ phòng ${room.name}: ${err.message}`);
            setSelectedRoomMeters([]);
        } finally {
            setLoadingMeters(false);
        }
    };

    // ─── Ghi số liệu ─────────────────────────────────────────────────────────
    const handleSaveData = async (e) => {
        e.preventDefault();
        setValidationError('');

        // Validate: mỗi meter phải có số mới >= số cũ
        for (const meter of selectedRoomMeters) {
            const prev = meter.latestReading?.currentReading ?? meter.initialReading;
            const cur = parseFloat(meterForms[meter.id]);
            if (isNaN(cur) || cur === '') {
                setValidationError(`Vui lòng nhập chỉ số mới cho đồng hồ: ${meter.serviceName}`);
                return;
            }
            if (cur < prev) {
                setValidationError(`Chỉ số mới (${cur}) của ${meter.serviceName} không được nhỏ hơn số cũ (${prev}).`);
                return;
            }
        }

        setSaving(true);
        try {
            const results = await Promise.all(
                selectedRoomMeters.map(m => recordReading(m.id, {
                    billingPeriod,
                    currentReading: parseFloat(meterForms[m.id]),
                    note: note || null,
                }))
            );

            // Tổng hợp log
            const summary = results.map((r, i) => {
                const m = selectedRoomMeters[i];
                return `${m.serviceName}: tiêu thụ ${r.consumption} ${m.unit} = ${r.amount.toLocaleString('vi-VN')}đ`;
            }).join(', ');

            addLog('success', `✅ Phòng ${selectedRoom.name} - Kỳ ${billingPeriod}: ${summary}`);

            // Cập nhật UI: đánh dấu phòng đã ghi số
            setRooms(prev => prev.map(r =>
                r.id === selectedRoom.id ? { ...r, _recorded: true } : r
            ));

            setSelectedRoom(null);
        } catch (err) {
            setValidationError(err.message || 'Lỗi khi ghi số liệu. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // ─── Log helpers ──────────────────────────────────────────────────────────
    const addLog = (type, text) => {
        setLogs(prev => [{
            id: Date.now(),
            type,
            text,
            date: new Date().toLocaleString('vi-VN'),
            read: false,
        }, ...prev]);
    };

    const handleMarkRead = (id) => setLogs(prev => prev.map(l => l.id === id ? { ...l, read: true } : l));
    const handleDeleteLog = (id) => setLogs(prev => prev.filter(l => l.id !== id));
    const handleClearLogs = () => { if (window.confirm('Xóa toàn bộ nhật ký?')) setLogs([]); };

    // ─── Theme ────────────────────────────────────────────────────────────────
    const theme = isDarkMode
        ? {
            wrapper: 'text-slate-100',
            title: 'bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#AA7C11] bg-clip-text text-transparent font-black tracking-wider uppercase',
            subtitle: 'text-xs text-[#D4AF37]/80 font-bold uppercase tracking-widest',
            panel: 'bg-[#11111A] border-[#2A2518]/60 text-slate-200 shadow-xl shadow-black/40',
            label: 'text-[#D4AF37]/60 tracking-wider font-semibold uppercase text-[10px]',
            input: 'bg-[#0B0B12] border-[#2A2518] text-[#D4AF37] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 placeholder-slate-700',
            divider: 'border-[#2A2518]/45',
            textMuted: 'text-slate-300',
            textMutedSoft: 'text-slate-500',
            iconContainer: 'bg-slate-950 border-[#2A2518]/40',
            roomCardEmpty: 'bg-slate-900/10 border-slate-900/40 opacity-40 hover:opacity-50 cursor-not-allowed',
            roomCardUpdated: 'bg-gradient-to-r from-emerald-950/20 to-[#0f2119] border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/10',
            roomCardIdle: 'bg-gradient-to-br from-[#12121A] to-[#161622] border-[#2A2518]/70 hover:border-[#D4AF37]/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.06)] shadow-md',
            modalPanel: 'bg-[#11111A] border-[#2A2518] shadow-2xl shadow-black',
            modalHeader: 'bg-[#0B0B12] border-[#2A2518]/60 text-slate-100',
            modalInputGroup: 'bg-[#0B0B12]/80 border-[#2A2518]/45',
            activeTab: 'luxury-gold-shimmer text-black border-none',
            inactiveTab: 'bg-transparent border-[#2A2518] text-slate-400 hover:text-white',
            logBgUnread: 'bg-slate-900/40 border-[#D4AF37]/20',
            logBgRead: 'bg-[#11111A]/60 border-[#2A2518]/40',
        }
        : {
            wrapper: 'text-slate-900',
            title: 'bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#8A6212] bg-clip-text text-transparent font-black tracking-wider uppercase',
            subtitle: 'text-xs text-amber-600/80 font-bold uppercase tracking-widest',
            panel: 'bg-white border-[#E5D4AD] text-slate-800 shadow-xl shadow-amber-500/5',
            label: 'text-[#8A6212]/60 tracking-wider font-semibold uppercase text-[10px]',
            input: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 placeholder-slate-300',
            divider: 'border-[#E5D4AD]/50',
            textMuted: 'text-slate-700',
            textMutedSoft: 'text-slate-400',
            iconContainer: 'bg-[#FFF9EC] border-[#E5D4AD]/50',
            roomCardEmpty: 'bg-[#FFF9EC]/20 border-stone-200/40 opacity-50 cursor-not-allowed',
            roomCardUpdated: 'bg-gradient-to-r from-emerald-50/40 to-transparent border-emerald-300/80 hover:border-emerald-400 shadow-md',
            roomCardIdle: 'bg-white border-[#E5D4AD] hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.06)] shadow-sm',
            modalPanel: 'bg-white border-[#E5D4AD] shadow-2xl shadow-amber-900/10',
            modalHeader: 'bg-[#FFF9EC] border-[#E5D4AD]/60 text-slate-900',
            modalInputGroup: 'bg-[#FFF9EC]/50 border-[#E5D4AD]/40',
            activeTab: 'luxury-gold-shimmer text-black border-none',
            inactiveTab: 'bg-transparent border-[#E5D4AD] text-slate-600 hover:text-slate-900',
            logBgUnread: 'bg-[#FFF9EC]/60 border-[#D4AF37]/30 shadow-sm',
            logBgRead: 'bg-white border-[#E5D4AD]/45',
        };

    const getLogIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'error':   return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:        return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getMeterIcon = (meterType) => {
        const t = (meterType || '').toLowerCase();
        if (t.includes('electric') || t.includes('điện')) return <Zap size={14} className="text-[#D4AF37]" />;
        if (t.includes('water') || t.includes('nước')) return <Droplet size={14} className="text-cyan-500" />;
        return <Sparkles size={14} className="text-purple-400" />;
    };

    // ─── Derived stats ────────────────────────────────────────────────────────
    const occupiedRooms = rooms.filter(r => r.status?.toLowerCase() === 'occupied');
    const recordedRooms = rooms.filter(r => r._recorded);
    const pendingRooms = occupiedRooms.filter(r => !r._recorded);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className={`p-8 space-y-8 font-sans ${theme.wrapper}`}>
            <style>{`
                @keyframes goldShimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .luxury-gold-shimmer {
                    background: linear-gradient(135deg, #AA7C11, #D4AF37, #FFF3CC, #D4AF37, #AA7C11);
                    background-size: 200% auto;
                    animation: goldShimmer 4s linear infinite;
                }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Sub Tab Switcher */}
                <div className="flex border-b border-[#2A2518]/20 pb-4 justify-between items-center">
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setActiveTab('rooms')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${activeTab === 'rooms' ? theme.activeTab : theme.inactiveTab}`}>
                            <Home size={14} /> Danh Sách Phòng
                        </button>
                        <button type="button" onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all relative ${activeTab === 'notifications' ? theme.activeTab : theme.inactiveTab}`}>
                            <Bell size={14} /> Nhật Ký
                            {logs.some(l => !l.read) && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTab === 'notifications' && logs.length > 0 && (
                            <button type="button" onClick={handleClearLogs}
                                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${isDarkMode ? 'border-[#2A2518] text-slate-300 hover:bg-slate-800' : 'border-stone-200 text-stone-700 hover:bg-stone-50'}`}>
                                <Trash2 size={13} /> Xóa nhật ký
                            </button>
                        )}
                        <button type="button" onClick={loadRooms} title="Làm mới danh sách"
                            className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'border-[#2A2518] text-slate-400 hover:bg-slate-800' : 'border-stone-200 text-stone-500 hover:bg-stone-100'}`}>
                            <RefreshCw size={13} className={loadingRooms ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* TAB 1: DANH SÁCH PHÒNG */}
                {activeTab === 'rooms' && (
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {[
                                { label: 'Tổng số phòng', val: rooms.length, color: 'text-inherit' },
                                { label: 'Phòng đang ở', val: occupiedRooms.length, color: 'text-blue-500' },
                                { label: 'Đã ghi số kỳ này', val: recordedRooms.length, color: 'text-emerald-500' },
                                { label: 'Chưa ghi số', val: pendingRooms.length, color: 'text-[#D4AF37]' },
                            ].map((stat, idx) => (
                                <div key={idx} className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${theme.panel}`}>
                                    <span className={`text-[10px] ${theme.label} block mb-1.5`}>{stat.label}</span>
                                    <span className={`text-3xl font-black ${stat.color}`}>{stat.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Kỳ ghi nhận */}
                        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${theme.panel}`}>
                            <span className={`text-xs font-bold uppercase tracking-widest ${theme.label}`}>Kỳ ghi nhận:</span>
                            <input
                                type="month"
                                value={billingPeriod}
                                onChange={e => setBillingPeriod(e.target.value)}
                                className={`border rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none transition-all ${theme.input}`}
                            />
                            <span className={`text-xs ${theme.textMutedSoft}`}>Số liệu sẽ được ghi cho kỳ này</span>
                        </div>

                        {/* Loading / Error */}
                        {loadingRooms && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
                                <p className={`text-sm ${theme.textMutedSoft}`}>Đang tải danh sách phòng...</p>
                            </div>
                        )}

                        {!loadingRooms && fetchError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {fetchError}
                            </div>
                        )}

                        {/* Room list */}
                        {!loadingRooms && !fetchError && rooms.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 gap-2">
                                <Home size={32} className="opacity-20" />
                                <p className={`text-sm ${theme.textMutedSoft}`}>Chưa có phòng nào. Hãy thêm phòng trước.</p>
                            </div>
                        )}

                        {!loadingRooms && rooms.length > 0 && (
                            <div className="space-y-4">
                                {rooms.map((room) => {
                                    const isEmpty = room.status?.toLowerCase() === 'empty' || room.status?.toLowerCase() === 'available';
                                    const isRecorded = room._recorded;
                                    return (
                                        <div key={room.id} onClick={() => handleRoomClick(room)}
                                            className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none hover:scale-[1.008]
                                                ${isEmpty ? theme.roomCardEmpty : isRecorded ? theme.roomCardUpdated : theme.roomCardIdle}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3.5 rounded-xl border transition-colors ${theme.iconContainer}`}>
                                                    <Home size={20} className={isEmpty ? 'text-slate-600' : 'text-[#D4AF37]'} />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg tracking-tight block">{room.name}</span>
                                                    <span className={`text-xs ${theme.textMutedSoft} font-light mt-0.5 block`}>
                                                        {room.propertyName && <>{room.propertyName} · </>}
                                                        {isEmpty ? 'Phòng trống' : `Trạng thái: ${room.status}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end pt-3 sm:pt-0 border-t sm:border-none border-slate-800/10">
                                                {isEmpty ? (
                                                    <button disabled type="button"
                                                        className={`text-xs font-semibold px-4 py-2 rounded-xl border cursor-not-allowed ${isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-600' : 'border-stone-100 bg-stone-50 text-stone-400'}`}>
                                                        Phòng trống
                                                    </button>
                                                ) : (
                                                    <button type="button"
                                                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 border ${isRecorded
                                                            ? 'bg-transparent border-emerald-600/30 text-emerald-500 hover:bg-emerald-950/20'
                                                            : 'luxury-gold-shimmer text-black font-extrabold shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95 border-none'
                                                        }`}>
                                                        {isRecorded ? '✓ Đã ghi số' : 'Ghi số liệu'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: NHẬT KÝ */}
                {activeTab === 'notifications' && (
                    <div className={`p-6 rounded-2xl border ${theme.panel} space-y-4`}>
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <Bell size={32} className="opacity-30 mb-2" />
                                <p className="text-sm font-medium">Nhật ký trống</p>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {logs.map((log) => (
                                    <div key={log.id}
                                        className={`flex items-start sm:items-center justify-between p-4 border rounded-2xl transition-all duration-300 gap-4 ${log.read ? theme.logBgRead : theme.logBgUnread}`}>
                                        <div className="flex items-start sm:items-center gap-3">
                                            <div className="pt-0.5 sm:pt-0 shrink-0">{getLogIcon(log.type)}</div>
                                            <div>
                                                <p className={`text-sm ${log.read ? theme.textMutedSoft : theme.textMuted} ${!log.read && 'font-medium'}`}>{log.text}</p>
                                                <span className={`text-[10px] font-mono block mt-1 ${theme.textMutedSoft}`}>{log.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!log.read && (
                                                <button type="button" onClick={() => handleMarkRead(log.id)}
                                                    className={`p-1.5 rounded-xl border flex items-center justify-center transition-all ${isDarkMode ? 'border-[#2A2518] hover:bg-slate-800 text-slate-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700'}`}
                                                    title="Đánh dấu đã đọc"><Check size={12} /></button>
                                            )}
                                            <button type="button" onClick={() => handleDeleteLog(log.id)}
                                                className="p-1.5 rounded-xl transition-all text-red-500 hover:bg-red-500/10"
                                                title="Xóa"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL GHI SỐ LIỆU */}
                {selectedRoom && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
                        <div className={`border w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.12)] ${theme.modalPanel}`}>

                            {/* Header */}
                            <div className={`px-6 py-5 flex justify-between items-center border-b ${theme.modalHeader}`}>
                                <div>
                                    <h3 className="text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-white via-slate-200 to-[#D4AF37] bg-clip-text text-transparent">
                                        Ghi số: {selectedRoom.name}
                                    </h3>
                                    <p className={`text-xs ${theme.textMutedSoft} flex items-center gap-1 mt-1`}>
                                        Kỳ thanh toán: <span className="text-[#D4AF37] font-bold ml-1">{billingPeriod}</span>
                                    </p>
                                </div>
                                <button onClick={() => setSelectedRoom(null)}
                                    className={`p-1.5 rounded-full hover:bg-red-500/10 transition-colors ${theme.textMutedSoft} hover:text-red-500`}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                                {loadingMeters && (
                                    <div className="flex flex-col items-center py-8 gap-2">
                                        <Loader2 size={24} className="animate-spin text-[#D4AF37]" />
                                        <p className={`text-xs ${theme.textMutedSoft}`}>Đang tải đồng hồ...</p>
                                    </div>
                                )}

                                {!loadingMeters && selectedRoomMeters.length === 0 && (
                                    <div className={`p-4 rounded-xl border text-center ${theme.modalInputGroup}`}>
                                        <p className={`text-sm ${theme.textMutedSoft}`}>Phòng này chưa có đồng hồ dịch vụ nào.</p>
                                        <p className={`text-xs ${theme.textMutedSoft} mt-1`}>Hãy thêm đồng hồ trong phần cài đặt dịch vụ.</p>
                                    </div>
                                )}

                                {!loadingMeters && selectedRoomMeters.length > 0 && (
                                    <form id="meter-form" onSubmit={handleSaveData} className="space-y-5">

                                        {validationError && (
                                            <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                                                <AlertTriangle size={14} /> {validationError}
                                            </div>
                                        )}

                                        {selectedRoomMeters.map(meter => {
                                            const prev = meter.latestReading?.currentReading ?? meter.initialReading;
                                            const cur = parseFloat(meterForms[meter.id] || 0);
                                            const consumption = isNaN(cur) ? 0 : Math.max(0, cur - prev);
                                            return (
                                                <div key={meter.id} className="space-y-2.5">
                                                    <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase">
                                                        {getMeterIcon(meter.meterType)}
                                                        <span>{meter.serviceName}</span>
                                                        {meter.meterCode && <span className={`font-mono ${theme.textMutedSoft}`}>#{meter.meterCode}</span>}
                                                    </div>
                                                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${theme.modalInputGroup}`}>
                                                        <div>
                                                            <label className={`text-[10px] ${theme.label} block mb-1.5`}>Số cũ ({meter.unit})</label>
                                                            <input
                                                                type="number" disabled value={prev}
                                                                className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed font-mono opacity-40 ${theme.input}`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-indigo-400 font-bold uppercase block mb-1.5">Số mới ({meter.unit})</label>
                                                            <input
                                                                type="number" required autoFocus
                                                                value={meterForms[meter.id]}
                                                                onChange={e => {
                                                                    setMeterForms(p => ({ ...p, [meter.id]: e.target.value }));
                                                                    setValidationError('');
                                                                }}
                                                                className={`w-full border focus:outline-none rounded-lg px-3 py-2 text-sm font-mono transition-all ${theme.input}`}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={`text-right text-xs ${theme.textMutedSoft}`}>
                                                        Tiêu thụ: <span className="font-bold text-[#D4AF37] font-mono">{consumption}</span> {meter.unit}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Ghi chú */}
                                        <div>
                                            <label className={`text-[10px] ${theme.label} block mb-1.5`}>Ghi chú (tuỳ chọn)</label>
                                            <input type="text" value={note} onChange={e => setNote(e.target.value)}
                                                className={`w-full border focus:outline-none rounded-lg px-3 py-2 text-sm transition-all ${theme.input}`}
                                                placeholder="VD: Ghi theo hóa đơn EVN số 123..." />
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Footer */}
                            {!loadingMeters && selectedRoomMeters.length > 0 && (
                                <div className={`px-6 py-4 flex gap-3 justify-end border-t ${theme.divider} ${isDarkMode ? 'bg-[#0B0B12]/60' : 'bg-[#FFF9EC]/50'}`}>
                                    <button type="button" onClick={() => setSelectedRoom(null)}
                                        className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${isDarkMode ? 'bg-slate-900 border border-[#2A2518] hover:bg-slate-800 text-slate-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}>
                                        Hủy
                                    </button>
                                    <button type="submit" form="meter-form" disabled={saving}
                                        className="luxury-gold-shimmer px-5 py-2.5 text-xs text-black font-extrabold rounded-xl flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-60 disabled:cursor-not-allowed">
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        {saving ? 'Đang lưu...' : 'Xác nhận lưu'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RoomServiceInput;