import React, { useState } from 'react';
import { Home, CheckCircle2, AlertCircle, Edit3, User, Zap, Droplet, Wifi, Trash2, X, Save, Sparkles, Bell, AlertTriangle, Info, Check } from 'lucide-react';

const RoomServiceInput = ({ isDarkMode = true }) => {
    // Dữ liệu giả định danh sách phòng trọ
    const [rooms, setRooms] = useState([
        { id: '101', name: 'Phòng 101', status: 'occupied', tenant: 'Nguyễn Văn A', isUpdated: true },
        { id: '102', name: 'Phòng 102', status: 'occupied', tenant: 'Trần Thị B', isUpdated: false },
        { id: '103', name: 'Phòng 103', status: 'empty', tenant: '', isUpdated: false },
        { id: '201', name: 'Phòng 201', status: 'occupied', tenant: 'Lê Văn C', isUpdated: false },
        { id: '202', name: 'Phòng 202', status: 'occupied', tenant: 'Phạm Minh D', isUpdated: true },
        { id: '203', name: 'Phòng 203', status: 'occupied', tenant: 'Hoàng Thị E', isUpdated: false },
    ]);

    // Tab đang kích hoạt của component: 'rooms' hoặc 'notifications'
    const [activeTab, setActiveTab] = useState('rooms');

    // Nhật ký các thông báo chốt số (Tab Thông Báo)
    const [logs, setLogs] = useState([
        { id: 1, type: 'info', text: 'Hệ thống tự động đồng bộ số liệu cũ từ tháng trước thành công.', date: '29/06/2026 08:00', read: false },
        { id: 2, type: 'info', text: 'Bắt đầu kỳ ghi nhận chỉ số điện nước & dịch vụ cuối tháng.', date: '29/06/2026 08:05', read: true }
    ]);

    // State quản lý phòng đang được chọn để nhập số liệu
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [validationError, setValidationError] = useState('');

    // State quản lý form số liệu dịch vụ của phòng được chọn
    const [serviceForm, setServiceForm] = useState({
        electricOld: 0,
        electricNew: 0,
        waterOld: 0,
        waterNew: 0,
        internet: true,
        garbage: true
    });

    // Khi chủ trọ ấn vào một phòng
    const handleRoomClick = (room) => {
        if (room.status === 'empty') {
            const newLog = {
                id: Date.now(),
                type: 'warning',
                text: `Thao tác không hợp lệ: ${room.name} hiện đang trống, không thể nhập số liệu.`,
                date: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
                read: false
            };
            setLogs(prev => [newLog, ...prev]);
            return;
        }

        setSelectedRoom(room);
        setValidationError('');

        setServiceForm({
            electricOld: 1250,
            electricNew: room.isUpdated ? 1380 : 0,
            waterOld: 420,
            waterNew: room.isUpdated ? 435 : 0,
            internet: true,
            garbage: true
        });
    };

    // Xử lý lưu số liệu
    const handleSaveData = (e) => {
        e.preventDefault();

        if (serviceForm.electricNew < serviceForm.electricOld) {
            setValidationError("Số điện mới không được nhỏ hơn số cũ!");
            return;
        }
        if (serviceForm.waterNew < serviceForm.waterOld) {
            setValidationError("Số nước mới không được nhỏ hơn số cũ!");
            return;
        }

        setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, isUpdated: true } : r));

        // Lưu thông báo vào Tab thông báo
        const newLog = {
            id: Date.now(),
            type: 'success',
            text: `Đã cập nhật chỉ số phòng ${selectedRoom.name} thành công. Điện tiêu thụ: ${serviceForm.electricNew - serviceForm.electricOld} kWh, Nước tiêu thụ: ${serviceForm.waterNew - serviceForm.waterOld} m³.`,
            date: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
            read: false
        };
        setLogs(prev => [newLog, ...prev]);

        setSelectedRoom(null);
    };

    const handleMarkRead = (id) => {
        setLogs(prev => prev.map(l => l.id === id ? { ...l, read: true } : l));
    };

    const handleDeleteLog = (id) => {
        setLogs(prev => prev.filter(l => l.id !== id));
    };

    const handleClearLogs = () => {
        if (window.confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
            setLogs([]);
        }
    };

    const electricUsage = Math.max(0, serviceForm.electricNew - serviceForm.electricOld);
    const waterUsage = Math.max(0, serviceForm.waterNew - serviceForm.waterOld);

    // Bảng cấu hình Theme mang phong cách Premium/Luxury hoàng gia
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
            modalServiceContainer: 'bg-[#0B0B12]/40 border-[#2A2518]/40 hover:bg-[#0B0B12]/70 hover:border-[#D4AF37]/40',
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
            modalServiceContainer: 'bg-[#FFF9EC]/30 border-[#E5D4AD]/50 hover:bg-[#FFF9EC]/60 hover:border-[#D4AF37]/50',
            activeTab: 'luxury-gold-shimmer text-black border-none',
            inactiveTab: 'bg-transparent border-[#E5D4AD] text-slate-600 hover:text-slate-900',
            logBgUnread: 'bg-[#FFF9EC]/60 border-[#D4AF37]/30 shadow-sm',
            logBgRead: 'bg-white border-[#E5D4AD]/45',
        };

    const getLogIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

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
                        <button
                            type="button"
                            onClick={() => setActiveTab('rooms')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                                activeTab === 'rooms' ? theme.activeTab : theme.inactiveTab
                            }`}
                        >
                            <Home size={14} /> Danh Sách Phòng Trọ
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all relative ${
                                activeTab === 'notifications' ? theme.activeTab : theme.inactiveTab
                            }`}
                        >
                            <Bell size={14} /> Thông Báo & Nhật Ký
                            {logs.some(l => !l.read) && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'notifications' && logs.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearLogs}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${isDarkMode ? 'border-[#2A2518] text-slate-300 hover:bg-slate-800' : 'border-stone-200 text-stone-700 hover:bg-stone-50'}`}
                        >
                            <Trash2 size={13} /> Xóa nhật ký
                        </button>
                    )}
                </div>

                {/* TAB 1: DANH SÁCH PHÒNG TRỌ */}
                {activeTab === 'rooms' && (
                    <div className="space-y-8">
                        {/* Thống kê nhanh */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {[
                                { label: 'Tổng số phòng trọ', val: rooms.length, color: 'text-inherit' },
                                { label: 'Cư dân đang cư trú', val: rooms.filter(r => r.status === 'occupied').length, color: 'text-blue-500' },
                                { label: 'Hóa đơn đã chốt số', val: rooms.filter(r => r.isUpdated && r.status === 'occupied').length, color: 'text-emerald-500' },
                                { label: 'Số liệu chưa ghi nhận', val: rooms.filter(r => !r.isUpdated && r.status === 'occupied').length, color: 'text-[#D4AF37]' }
                            ].map((stat, idx) => (
                                <div key={idx} className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${theme.panel}`}>
                                    <span className={`text-[10px] ${theme.label} block mb-1.5`}>{stat.label}</span>
                                    <span className={`text-3xl font-black ${stat.color}`}>{stat.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Danh sách phòng dạng List không sử dụng label chỉ báo trạng thái */}
                        <div className="space-y-4">
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    onClick={() => handleRoomClick(room)}
                                    className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none
                                        ${room.status === 'empty'
                                            ? theme.roomCardEmpty
                                            : room.isUpdated
                                                ? theme.roomCardUpdated
                                                : theme.roomCardIdle
                                        } hover:scale-[1.008]`}
                                >
                                    {/* Cột trái: Icon Home + Tên phòng & Cư dân */}
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3.5 rounded-xl border transition-colors ${theme.iconContainer}`}>
                                            <Home size={20} className={room.status === 'empty' ? 'text-slate-600' : 'text-[#D4AF37]'} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg tracking-tight block">{room.name}</span>
                                            {room.status === 'occupied' ? (
                                                <span className={`text-xs ${theme.textMutedSoft} flex items-center gap-1.5 mt-1 font-light`}>
                                                    <User size={12} className="opacity-60 text-[#D4AF37]" /> Khách thuê: {room.tenant}
                                                </span>
                                            ) : (
                                                <span className={`text-xs ${theme.textMutedSoft} italic font-light mt-1 block`}>Sẵn sàng bàn giao</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cột phải: Chỉ có nút thao tác nhanh (Không sử dụng label trạng thái) */}
                                    <div className="flex items-center justify-end pt-3 sm:pt-0 border-t sm:border-none border-slate-800/10">
                                        {room.status === 'empty' ? (
                                            <button
                                                disabled
                                                type="button"
                                                className={`text-xs font-semibold px-4 py-2 rounded-xl border cursor-not-allowed ${
                                                    isDarkMode ? 'border-slate-800 bg-slate-900/30 text-slate-600' : 'border-stone-100 bg-stone-50 text-stone-400'
                                                }`}
                                            >
                                                Phòng trống
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 border ${
                                                    room.isUpdated
                                                        ? 'bg-transparent border-[#2A2518] text-[#D4AF37] hover:bg-[#D4AF37]/5'
                                                        : 'luxury-gold-shimmer text-black font-extrabold shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95 border-none'
                                                }`}
                                            >
                                                {room.isUpdated ? 'Xem & Sửa số' : 'Ghi số liệu'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 2: TAB THÔNG BÁO & NHẬT KÝ */}
                {activeTab === 'notifications' && (
                    <div className={`p-6 rounded-2xl border ${theme.panel} space-y-4`}>
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <Bell size={32} className="opacity-30 mb-2" />
                                <p className="text-sm font-medium">Nhật ký thông báo trống</p>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={`flex items-start sm:items-center justify-between p-4.5 border rounded-2xl transition-all duration-300 gap-4 ${
                                            log.read ? theme.logBgRead : theme.logBgUnread
                                        }`}
                                    >
                                        <div className="flex items-start sm:items-center gap-3">
                                            <div className="pt-0.5 sm:pt-0 shrink-0">
                                                {getLogIcon(log.type)}
                                            </div>
                                            <div>
                                                <p className={`text-sm ${log.read ? theme.textMutedSoft : theme.textMuted} ${!log.read && 'font-medium'}`}>
                                                    {log.text}
                                                </p>
                                                <span className={`text-[10px] font-mono block mt-1 ${theme.textMutedSoft}`}>
                                                    {log.date}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!log.read && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkRead(log.id)}
                                                    className={`p-1.5 rounded-xl border flex items-center justify-center transition-all ${isDarkMode ? 'border-[#2A2518] hover:bg-slate-800 text-slate-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700'}`}
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <Check size={12} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteLog(log.id)}
                                                className={`p-1.5 rounded-xl transition-all text-red-500 hover:bg-red-500/10`}
                                                title="Xóa dòng này"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL NHẬP SỐ LIỆU */}
                {selectedRoom && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300">
                        <div className={`border w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.12)] animate-in fade-in zoom-in-95 duration-300 ${theme.modalPanel}`}>

                            {/* Modal Header */}
                            <div className={`px-6 py-5 flex justify-between items-center border-b ${theme.modalHeader}`}>
                                <div>
                                    <h3 className="text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-white via-slate-200 to-[#D4AF37] bg-clip-text text-transparent">Cập nhật chỉ số: {selectedRoom.name}</h3>
                                    <p className={`text-xs ${theme.textMutedSoft} flex items-center gap-1 mt-1 font-light`}><User size={12} className="text-[#D4AF37] opacity-60" /> Khách thuê: {selectedRoom.tenant}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRoom(null)}
                                    className={`p-1.5 rounded-full hover:bg-red-500/10 transition-colors ${theme.textMutedSoft} hover:text-red-500`}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSaveData} className="p-6 space-y-6">

                                {/* Validation Error Display */}
                                {validationError && (
                                    <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-500 text-xs font-semibold flex items-center gap-2">
                                        <AlertTriangle size={14} />
                                        <span>{validationError}</span>
                                    </div>
                                )}

                                {/* Khối Điện */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs tracking-wider uppercase">
                                        <Zap size={14} /> <span>Chỉ số điện năng tiêu thụ (kWh)</span>
                                    </div>
                                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${theme.modalInputGroup}`}>
                                        <div>
                                            <label className={`text-[10px] ${theme.label} block mb-1.5`}>Số cũ tháng trước</label>
                                            <input
                                                type="number"
                                                disabled
                                                value={serviceForm.electricOld}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed font-mono ${theme.input} opacity-40`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-indigo-500 font-bold uppercase block mb-1.5">Số mới tháng này</label>
                                            <input
                                                type="number"
                                                required
                                                autoFocus
                                                value={serviceForm.electricNew || ''}
                                                onChange={(e) => {
                                                    setServiceForm({ ...serviceForm, electricNew: parseInt(e.target.value) || 0 });
                                                    setValidationError('');
                                                }}
                                                className={`w-full border focus:outline-none rounded-lg px-3 py-2 text-sm font-mono transition-all ${theme.input}`}
                                                placeholder="0000"
                                            />
                                        </div>
                                    </div>
                                    <div className={`text-right text-xs ${theme.textMutedSoft} font-light`}>
                                        Sản lượng tiêu thụ: <span className="font-bold text-[#D4AF37] font-mono">{electricUsage}</span> kWh
                                    </div>
                                </div>

                                {/* Khối Nước */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 text-cyan-500 font-semibold text-xs tracking-wider uppercase">
                                        <Droplet size={14} /> <span>Chỉ số nước sạch tiêu thụ (m³)</span>
                                    </div>
                                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${theme.modalInputGroup}`}>
                                        <div>
                                            <label className={`text-[10px] ${theme.label} block mb-1.5`}>Số cũ tháng trước</label>
                                            <input
                                                type="number"
                                                disabled
                                                value={serviceForm.waterOld}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed font-mono ${theme.input} opacity-40`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-indigo-500 font-bold uppercase block mb-1.5">Số mới tháng này</label>
                                            <input
                                                type="number"
                                                required
                                                value={serviceForm.waterNew || ''}
                                                onChange={(e) => {
                                                    setServiceForm({ ...serviceForm, waterNew: parseInt(e.target.value) || 0 });
                                                    setValidationError('');
                                                }}
                                                className={`w-full border focus:outline-none rounded-lg px-3 py-2 text-sm font-mono transition-all ${theme.input}`}
                                                placeholder="0000"
                                            />
                                        </div>
                                    </div>
                                    <div className={`text-right text-xs ${theme.textMutedSoft} font-light`}>
                                        Sản lượng tiêu thụ: <span className="font-bold text-cyan-500 font-mono">{waterUsage}</span> m³
                                    </div>
                                </div>

                                {/* Các dịch vụ cố định đi kèm */}
                                <div className={`pt-4 border-t ${theme.divider}`}>
                                    <label className={`text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37]/80 block mb-3`}>Dịch vụ mặc định đi kèm</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`flex items-center justify-between border px-4 py-3 rounded-xl cursor-pointer select-none transition-all duration-200 ${theme.modalServiceContainer}`}>
                                            <span className={`text-xs flex items-center gap-2 font-light ${theme.textMuted}`}><Wifi size={14} className="opacity-70" /> Internet cáp quang</span>
                                            <input
                                                type="checkbox"
                                                checked={serviceForm.internet}
                                                onChange={(e) => setServiceForm({ ...serviceForm, internet: e.target.checked })}
                                                className="accent-[#D4AF37] rounded-md w-4 h-4 cursor-pointer"
                                            />
                                        </label>
                                        <label className={`flex items-center justify-between border px-4 py-3 rounded-xl cursor-pointer select-none transition-all duration-200 ${theme.modalServiceContainer}`}>
                                            <span className={`text-xs flex items-center gap-2 font-light ${theme.textMuted}`}><Trash2 size={14} className="opacity-70" /> Thu gom rác thải</span>
                                            <input
                                                type="checkbox"
                                                checked={serviceForm.garbage}
                                                onChange={(e) => setServiceForm({ ...serviceForm, garbage: e.target.checked })}
                                                className="accent-[#D4AF37] rounded-md w-4 h-4 cursor-pointer"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Nút hành động */}
                                <div className={`flex gap-3 justify-end pt-5 border-t ${theme.divider}`}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRoom(null)}
                                        className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-slate-900 border border-[#2A2518] hover:bg-slate-800 text-slate-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
                                    >
                                        Hủy tác vụ
                                    </button>
                                    <button
                                        type="submit"
                                        className="luxury-gold-shimmer px-5 py-2.5 text-xs text-black font-extrabold rounded-xl flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20"
                                    >
                                        <Save size={14} /> Xác nhận lưu số liệu
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RoomServiceInput;