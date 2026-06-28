import { useState } from 'react';
import {
    Code2,
    Phone,
    MessageSquare,
    Mail,
    Copy,
    Check,
    ExternalLink,
    ShieldAlert,
    Terminal,
    RefreshCw,
    X
} from 'lucide-react';

export default function DeveloperContactModal({
    isOpen = true,
    onClose,
    isDarkMode = true,
    // Cho phép truyền mã lỗi và thông điệp động từ hệ thống catch-error
    errorCode = "ERR_NOVA_API_502",
    errorMessage = "Không thể kết nối đến máy chủ cơ sở dữ liệu dòng tiền. Yêu cầu đã bị ngắt quãng."
}) {
    const [copied, setCopied] = useState(false);

    // Cấu hình theme Luxury đồng bộ
    const theme = isDarkMode
        ? {
            backdrop: 'bg-black/70 backdrop-blur-md',
            modal: 'bg-[#11111A] border-[#2A2518] text-slate-100',
            panelSoft: 'bg-[#161622] border-[#2A2518]/60',
            title: 'text-white',
            muted: 'text-gray-400',
            mutedSoft: 'text-gray-500',
            contactBtn: 'bg-[#1A1A26] border-[#2A2518] hover:border-[#D4AF37]/50 text-gray-200'
        }
        : {
            backdrop: 'bg-slate-900/40 backdrop-blur-md',
            modal: 'bg-white border-[#E5D4AD] text-slate-900',
            panelSoft: 'bg-[#FFF9EC] border-[#E5D4AD]/70',
            title: 'text-slate-950',
            muted: 'text-slate-500',
            mutedSoft: 'text-slate-400',
            contactBtn: 'bg-[#FFFDF9] border-[#E5D4AD] hover:border-[#8A6212] text-slate-800'
        };

    const handleCopyErrorCode = () => {
        navigator.clipboard.writeText(`Code: ${errorCode}\nMessage: ${errorMessage}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${theme.backdrop}`}>

            {/* CONTAINER CHÍNH CỦA MODAL BÁO LỖI */}
            <div className={`relative max-w-xl w-full border rounded-2xl p-6 shadow-2xl transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-200 ${theme.modal}`}>

                {/* Nút đóng modal góc trên bên phải */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-500' : 'hover:bg-slate-100 text-slate-400'}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* HEADER: Cảnh báo sự cố hệ thống */}
                <div className="flex items-center gap-3.5 border-b border-slate-500/10 pb-4 mb-5">
                    <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-rose-500 animate-pulse">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-rose-500 uppercase">Hệ thống ghi nhận sự cố</span>
                        <h3 className={`text-base font-black tracking-tight ${theme.title} mt-0.5`}>
                            Kết Nối Dịch Vụ Bị Gián Đoạn
                        </h3>
                    </div>
                </div>

                <p className={`text-xs font-medium leading-relaxed ${theme.muted}`}>
                    Đã có lỗi bất ngờ xảy ra trong quá trình xử lý dữ liệu của bạn. Đừng lo lắng, toàn bộ tiến trình tài chính đã được bảo vệ an toàn. Vui lòng gửi mã lỗi phía dưới cho Đội ngũ Kỹ thuật phần mềm để được xử lý ngay lập tức.
                </p>

                {/* KHỐI HIỂN THỊ CHI TIẾT LỖI KỸ THUẬT (LOG CONSOLE) */}
                <div className={`mt-4 p-4 rounded-xl border font-mono text-xs relative group ${theme.panelSoft}`}>
                    <div className="flex justify-between items-center text-[10px] font-bold text-amber-600/90 tracking-wider uppercase mb-1.5">
                        <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> Thẻ định danh lỗi</span>

                        {/* Nút Copy mã lỗi nhanh */}
                        <button
                            onClick={handleCopyErrorCode}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${isDarkMode ? 'bg-white/5 border-gray-700 text-gray-400 hover:text-white' : 'bg-white border-amber-200 text-slate-600 hover:text-slate-950'}`}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-500">Đã sao chép</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    <span>Sao chép mã</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div className={`font-bold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#8A6212]'}`}>{errorCode}</div>
                    <div className={`text-[11px] mt-1 break-words leading-normal ${theme.mutedSoft}`}>{errorMessage}</div>
                </div>

                {/* CHUYỂN TIẾP: CÁC KÊNH LIÊN HỆ ĐỘI NGŨ PHÁT TRIỂN CHÍNH */}
                <div className="mt-6 space-y-3">
                    <h4 className={`text-[11px] font-black tracking-wider uppercase ${theme.mutedSoft}`}>
                        Liên hệ nhà phát triển (Đội kỹ thuật NovaStay)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Kênh Hotline tổng đài kỹ thuật */}
                        <a
                            href="tel:0123456789"
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.01] ${theme.contactBtn}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-amber-500/10 text-[#D4AF37] rounded-lg"><Phone className="w-3.5 h-3.5" /></div>
                                <div>
                                    <span className="block">Hotline Kỹ Thuật</span>
                                    <span className={`text-[10px] font-medium block ${theme.mutedSoft}`}>0123.456.789 (24/7)</span>
                                </div>
                            </div>
                            <ExternalLink className="w-3 h-3 opacity-40" />
                        </a>

                        {/* Kênh hỗ trợ Zalo / Live Chat */}
                        <a
                            href="https://zalo.me"
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.01] ${theme.contactBtn}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><MessageSquare className="w-3.5 h-3.5" /></div>
                                <div>
                                    <span className="block">Hỗ trợ Zalo Dev</span>
                                    <span className={`text-[10px] font-medium block ${theme.mutedSoft}`}>Phản hồi trong ~2 phút</span>
                                </div>
                            </div>
                            <ExternalLink className="w-3 h-3 opacity-40" />
                        </a>

                        {/* Kênh Báo cáo lỗi qua Email kiểm toán phần mềm */}
                        <a
                            href="mailto:tech@novastay.vn"
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.01] ${theme.contactBtn} sm:col-span-2`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Mail className="w-3.5 h-3.5" /></div>
                                <div>
                                    <span className="block">Gửi Ticket sự cố đến: tech@novastay.vn</span>
                                    <span className={`text-[10px] font-medium block ${theme.mutedSoft}`}>Đính kèm log lỗi tự động để xử lý chuyên sâu</span>
                                </div>
                            </div>
                            <ExternalLink className="w-3 h-3 opacity-40" />
                        </a>

                    </div>
                </div>

                {/* BOTTOM BUTTONS */}
                <div className="mt-6 pt-4 border-t border-slate-500/10 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors inline-flex items-center gap-1.5 ${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 hover:bg-white/5' : 'bg-transparent border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Tải lại trang
                    </button>

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/5 transition-opacity hover:opacity-90"
                        >
                            Tôi Đã Hiểu
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}