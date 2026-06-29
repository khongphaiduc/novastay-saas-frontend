import React, { useState } from 'react';
import { Calendar, Clock, Bell, DollarSign, ShieldCheck, Save, HelpCircle } from 'lucide-react';

const BillingConfig = ({ isDarkMode = true }) => {
    // State quản lý cấu hình tiền nhà
    const [roomBilling, setRoomBilling] = useState({
        billingCycle: 'monthly', // monthly, quarterly, yearly
        invoiceDate: 1,         // Ngày chốt hóa đơn (1-31)
        paymentDeadline: 5,     // Hạn chót đóng tiền (Số ngày sau khi chốt)
        autoCreateInvoice: true
    });

    // State quản lý cấu hình dịch vụ
    const [services, setServices] = useState([
        { id: 'electricity', name: 'Tiền Điện', type: 'meter', collectDay: 'same_as_room', customDay: 1, active: true },
        { id: 'water', name: 'Tiền Nước', type: 'meter', collectDay: 'same_as_room', customDay: 1, active: true },
        { id: 'internet', name: 'Internet / Wifi', type: 'fixed', collectDay: 'same_as_room', customDay: 1, active: true },
        { id: 'trash', name: 'Rác & Vệ sinh', type: 'fixed', collectDay: 'same_as_room', customDay: 1, active: true },
    ]);

    // State quản lý nhắc nợ
    const [reminder, setReminder] = useState({
        remindBefore: 3,        // Nhắc trước X ngày
        remindAfter: 2,         // Nhắc sau X ngày nếu trễ hạn
        channels: { sms: false, zalo: true, email: true }
    });

    // Handler thay đổi dữ liệu dịch vụ
    const handleServiceChange = (id, field, value) => {
        setServices(services.map(srv => srv.id === id ? { ...srv, [field]: value } : srv));
    };

    // Handler khi lưu cấu hình
    const handleSave = (e) => {
        e.preventDefault();
        const fullConfig = { roomBilling, services, reminder };
        console.log("Cấu hình được lưu:", fullConfig);
        alert("🎉 Đã lưu cấu hình thu tiền tự động thành công!");
    };

    const theme = isDarkMode
        ? {
            title: 'bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent',
            subtitle: 'text-slate-400',
            panel: 'bg-slate-800/50 border-slate-700/60 text-slate-100',
            sectionTitle: 'text-slate-200',
            label: 'text-slate-400',
            input: 'bg-slate-900 border-slate-700 text-slate-200 focus:border-blue-500',
            divider: 'border-slate-700/50',
            textMuted: 'text-slate-300',
            textMutedSoft: 'text-slate-500',
            tableHead: 'text-slate-400 bg-[#0F0F17]/50 border-slate-700/30',
            tableRowBorder: 'divide-slate-800/60',
            tableCellText: 'text-slate-200',
            tableBg: 'bg-slate-900/40 border-slate-700/40 text-slate-300',
            borderB: 'border-slate-800',
            noteBg: 'bg-slate-900/20 text-slate-500',
            checkboxContainer: 'bg-[#11111A] border-slate-700 hover:border-slate-600 text-slate-300',
        }
        : {
            title: 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent',
            subtitle: 'text-slate-600',
            panel: 'bg-white border-[#E5D4AD] text-slate-900 shadow-sm',
            sectionTitle: 'text-slate-800 font-bold',
            label: 'text-slate-500',
            input: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            divider: 'border-[#E5D4AD]/50',
            textMuted: 'text-slate-700',
            textMutedSoft: 'text-slate-400',
            tableHead: 'text-slate-600 bg-[#FFF9EC] border-[#E5D4AD]',
            tableRowBorder: 'divide-[#E5D4AD]',
            tableCellText: 'text-slate-800 font-medium',
            tableBg: 'bg-[#FFF9EC]/40 border-[#E5D4AD]/50 text-slate-700',
            borderB: 'border-[#E5D4AD]',
            noteBg: 'bg-[#FFF9EC] text-slate-500 border border-[#E5D4AD]/50',
            checkboxContainer: 'bg-[#FFF9EC]/60 border-[#E5D4AD] hover:border-amber-500/50 text-slate-700',
        };

    return (
        <div className="p-8 space-y-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className={`flex justify-between items-center border-b ${theme.borderB} pb-4`}>
                    <div>
                        <h1 className={`text-2xl font-bold ${theme.title}`}>
                            Cấu Hình Thu Tiền Tự Động
                        </h1>
                        <p className={`text-sm ${theme.subtitle} mt-1`}>Thiết lập thời gian chốt số, xuất hóa đơn và nhắc nợ tự động cho hệ thống.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20"
                    >
                        <Save size={18} /> Lưu Cấu Hình
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">

                    {/* Section 1: Cấu hình tiền nhà */}
                    <div className={`border rounded-xl p-6 backdrop-blur-sm ${theme.panel}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                <Calendar size={20} />
                            </div>
                            <h2 className={`text-lg font-semibold ${theme.sectionTitle}`}>1. Chu Kỳ & Thời Gian Thu Tiền Nhà</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider ${theme.label} mb-2`}>Chu kỳ đóng tiền</label>
                                <select
                                    value={roomBilling.billingCycle}
                                    onChange={(e) => setRoomBilling({ ...roomBilling, billingCycle: e.target.value })}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${theme.input}`}
                                >
                                    <option value="monthly">Hàng tháng</option>
                                    <option value="quarterly">3 tháng / lần</option>
                                    <option value="yearly">Hàng năm</option>
                                </select>
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider ${theme.label} mb-2 flex items-center gap-1`}>
                                    Ngày chốt hóa đơn
                                    <span className={`${theme.textMutedSoft} hover:${theme.textMuted} cursor-pointer`} title="Ngày hệ thống tự động cộng sổ và gửi thông báo tổng tiền"><HelpCircle size={14} /></span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={roomBilling.invoiceDate}
                                        onChange={(e) => setRoomBilling({ ...roomBilling, invoiceDate: parseInt(e.target.value) })}
                                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none appearance-none ${theme.input}`}
                                    >
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>Ngày {i + 1} hàng tháng</option>
                                        ))}
                                        <option value={32}>Ngày cuối cùng của tháng</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider ${theme.label} mb-2`}>Hạn chót thanh toán</label>
                                <select
                                    value={roomBilling.paymentDeadline}
                                    onChange={(e) => setRoomBilling({ ...roomBilling, paymentDeadline: parseInt(e.target.value) })}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${theme.input}`}
                                >
                                    {[3, 5, 7, 10, 15].map(day => (
                                        <option key={day} value={day}>{day} ngày sau khi chốt</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={`mt-4 pt-4 border-t ${theme.divider} flex items-center justify-between`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${theme.textMuted}`}>Tự động gửi hóa đơn điện tử</span>
                                <span className={`text-xs ${theme.textMutedSoft}`}>Hệ thống tự tổng hợp tiền phòng, tiền dịch vụ và gửi hóa đơn ngay khi chốt.</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={roomBilling.autoCreateInvoice}
                                    onChange={(e) => setRoomBilling({ ...roomBilling, autoCreateInvoice: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className={`w-11 h-6 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                            </label>
                        </div>
                    </div>

                    {/* Section 2: Cấu hình tiền dịch vụ */}
                    <div className={`border rounded-xl p-6 backdrop-blur-sm ${theme.panel}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                            <h2 className={`text-lg font-semibold ${theme.sectionTitle}`}>2. Cấu Hìng Thời Gian Thu Tiền Dịch Vụ</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className={`w-full text-left text-sm ${theme.textMuted}`}>
                                <thead className={`text-xs uppercase tracking-wider ${theme.tableHead}`}>
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Dịch vụ</th>
                                        <th className="px-4 py-3">Loại tính phí</th>
                                        <th className="px-4 py-3">Thời gian chốt số</th>
                                        <th className="px-4 py-3 rounded-r-lg text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme.tableRowBorder}`}>
                                    {services.map((service) => (
                                        <tr key={service.id} className={`${!service.active && 'opacity-40'} transition-opacity`}>
                                            <td className={`px-4 py-4 font-medium ${theme.tableCellText}`}>{service.name}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${service.type === 'meter' ? (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-800') : (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-800')}`}>
                                                    {service.type === 'meter' ? 'Theo chỉ số (Điện/Nước)' : 'Cố định/Tháng'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        disabled={!service.active}
                                                        value={service.collectDay}
                                                        onChange={(e) => handleServiceChange(service.id, 'collectDay', e.target.value)}
                                                        className={`border rounded px-2 py-1 text-xs focus:outline-none disabled:cursor-not-allowed ${theme.input}`}
                                                    >
                                                        <option value="same_as_room">Chốt cùng ngày tiền nhà</option>
                                                        <option value="custom">Ngày tùy chỉnh</option>
                                                    </select>

                                                    {service.collectDay === 'custom' && (
                                                        <select
                                                            disabled={!service.active}
                                                            value={service.customDay}
                                                            onChange={(e) => handleServiceChange(service.id, 'customDay', parseInt(e.target.value))}
                                                            className={`border rounded px-1 py-1 text-xs focus:outline-none ${theme.input}`}
                                                        >
                                                            {[...Array(28)].map((_, idx) => (
                                                                <option key={idx + 1} value={idx + 1}>Ngày {idx + 1}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={service.active}
                                                    onChange={(e) => handleServiceChange(service.id, 'active', e.target.checked)}
                                                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 accent-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 3: Nhắc nợ thông minh */}
                    <div className={`border rounded-xl p-6 backdrop-blur-sm ${theme.panel}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                                <Bell size={20} />
                            </div>
                            <h2 className={`text-lg font-semibold ${theme.sectionTitle}`}>3. Cấu Hình Nhắc Nợ Tự Động</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${theme.tableBg}`}>
                                <Clock size={18} className={theme.textMutedSoft} />
                                <div className={`flex-1 flex items-center gap-2 text-sm ${theme.textMuted}`}>
                                    <span>Gửi thông báo nhắc tiền trước hạn</span>
                                    <input
                                        type="number"
                                        value={reminder.remindBefore}
                                        onChange={(e) => setReminder({ ...reminder, remindBefore: parseInt(e.target.value) })}
                                        className={`w-14 border rounded px-2 py-1 text-center font-bold focus:outline-none ${theme.input}`}
                                        min="1" max="10"
                                    />
                                    <span>ngày.</span>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${theme.tableBg}`}>
                                <Clock size={18} className="text-rose-400" />
                                <div className={`flex-1 flex items-center gap-2 text-sm ${theme.textMuted}`}>
                                    <span>Nếu trễ hạn, tự động nhắc lại sau mỗi</span>
                                    <input
                                        type="number"
                                        value={reminder.remindAfter}
                                        onChange={(e) => setReminder({ ...reminder, remindAfter: parseInt(e.target.value) })}
                                        className={`w-14 border rounded px-2 py-1 text-center font-bold focus:outline-none ${theme.input}`}
                                        min="1" max="7"
                                    />
                                    <span>ngày.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider ${theme.label} mb-3`}>Kênh gửi thông báo áp dụng</label>
                            <div className="flex flex-wrap gap-4">
                                {Object.keys(reminder.channels).map((channel) => (
                                    <label key={channel} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer select-none ${theme.checkboxContainer}`}>
                                        <input
                                            type="checkbox"
                                            checked={reminder.channels[channel]}
                                            onChange={(e) => setReminder({
                                                ...reminder,
                                                channels: { ...reminder.channels, [channel]: e.target.checked }
                                            })}
                                            className="rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500 w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold uppercase">{channel}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className={`flex items-center gap-2 text-xs justify-center py-2.5 rounded-lg ${theme.noteBg}`}>
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Hệ thống tự động chạy ngầm (Cron Job) đồng bộ theo múi giờ Việt Nam (GMT+7)</span>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default BillingConfig;