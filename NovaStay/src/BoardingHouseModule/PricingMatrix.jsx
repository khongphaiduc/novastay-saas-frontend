import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

const PricingMatrix = () => {
    // Trạng thái số lượng cơ sở để tính giá lũy tiến
    const [branches, setBranches] = useState(1);

    // Định nghĩa dữ liệu các gói từ file Excel (Dành riêng cho Phòng Trọ / CC Mini)
    const pricingData = [
        {
            name: "Free 1 tháng đầu",
            basePrice: 0,
            isRecommended: false,
            coreFeatures: [
                "Phòng không giới hạn",
                "Tự động tạo hóa đơn theo giời gian chỉ định",
                "Quản lý danh mục Tiện ích & Tài sản cố định trong phòng",
                "Báo cáo Tài chính theo Quý",
                "Giám sát Doanh thu",
                "Kiểm toán Dòng tiền",

            ],
            aiFeatures: [
                "Không hỗ trợ AI"
            ],
            limit: "Giới hạn: 01 Cơ sở"
        },
        {
            name: "Gói BASIC",
            basePrice: 199000,
            isRecommended: false,
            coreFeatures: [
                "Bao gồm tất cả tính năng gói Free 1 tháng đầu",
                "Không giới hạn hóa đơn",
                "Gửi hóa đơn tự động",
                "Quản lý kiểm kê Tài sản khi cư dân check-in/check-out",
                "Tự động xác nhận thanh toán khi cư dân chuyển khoản (PayOS)"
            ],
            aiFeatures: [
                "AI thông minh tự động tổng hợp báo cáo ca trực, doanh thu và tình trạng vận hành liên quan."
            ],
            limit: "Thêm cơ sở x Lũy tiến giá"
        },
        {
            name: "Gói PRO",
            basePrice: 399000,
            isRecommended: true,
            coreFeatures: [
                "Bao gồm tất cả tính năng gói BASIC",
                "Quản lý cọc tập trung & Hợp đồng điện tử",
                "Quản lý khấu hao tài sản phòng trọ tự động",
                "Đội ngũ hỗ trợ riêng 24/7",
            ],
            aiFeatures: [
                "Kế thừa AI gói thấp hơn",
                "AI dự báo tỷ lệ lấp đầy phòng trong 30 ngày tiếp theo"
            ],
            limit: "Thêm cơ sở x Lũy tiến giá"
        },
        {
            name: "Gói PREMIUM",
            basePrice: 799000,
            isRecommended: false,
            coreFeatures: [
                "Bao gồm tất cả tính năng gói PRO",
                "Quản lý vận hành hệ thống chuỗi đa chi nhánh chuyên sâu",
                "Quản lý vòng đời tài sản (mua sắm, bảo dưỡng, thanh lý)"
            ],
            aiFeatures: [
                "Kế thừa toàn bộ hệ thống AI trước",
                "AI OCR: Chụp quét CCCD/Passport tự động bóc tách điền hồ sơ khách",
                "AI tự động gạch nợ Real-time ngay khi quét QR thanh toán"
            ],
            limit: "Thêm cơ sở x Lũy tiến giá"
        }
    ];

    const formatCurrency = (amount) => {
        if (amount === 0) return "Miễn phí";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        // Nền tối Luxury với hiệu ứng Radial Gradient màu xanh ngọc lục bảo cổ điển
        <div className="bg-[#0b1511] bg-radial-gradient min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans antialiased relative overflow-hidden">
            {/* Custom inline style for golden glow animations */}
            <style>{`
                @keyframes gold-shimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes soft-gold-glow {
                    0%, 100% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.15), inset 0 0 15px rgba(251, 191, 36, 0.05); }
                    50% { box-shadow: 0 0 45px rgba(251, 191, 36, 0.35), inset 0 0 25px rgba(251, 191, 36, 0.1); }
                }
                .gold-gradient-shimmer {
                    background: linear-gradient(135deg, #d97706, #f59e0b, #fbbf24, #f59e0b, #d97706);
                    background-size: 200% auto;
                    animation: gold-shimmer 3s linear infinite;
                }
                .gold-glow-card {
                    animation: soft-gold-glow 6s ease-in-out infinite;
                }
            `}</style>

            {/* Hiệu ứng ánh sáng nghệ thuật chìm phía sau */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms]"></div>
            <div className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[12000ms]"></div>

            {/* Hạt bụi vàng lung linh bay lơ lửng */}
            <div className="absolute top-1/3 left-10 w-2 h-2 bg-amber-400 rounded-full blur-[1px] opacity-70 animate-ping pointer-events-none duration-[2000ms]"></div>
            <div className="absolute top-1/4 right-20 w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[1px] opacity-60 animate-pulse pointer-events-none duration-[3000ms]"></div>
            <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-amber-500 rounded-full blur-[2px] opacity-40 animate-pulse pointer-events-none duration-[5000ms]"></div>
            <div className="absolute bottom-1/5 right-12 w-2.5 h-2.5 bg-yellow-400 rounded-full blur-[1px] opacity-50 animate-ping pointer-events-none duration-[4000ms]"></div>
            <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-amber-300 rounded-full blur-[1px] opacity-80 animate-ping pointer-events-none duration-[6000ms]"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header với text nhũ vàng thượng lưu */}
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-extrabold sm:text-5xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-3 font-black">
                        <Sparkles className="w-8 h-8 text-amber-400 animate-pulse shrink-0" />
                        Bảng Giá Dịch Vụ NovaStay
                        <Sparkles className="w-8 h-8 text-amber-400 animate-pulse shrink-0" />
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-emerald-100/70 tracking-wide">
                        Phân khúc tối ưu: <span className="text-amber-400 font-medium border-b border-amber-400/30 pb-1">Phòng Trọ / Chung Cư Mini</span>
                    </p>
                </div>

                {/* Khung lưới danh sách gói */}
                <div className="mt-12 space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
                    {pricingData.map((plan, index) => {
                        const finalPrice = plan.basePrice === 0 ? 0 : plan.basePrice * branches;

                        return (
                            <div
                                key={index}
                                className={`rounded-2xl flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-2 backdrop-blur-md ${plan.isRecommended
                                    ? 'bg-gradient-to-b from-[#132820] to-[#0d1c16] border-2 border-amber-400 ring-1 ring-amber-400/50 gold-glow-card'
                                    : 'bg-[#101f1a]/80 border border-emerald-800/60 hover:border-amber-500/30 shadow-xl'
                                    }`}
                            >
                                {/* Badge Khuyên Dùng mạ vàng thượng lưu */}
                                {plan.isRecommended && (
                                    <span className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 text-[#0b1511] px-5 py-1 text-xs font-black rounded-full uppercase tracking-widest shadow-md gold-gradient-shimmer">
                                        Khuyên dùng
                                    </span>
                                )}

                                <div className="p-6">
                                    {/* Tên Gói */}
                                    <h3 className={`text-xl font-bold text-center tracking-wider uppercase flex items-center justify-center gap-1.5 ${plan.isRecommended ? 'text-amber-400' : 'text-emerald-100'
                                        }`}>
                                        {plan.isRecommended && <Sparkles className="w-4 h-4 text-amber-400 animate-spin duration-[10000ms] shrink-0" />}
                                        {plan.name}
                                    </h3>

                                    {/* Hiển thị giá tiền */}
                                    <div className="mt-5 text-center">
                                        <span className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                            {formatCurrency(finalPrice)}
                                        </span>
                                        {plan.basePrice > 0 && <span className="text-xs text-emerald-400/60 font-medium"> /tháng</span>}
                                    </div>

                                    <p className="text-[11px] text-center text-amber-300/70 font-light mt-1.5 tracking-wide">
                                        ⚜️ {plan.basePrice === 0 ? plan.limit : `Áp dụng cho ${branches} cơ sở`}
                                    </p>

                                    <hr className="my-6 border-emerald-800/40" />

                                    {/* Nhóm Core Features */}
                                    <div className="mb-6">
                                        <h4 className="text-[11px] font-semibold text-amber-500/50 uppercase tracking-widest mb-3">Quản lý cốt lõi</h4>
                                        <ul className="space-y-3">
                                            {plan.coreFeatures.map((feat, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-emerald-100/80">
                                                    <span className="text-amber-400 mr-2.5 mt-0.5 text-xs">✔</span>
                                                    <span className="leading-relaxed">{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Nhóm AI Features */}
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-amber-500/50 uppercase tracking-widest mb-3">Trí tuệ nhân tạo AI</h4>
                                        <ul className="space-y-3">
                                            {plan.aiFeatures.map((feat, idx) => {
                                                const isNoAi = feat.includes("Không hỗ trợ");
                                                return (
                                                    <li key={idx} className={`flex items-start text-sm ${isNoAi ? 'text-emerald-100/30 line-through' : 'text-emerald-100/90'}`}>
                                                        <span className={`mr-2.5 mt-0.5 text-xs ${isNoAi ? 'text-emerald-900' : 'text-amber-400'}`}>
                                                            {isNoAi ? '✖' : '✨'}
                                                        </span>
                                                        <span className={feat.includes("OCR") || feat.includes("Real-time") ? "text-amber-300/90 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20" : "leading-relaxed"}>
                                                            {feat}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>

                                </div>

                                {/* Phần chân Card chứa Button */}
                                <div className="p-6 bg-black/20 rounded-b-2xl border-t border-emerald-900/30">
                                    <button
                                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${plan.isRecommended
                                            ? 'gold-gradient-shimmer text-neutral-900 hover:brightness-110 shadow-lg shadow-amber-500/25 font-black'
                                            : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-amber-400/90 border border-amber-500/30 hover:text-amber-300'
                                            }`}
                                    >
                                        {plan.basePrice === 0 ? 'Bắt đầu miễn phí' : 'Đăng ký ngay'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Banner giới thiệu nhận ưu đãi giảm giá */}
                <div className="mt-16 bg-gradient-to-r from-amber-500/10 via-[#10271e] to-amber-500/10 border border-amber-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_20px_rgba(251,191,36,0.05)]">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-400/15 p-3 rounded-full border border-amber-400/30 text-amber-400 animate-pulse">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-amber-200">Chương trình Giới thiệu Đối tác (Referral Program)</h4>
                            <p className="text-sm text-emerald-100/70 mt-1 leading-relaxed">
                                Giới thiệu các đơn vị khác sử dụng dịch vụ của NovaStay để nhận ngay ưu đãi <strong className="text-amber-400">giảm 20%</strong> cho 3 tháng tiếp theo khi họ ký hợp đồng thành công!
                            </p>
                        </div>
                    </div>
                    <button className="gold-gradient-shimmer text-neutral-900 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shrink-0">
                        Chia sẻ mã giới thiệu
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PricingMatrix;