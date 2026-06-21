import React, { useState } from 'react';
import { Building2, Home, Hotel, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import NovastayLogo from '../components/NovastayLogo';

const NovaStayLogin = () => {
  const [activeTab, setActiveTab] = useState('homestay');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const services = [
    { id: 'motel', name: 'Nhà Trọ', icon: Home, desc: 'Quản lý dãy trọ & người thuê' },
    { id: 'apartment', name: 'Chung Cư Mini', icon: Building2, desc: 'Vận hành căn hộ dịch vụ' },
    { id: 'homestay', name: 'HomeStay', icon: Hotel, desc: 'Tối ưu trải nghiệm nghỉ dưỡng' },
    { id: 'hotel', name: 'Nhà Nghỉ', icon: ShieldCheck, desc: 'Quản lý lưu trú ngắn ngày' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Đăng nhập vào hệ thống ${activeTab}:`, { email, password });
  };

  return (
    // FULL BACKGROUND IMAGE: Đã tinh chỉnh để làm nổi bật rõ nét không gian sang trọng
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased tracking-normal bg-[#020406]">
      
      {/* ==================== PHẦN BACKGROUND ĐÃ ĐƯỢC LÀM RÕ NÉT & SÁNG HƠN ==================== */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2560&auto=format&fit=crop" 
          alt="Luxury Apartment Interior"
          // Tăng opacity lên 75%, bỏ blur để ảnh sắc nét, tăng brightness lên 100%
          className="w-full h-full object-cover opacity-75 scale-100 transition-all duration-700 brightness-100" 
        />
        {/* Lớp phủ Gradient nhẹ nhàng hơn (giảm từ 95% xuống 60%/40%) giúp giữ chi tiết ảnh nền nhưng vẫn nổi bật form đăng nhập */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#040608]/80 via-[#06090d]/40 to-[#080b11]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040608]/20 to-[#040608]/75" />
      </div>

      {/* Hiệu ứng ánh sáng Neon/Glow Aura xung quanh khối đăng nhập */}
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-amber-500/[0.18] rounded-full blur-[140px] z-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[0%] w-[700px] h-[700px] bg-yellow-500/[0.15] rounded-full blur-[160px] z-1 pointer-events-none" />
      <div className="absolute top-[35%] right-[20%] w-[300px] h-[300px] bg-amber-400/[0.08] rounded-full blur-[100px] z-1 pointer-events-none" />
      {/* ============================================================================= */}

      {/* KHỐI ĐĂNG NHẬP CHÍNH - Tăng một chút độ mờ của Glassmorphism (bg-black/50) để text cực kỳ dễ đọc trên nền ảnh sáng */}
      <div className="w-full max-w-5xl z-10 bg-black/50 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_25px_100px_-15px_rgba(0,0,0,0.9)] overflow-hidden grid md:grid-cols-12 min-h-[650px]">
        
        {/* CỘT TRÁI: Hệ sinh thái phân hệ */}
        <div className="md:col-span-5 bg-black/30 p-10 flex flex-col justify-between border-r border-white/[0.06]">
          <div>
            {/* Logo Thương Hiệu - Ánh kim Gold */}
            <div className="flex items-center justify-start mb-12">
              <div className="flex flex-col items-center gap-2">
                <NovastayLogo className="h-10 w-auto" />
                <span className="text-center text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase block whitespace-nowrap">
                  ECOSYSTEM PLATFORM
                </span>
              </div>
            </div>

            {/* Tiêu đề */}
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              Nền tảng quản trị <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                BĐS Lưu Trú Chuyên Nghiệp
              </span>
            </h2>
            <p className="text-sm text-gray-200 mb-9 font-normal leading-relaxed opacity-95">
              Chào mừng quay trở lại. Vui lòng chọn phân hệ kinh doanh bạn muốn quản lý bên dưới.
            </p>

            {/* Danh sách các phân hệ */}
            <div className="space-y-3.5">
              {services.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 border ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400/60 shadow-[0_4px_20px_-5px_rgba(251,191,36,0.25)]'
                        : 'bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`p-3 rounded-lg transition-colors ${
                      isSelected ? 'bg-amber-400 text-gray-950' : 'bg-white/[0.06] text-gray-300'
                    }`}>
                      <IconComponent className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isSelected ? 'text-amber-300' : 'text-gray-100'}`}>
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-normal mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-7 border-t border-white/[0.05] text-xs text-gray-400 font-medium">
            &copy; 2026 NovaStay Technology Global.
          </div>
        </div>

        {/* CỘT PHẢI: Form đăng nhập */}
        <div className="md:col-span-7 p-10 md:p-16 flex flex-col justify-center bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-xl" />

          <div className="max-w-md w-full mx-auto z-10">
            <div className="mb-10">
              <span className="text-xs font-bold tracking-[0.15em] text-amber-500 uppercase block mb-1.5 opacity-100">
                SECURE PORTAL
              </span>
              <h3 className="text-3xl font-extrabold text-white leading-tight">
                Đăng nhập: <span className="text-amber-400 font-bold">{services.find(s => s.id === activeTab)?.name}</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Trường Email */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                  Tài khoản Doanh nghiệp (Email)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                    <Mail className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="example@novastay.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Trường Mật khẩu */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                    Mật khẩu Bảo mật
                  </label>
                  <a href="#forgot" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Ghi nhớ đăng nhập */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/30 bg-black/40 text-amber-500 focus:ring-amber-400/20 accent-amber-400 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2.5 text-xs text-gray-200 font-medium cursor-pointer select-none">
                    Ghi nhớ đăng nhập trên thiết bị này
                  </label>
                </div>
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                className="w-full mt-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_25px_-1px_rgba(251,191,36,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group"
              >
                Xác Nhận Đăng Nhập
                <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1.5" />
              </button>
            </form>

            {/* Chân trang hỗ trợ */}
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-300 font-medium">
                Cần hỗ trợ kỹ thuật?{' '}
                <a href="#contact" className="text-amber-400 font-bold hover:underline">
                  Liên hệ Hotline Admin
                </a>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default NovaStayLogin;