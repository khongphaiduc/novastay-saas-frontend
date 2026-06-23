import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight, Smartphone, QrCode, HelpCircle } from 'lucide-react';
import NovastayLogo from '../components/NovastayLogo';

const NovaResidentLogin = () => {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' hoặc 'otp'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const API_ROOT = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (loginMethod === 'password') {
      try {
        const res = await fetch(`${API_ROOT}/api/auth/resident/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Sdt: phone,
            Password: password
          }),
        });

        if (!res.ok) {
          let message = 'Tài khoản hoặc mật khẩu không chính xác.';
          try {
            const body = await res.json();
            message = body?.message || body?.error || message;
          } catch (_) { }
          throw new Error(message);
        }

        const data = await res.json();

        // lưu thông tin vào localStorage
        localStorage.setItem('ns_account', JSON.stringify({
          accountId: data.accountId,
          residentId: data.residentId,
          organizationId: data.organizationId,
          accountType: data.accountType,
          customerName: data.name,
          name: data.name,
          phone: data.sdt,
          email: data.email,
          identityCardNumber: data.identityCardNumber,
          sex: data.sex,
          address: data.address,
          mustSetPassword: data.mustSetPassword,
          accessToken: data.accessToken,
          accessTokenExpiresAt: data.accessTokenExpiresAt,
          refreshToken: data.refreshToken,
          refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        }));

        navigate('/resident/accommodation');
      } catch (err) {
        console.error('Resident login error:', err);
        setError(err.message || 'Lỗi khi kết nối với máy chủ');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Cư dân đăng nhập bằng OTP:', { phone, otp });
      setLoading(false);
    }
  };

  return (
    // FULL BACKGROUND IMAGE: Sử dụng chung ngôn ngữ thiết kế tối sang trọng giống chủ dịch vụ
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased tracking-normal bg-[#020406]">

      {/* ==================== PHẦN BACKGROUND ĐỒNG BỘ SANG TRỌNG ==================== */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2560&auto=format&fit=crop"
          alt="Modern Cozy Residential"
          className="w-full h-full object-cover opacity-75 scale-100 transition-all duration-700 brightness-100"
        />
        {/* Lớp phủ Gradient màu tối hổ phách đồng bộ */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#040608]/85 via-[#06090d]/45 to-[#080b11]/65 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040608]/20 to-[#040608]/80" />
      </div>

      {/* Hiệu ứng ánh sáng Neon/Glow Aura ánh kim vàng bừng sáng mềm mại */}
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-amber-500/[0.15] rounded-full blur-[140px] z-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[0%] w-[700px] h-[700px] bg-yellow-500/[0.12] rounded-full blur-[160px] z-1 pointer-events-none" />
      <div className="absolute top-[35%] right-[20%] w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full blur-[100px] z-1 pointer-events-none" />
      {/* ============================================================================= */}

      {/* KHỐI ĐĂNG NHẬP CHÍNH - Glassmorphism cao cấp phối hợp với nền mới */}
      <div className="w-full max-w-4xl z-10 bg-black/50 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_25px_100px_-15px_rgba(0,0,0,0.9)] overflow-hidden grid md:grid-cols-12 min-h-[600px]">

        {/* CỘT TRÁI: Hệ sinh thái tiện ích dành cho cư dân */}
        <div className="md:col-span-5 bg-black/30 p-10 flex flex-col justify-between border-r border-white/[0.06]">
          <div>
            {/* Logo Thương Hiệu - Nguyên bản SVG NovaStay */}
            <div className="flex items-center gap-3.5 mb-12">
              <div className="flex items-center justify-center">
                <NovastayLogo className="h-10 w-auto" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white block">
                  NOVA<span className="text-amber-400">RESIDENT</span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase block mt-0.5">
                  RESIDENT PORTAL
                </span>
              </div>
            </div>

            {/* Tiêu đề */}
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              An tâm tận hưởng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                Không Gian Sống Số
              </span>
            </h2>

            {/* Danh sách tính năng nhanh của cư dân */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 opacity-95">
                <div className="mt-1 p-1.5 rounded-md bg-amber-400/10 text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">Đóng phí sinh hoạt, hóa đơn dịch vụ nhanh chóng qua cổng điện tử.</p>
              </div>
              <div className="flex items-start gap-3 opacity-95">
                <div className="mt-1 p-1.5 rounded-md bg-amber-400/10 text-amber-400">
                  <Smartphone className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">Tương tác trực tiếp với Ban quản lý và phản ánh sự cố kỹ thuật 24/7.</p>
              </div>
            </div>
          </div>

          {/* Quét QR tải App nhanh với viền ánh kim */}
          <div className="pt-6 border-t border-white/[0.05] flex items-center gap-4">
            <div className="p-2 bg-white/[0.04] rounded-xl border border-amber-400/30 shadow-[0_0_15px_-3px_rgba(251,191,36,0.1)]">
              <QrCode className="h-10 w-10 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Tải App Cư Dân</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Trải nghiệm tiện ích trọn vẹn hơn trên Mobile</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form đăng nhập */}
        <div className="md:col-span-7 p-10 md:p-14 flex flex-col justify-center bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-xl" />

          <div className="max-w-md w-full mx-auto z-10">
            <div className="mb-8">
              <span className="text-xs font-bold tracking-[0.15em] text-amber-500 uppercase block mb-1.5 opacity-100">
                RESIDENT GATEWAY
              </span>
              <h3 className="text-2xl font-extrabold text-white leading-tight">
                Xin chào Cư dân!
              </h3>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Chuyển đổi Phương thức Đăng nhập mang phong cách Dark Gold */}
            <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/[0.06] rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${loginMethod === 'password' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Mật Khẩu
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Mã OTP Điện Thoại
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Số điện thoại */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                  Số điện thoại đăng ký
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                    <User className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Nhập số điện thoại của bạn"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Toggle trường Mật khẩu hoặc mã OTP */}
              {loginMethod === 'password' ? (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                      Mật khẩu bảo mật
                    </label>
                    <a href="#forgot-res" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                      <Lock className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu truy cập"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    * Lần đầu đăng nhập? Mật khẩu mặc định là <span className="text-amber-400 font-semibold">8 số cuối của Căn cước công dân</span> của bạn.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                    Mã xác thực OTP
                  </label>
                  <div className="flex gap-3">
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                        <ShieldCheck className="h-5 w-5 stroke-[1.5]" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Nhập 6 số OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                      />
                    </div>
                    <button
                      type="button"
                      className="px-5 bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 active:scale-[0.97] rounded-xl text-xs font-bold transition-all duration-200"
                    >
                      Gửi mã
                    </button>
                  </div>
                </div>
              )}

              {/* Ghi nhớ đăng nhập */}
              <div className="flex items-center">
                <input
                  id="remember-resident"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/30 bg-black/40 text-amber-500 focus:ring-amber-400/20 accent-amber-400 cursor-pointer"
                />
                <label htmlFor="remember-resident" className="ml-2.5 text-xs text-gray-200 font-medium cursor-pointer select-none">
                  Duy trì đăng nhập căn hộ này
                </label>
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_25px_-1px_rgba(251,191,36,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 stroke-[3] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Vào Cổng Cư Dân
                    <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Trợ giúp */}
            <div className="mt-8 text-center border-t border-white/[0.04] pt-6 flex items-center justify-center gap-1.5 text-sm text-gray-300 font-medium">
              <HelpCircle className="h-4 w-4 text-gray-500" />
              <span>Chưa đăng ký số điện thoại?</span>
              <a href="#bql" className="text-amber-400 font-bold hover:underline">
                Liên hệ Ban Quản Lý
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default NovaResidentLogin;