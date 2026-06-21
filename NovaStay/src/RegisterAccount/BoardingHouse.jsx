import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Globe, MapPin, Smartphone, User, Mail } from 'lucide-react';
import NovastayLogo from '../components/NovastayLogo';

export default function LuxuryRegistrationForm({ onBackHome, onContinue }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('vn');
  const [businessArea, setBusinessArea] = useState('');
  const [policy, setPolicy] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onContinue({
      customerName,
      phone,
      email,
      businessArea,
    });
  };

  return (
    // Nền tổng thể được nâng tông sáng hơn một chút nhưng vẫn giữ nét huyền bí cao cấp
    <div className="flex min-h-screen w-full bg-[#080c11] font-sans antialiased relative overflow-hidden">
      
      {/* Hiệu ứng ánh sáng Neon/Glow Aura bừng sáng mạnh mẽ hơn để làm bớt độ tối toàn trang */}
      <div className="absolute top-[-5%] left-[-5%] w-[650px] h-[650px] bg-amber-500/[0.18] rounded-full blur-[130px] z-0 pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[700px] h-[700px] bg-yellow-500/[0.15] rounded-full blur-[140px] z-0 pointer-events-none" />

      {/* ==================== CỘT TRÁI: BANNER HÌNH ẢNH SÁNG RÕ & SANG TRỌNG ==================== */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 z-10 border-r border-white/[0.08]">
        {/* Background Image với Opacity cao và Brightness tốt để nhìn rõ không gian */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Stay Interior"
            className="w-full h-full object-cover opacity-95 brightness-100" 
          />
          {/* Lớp phủ dải màu trong suốt dịu nhẹ (Hạ thấp màu đen, dùng sắc độ trong suốt của RGBA để lộ toàn bộ chi tiết ảnh) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#040608]/75 via-black/20 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-[#040608]/80" />
        </div>

        {/* Logo Thương Hiệu */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex items-center justify-center">
            <NovastayLogo className="h-10 w-auto" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white block">
              NOVA<span className="text-amber-400">STAY</span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] text-gray-300 uppercase block mt-0.5">
              EXPERIENCE CENTER
            </span>
          </div>
        </div>

        {/* Nội dung Slogan chính */}
        <div className="relative z-10 my-auto max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight mb-5 text-white leading-tight">
            Quản lý dễ dàng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              Vận hành BĐS thông minh
            </span>
          </h1>
          <p className="text-sm text-gray-200 leading-relaxed font-semibold opacity-95">
            Thiết lập tài khoản quản trị để trải nghiệm trọn bộ công cụ tự động hóa tính toán hoá đơn, tối ưu doanh thu và quản lý cư dân hiệu quả.
          </p>
          
          {/* Box thông báo tài khoản bằng kính mờ Glassmorphism mượt mà */}
          <div className="mt-8 border border-amber-400/25 px-6 py-4 rounded-xl backdrop-blur-md bg-black/40 inline-block">
            <p className="text-xs text-gray-200 font-semibold tracking-wide">
              Đăng ký cấp quyền cho email:{' '}
              <span className="text-amber-400 font-bold underline ml-1">ptrungduc1011@gmail.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* ==================== CỘT PHẢI: FORM ĐĂNG KÝ SÁNG HƠN ==================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-16 relative z-10 bg-transparent">
        
        {/* Nút Đóng */}
        <button 
          type="button"
          onClick={onBackHome}
          className="absolute top-8 right-8 text-gray-400 hover:text-amber-400 p-2 border border-white/[0.08] hover:border-amber-400/40 rounded-xl bg-white/[0.03] hover:bg-amber-400/5 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Khung Form Container: Tinh chỉnh bg-black/35 và tăng độ trong suốt Glassmorphism để hài hòa với nền sáng */}
        <div className="w-full max-w-2xl bg-black/35 p-8 sm:p-10 rounded-3xl border border-white/[0.1] shadow-[0_25px_100px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl relative overflow-hidden">
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full text-[10px] font-bold text-amber-400 tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>FREE TRIAL PORTAL</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Tạo tài khoản dùng thử
            </h2>
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            {/* Nhập tên khách hàng */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-200 tracking-wide">Tên khách hàng</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                  <User className="h-4.5 w-4.5 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên khách hàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/60 transition-all duration-300"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-200 tracking-wide">Số điện thoại</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sm text-gray-400 group-focus-within:text-amber-400 transition-colors">
                  <Smartphone className="h-4.5 w-4.5 stroke-[1.5] mr-1" />
                  <span className="text-xs mr-1 opacity-70">🇻🇳</span>
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  required
                  placeholder="091 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, ''); }}
                  className="w-full pl-20 pr-4 py-3.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/60 transition-all duration-300"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-200 tracking-wide">Email </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                  <Mail className="h-4.5 w-4.5 stroke-[1.5]" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="company@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/60 transition-all duration-300"
                />
              </div>
            </div>

            {/* Quốc gia đang kinh doanh */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-200 tracking-wide">Quốc gia đang kinh doanh</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                  <Globe className="h-4.5 w-4.5 stroke-[1.5]" />
                </div>
                <select 
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm font-medium text-white appearance-none focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/60 transition-all duration-300 cursor-pointer"
                >
                  <option value="" className="bg-[#0c0e12]">-- Chọn quốc gia --</option>
                  <option value="vn" className="bg-[#0c0e12]">Việt Nam</option>
                  
                </select>
                <div className="absolute inset-y-0 right-0 h-full flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-amber-400">
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Chọn khu vực (Tỉnh) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-200 tracking-wide">Chọn khu vực (Tỉnh/Thành phố)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                  <MapPin className="h-4.5 w-4.5 stroke-[1.5]" />
                </div>
                <select 
                  required
                  value={businessArea}
                  onChange={(e) => setBusinessArea(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-black/40 border border-white/[0.1] rounded-xl text-sm font-medium text-white appearance-none focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/60 transition-all duration-300 cursor-pointer"
                >
                  <option value="" className="bg-[#0c0e12]">-- Chọn khu vực --</option>
                  <option value="Hà Nội" className="bg-[#0c0e12]">Hà Nội</option>
                  <option value="Hồ Chí Minh" className="bg-[#0c0e12]">Hồ Chí Minh</option>
                  <option value="Đà Nẵng" className="bg-[#0c0e12]">Đà Nẵng</option>
                  <option value="Hải Phòng" className="bg-[#0c0e12]">Hải Phòng</option>
                  <option value="Cần Thơ" className="bg-[#0c0e12]">Cần Thơ</option>
                </select>
                <div className="absolute inset-y-0 right-0 h-full flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-amber-400">
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Checkbox đồng ý chính sách bảo mật */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  type="checkbox" 
                  id="policy" 
                  required
                  checked={policy}
                  onChange={(e) => setPolicy(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/20 text-amber-500 focus:ring-amber-400/20 accent-amber-400 cursor-pointer" 
                />
              </div>
              <label htmlFor="policy" className="text-xs text-gray-300 leading-normal cursor-pointer select-none font-semibold opacity-90">
                Tôi đã đọc và đồng ý <a href="#terms" className="text-amber-400 font-bold hover:underline">Điều khoản & chính sách sử dụng</a> của NovaStay Global.
              </label>
            </div>

            {/* Nút Đăng ký Tiếp tục */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_25px_-1px_rgba(251,191,36,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group"
              >
                <span>Tiếp tục đăng ký</span>
                <ArrowRight className="h-4.5 w-4.5 stroke-[3] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}