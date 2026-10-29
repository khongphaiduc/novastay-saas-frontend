import { useState } from 'react';
import {
    Sparkles,
    Check,
    X,
    Zap,
    ShieldCheck,
    Send
} from 'lucide-react';

export default function ProUpgradeModal({ isOpen, onClose, isDarkMode = true }) {
    const [submitted, setSubmitted] = useState(false);
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const theme = isDarkMode
        ? {
            modal: 'bg-[#11111A] border-[#2A2518] text-white',
            header: 'bg-gradient-to-r from-[#1E1609] via-[#161622] to-[#11111A] border-[#2A2518]',
            card: 'bg-[#161622] border-[#2A2518]',
            input: 'bg-[#161622] border-[#2A2518] text-white focus:border-[#D4AF37] placeholder-gray-500',
            title: 'text-white',
            muted: 'text-gray-400',
            mutedSoft: 'text-gray-500'
        }
        : {
            modal: 'bg-[#FAF8F5] border-[#E5D4AD] text-slate-900',
            header: 'bg-gradient-to-r from-[#FFF9EC] to-white border-[#E5D4AD]',
            card: 'bg-white border-[#E5D4AD]',
            input: 'bg-white border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] placeholder-slate-400',
            title: 'text-slate-950',
            muted: 'text-slate-500',
            mutedSoft: 'text-slate-400'
        };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Nâng cấp gói NovaStay PRO"
        >
            <div className={`relative w-full max-w-2xl flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${theme.modal}`}>
                {/* Header */}
                <div className={`p-5 md:px-6 flex items-center justify-between border-b ${theme.header}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] text-black shadow-md shadow-[#D4AF37]/20">
                            <Sparkles className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1">
                                ĐẶC QUYỀN TỰ ĐỘNG HÓA
                            </span>
                            <h3 className={`text-lg font-black tracking-tight ${theme.title} mt-0.5`}>
                                Nâng Cấp Gói NovaStay PRO (Tự Động PayOS)
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="p-2 rounded-xl border border-transparent hover:border-inherit hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 md:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                    <div className="space-y-2">
                        <p className={`text-xs leading-relaxed ${theme.muted}`}>
                            Tính năng phát hành hóa đơn tự động qua cổng <strong>PayOS</strong> hiện đang được thử nghiệm giới hạn cho các tài khoản đối tác demo đã cấu hình server. Các chủ trọ khác hiện có thể phát hành hóa đơn và nhận thanh toán bằng <strong>Chuyển khoản thủ công</strong> (kèm mã QR tùy biến) hoàn toàn miễn phí.
                        </p>
                    </div>

                    {/* Feature comparison / highlights */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                        <div className={`p-4 rounded-xl border space-y-2.5 ${theme.card}`}>
                            <div className="flex items-center gap-2 text-[#D4AF37]">
                                <Zap className="w-4 h-4 stroke-[2.5]" />
                                <span className="text-xs font-black uppercase tracking-wider">Tự động đối soát 24/7</span>
                            </div>
                            <p className={`text-xs ${theme.mutedSoft} leading-relaxed`}>
                                Cư dân quét mã PayOS là tiền về thẳng ngân hàng, hệ thống tự động gạch nợ tức thì qua Webhook mà không cần chủ trọ kiểm tra tin nhắn SMS/App ngân hàng.
                            </p>
                        </div>

                        <div className={`p-4 rounded-xl border space-y-2.5 ${theme.card}`}>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                                <span className="text-xs font-black uppercase tracking-wider">Sổ quỹ kế toán tức thì</span>
                            </div>
                            <p className={`text-xs ${theme.mutedSoft} leading-relaxed`}>
                                Tự động sinh phiếu thực thu và cập nhật dòng tiền vào sổ quỹ kế toán ngay sau khi giao dịch thành công, chống nhầm lẫn thất thoát 100%.
                            </p>
                        </div>
                    </div>

                    {/* Đăng ký nhu cầu */}
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className={`p-4 rounded-xl border space-y-3 ${theme.card}`}>
                            <h4 className={`text-xs font-black uppercase tracking-wider ${theme.title} flex items-center gap-1.5`}>
                                <Send className="w-3.5 h-3.5 text-[#D4AF37]" /> Đăng ký nhận ưu tiên kích hoạt PRO
                            </h4>
                            <p className={`text-xs ${theme.muted}`}>
                                Để lại số điện thoại/Zalo để đội ngũ NovaStay hỗ trợ kết nối cổng thanh toán PayOS riêng cho nhà trọ của bạn khi phiên bản mở rộng ra mắt:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <input
                                    required
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="Số điện thoại / Zalo *"
                                    className={`w-full rounded-xl px-3.5 py-2 text-xs border font-medium focus:outline-none transition-all ${theme.input}`}
                                />
                                <input
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Quy mô phòng trọ (Ví dụ: 30 phòng)"
                                    className={`w-full rounded-xl px-3.5 py-2 text-xs border font-medium focus:outline-none transition-all ${theme.input}`}
                                />
                            </div>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
                                >
                                    <Send className="w-3 h-3 stroke-[2.5]" /> Gửi yêu cầu tư vấn
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2.5">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <span>Cảm ơn bạn đã đăng ký! Đội ngũ NovaStay đã ghi nhận nhu cầu và sẽ liên hệ hỗ trợ cơ sở của bạn trong thời gian sớm nhất.</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 md:px-6 border-t flex justify-between items-center ${theme.card}`}>
                    <span className={`text-[11px] italic ${theme.mutedSoft}`}>
                        * Bạn vẫn có thể tiếp tục sử dụng phương thức Chuyển khoản thủ công như bình thường.
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDarkMode
                            ? 'border-[#2A2518] text-gray-300 hover:bg-white/5'
                            : 'border-[#E5D4AD] text-slate-700 hover:bg-amber-50'
                        }`}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
