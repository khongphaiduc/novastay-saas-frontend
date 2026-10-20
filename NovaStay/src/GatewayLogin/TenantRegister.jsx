import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight, X, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import NovastayLogo from '../components/NovastayLogo';

const TenantRegister = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const API_ROOT = import.meta.env.VITE_API_URL || '';

  // Password strength check
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, text: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, text: 'Yếu', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, text: 'Trung bình', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, text: 'Khá', color: 'bg-yellow-400' };
    if (score <= 4) return { level: 4, text: 'Mạnh', color: 'bg-emerald-400' };
    return { level: 5, text: 'Rất mạnh', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_ROOT}/api/auth/resident/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FullName: fullName.trim(),
          Phone: phone.trim(),
          Email: email.trim(),
          Password: password
        }),
      });

      if (!res.ok) {
        let message = 'Đăng ký thất bại. Vui lòng thử lại.';
        try {
          const body = await res.json();
          message = body?.message || body?.error || message;
        } catch (_) { }
        throw new Error(message);
      }

      const data = await res.json();

      // Lưu thông tin vào localStorage
      localStorage.setItem('ns_account', JSON.stringify({
        accountId: data.accountId,
        residentId: data.residentId,
        organizationId: null,
        accountType: data.accountType,
        customerName: data.name,
        name: data.name,
        phone: data.phone,
        email: data.email,
        accessToken: data.accessToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
        refreshToken: data.refreshToken,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      }));

      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_ROOT}/api/auth/resident/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IdToken: credentialResponse.credential }),
      });

      if (!res.ok) {
        let message = 'Đăng ký bằng Google thất bại.';
        try {
          const body = await res.json();
          message = body?.message || body?.error || message;
        } catch (_) {}
        throw new Error(message);
      }

      const data = await res.json();
      localStorage.setItem('ns_account', JSON.stringify({
        accountId: data.accountId,
        residentId: data.residentId,
        organizationId: data.organizationId || null,
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

      setSuccess(true);
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.message || 'Lỗi khi đăng ký bằng Google');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-y-auto font-sans antialiased tracking-normal bg-[#020406]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2560&auto=format&fit=crop"
            alt="Modern Residential"
            className="w-full h-full object-cover opacity-75 brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#040608]/85 via-[#06090d]/45 to-[#080b11]/65 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040608]/20 to-[#040608]/80" />
        </div>

        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/[0.15] rounded-full blur-[140px] z-1 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[0%] w-[700px] h-[700px] bg-emerald-400/[0.12] rounded-full blur-[160px] z-1 pointer-events-none" />

        <div className="w-full max-w-md z-10 bg-black/50 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_25px_100px_-15px_rgba(0,0,0,0.9)] overflow-hidden p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-10 h-10 stroke-[2]" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-3">
            Đăng ký thành công!
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-8">
            Chào mừng bạn đến với <span className="text-amber-400 font-semibold">NovaStay</span>. 
            Tài khoản cư dân của bạn đã được tạo và sẵn sàng sử dụng.
          </p>

          <button
            onClick={() => navigate('/resident/accommodation')}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_25px_-1px_rgba(251,191,36,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group"
          >
            Vào Cổng Cư Dân
            <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 bg-white/[0.06] border border-white/[0.1] text-white font-bold text-sm py-3.5 px-6 rounded-xl hover:bg-white/[0.1] active:scale-[0.98] transition-all duration-200"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-y-auto font-sans antialiased tracking-normal bg-[#020406]">
      {/* Nút đóng */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 md:p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-amber-500/50 text-gray-400 hover:text-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md"
        aria-label="Quay lại trang chủ"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2560&auto=format&fit=crop"
          alt="Modern Cozy Residential"
          className="w-full h-full object-cover opacity-75 scale-100 transition-all duration-700 brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#040608]/85 via-[#06090d]/45 to-[#080b11]/65 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040608]/20 to-[#040608]/80" />
      </div>

      {/* Glow effects */}
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-amber-500/[0.15] rounded-full blur-[140px] z-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[0%] w-[700px] h-[700px] bg-yellow-500/[0.12] rounded-full blur-[160px] z-1 pointer-events-none" />
      <div className="absolute top-[35%] right-[20%] w-[300px] h-[300px] bg-amber-400/[0.06] rounded-full blur-[100px] z-1 pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-4xl z-10 bg-black/50 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_25px_100px_-15px_rgba(0,0,0,0.9)] overflow-hidden grid md:grid-cols-12 min-h-[650px]">

        {/* Cột trái */}
        <div className="md:col-span-5 bg-black/30 p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.06]">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3.5 mb-6 md:mb-10">
              <div className="flex items-center justify-center">
                <NovastayLogo className="h-10 w-auto" />
              </div>
              <div>
                <span className="text-lg md:text-xl font-black tracking-wider text-white block">
                  NOVA<span className="text-amber-400">RESIDENT</span>
                </span>
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase block mt-0.5">
                  TẠO TÀI KHOẢN MỚI
                </span>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Tham gia ngay <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                Cộng Đồng Cư Dân Số
              </span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Đăng ký tài khoản cư dân để trải nghiệm hệ sinh thái 
              quản lý nơi ở thông minh NovaStay.
            </p>

            {/* Benefits */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 opacity-95">
                <div className="mt-0.5 p-1.5 rounded-md bg-amber-400/10 text-amber-400 flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">Thanh toán hóa đơn, dịch vụ trực tuyến nhanh chóng và tiện lợi.</p>
              </div>
              <div className="flex items-start gap-3 opacity-95">
                <div className="mt-0.5 p-1.5 rounded-md bg-amber-400/10 text-amber-400 flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">Phản ánh sự cố kỹ thuật, bảo trì trực tiếp với ban quản lý 24/7.</p>
              </div>
              <div className="flex items-start gap-3 opacity-95">
                <div className="mt-0.5 p-1.5 rounded-md bg-amber-400/10 text-amber-400 flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">Theo dõi hợp đồng, lịch sử giao dịch minh bạch.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 md:pt-6 border-t border-white/[0.05] mt-6 md:mt-0">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <span className="text-amber-400/80 hover:underline cursor-pointer">Điều khoản dịch vụ</span>
              {' '}và{' '}
              <span className="text-amber-400/80 hover:underline cursor-pointer">Chính sách bảo mật</span>
              {' '}của NovaStay.
            </p>
          </div>
        </div>

        {/* Cột phải: Form đăng ký */}
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-xl" />

          <div className="max-w-md w-full mx-auto z-10">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-[0.15em] text-amber-500 uppercase block mb-1.5">
                REGISTRATION
              </span>
              <h3 className="text-2xl font-extrabold text-white leading-tight">
                Tạo tài khoản Cư dân
              </h3>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ và tên */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                  Họ và tên
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                    <User className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Nhập họ và tên đầy đủ"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                  Số điện thoại
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                    <Phone className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                    <Mail className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type="email"
                    required
                    maxLength={100}
                    placeholder="Nhập địa chỉ email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    maxLength={100}
                    placeholder="Tối thiểu 8 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.level ? strength.color : 'bg-white/[0.08]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold ${
                      strength.level <= 1 ? 'text-red-400' :
                      strength.level <= 2 ? 'text-amber-400' :
                      strength.level <= 3 ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      {strength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="h-5 w-5 stroke-[1.5]" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    maxLength={100}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3.5 bg-black/50 border rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:bg-black/70 transition-all duration-300 ${
                      passwordsMismatch
                        ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/10'
                        : passwordsMatch
                        ? 'border-emerald-500/50 focus:border-emerald-500/70 focus:ring-emerald-500/10'
                        : 'border-white/[0.12] focus:border-amber-400/70 focus:ring-amber-400/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordsMismatch && (
                  <p className="text-[11px] text-red-400 font-medium mt-0.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Mật khẩu xác nhận không khớp
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Mật khẩu khớp
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || passwordsMismatch}
                className="w-full mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_25px_-1px_rgba(251,191,36,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 stroke-[3] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo tài khoản...
                  </>
                ) : (
                  <>
                    Đăng Ký Tài Khoản
                    <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-5">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Hoặc</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Google Sign Up */}
            <div className="mt-4 flex justify-center [&_iframe]:rounded-xl">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Đăng ký bằng Google thất bại.')}
                text="signup_with"
                shape="pill"
                size="large"
                width="100%"
                theme="filled_black"
                locale="vi_VN"
              />
            </div>

            {/* Login link */}
            <div className="mt-5 text-center border-t border-white/[0.04] pt-5 text-sm text-gray-300 font-medium">
              <span>Đã có tài khoản?</span>{' '}
              <Link
                to="/login/resident"
                className="text-amber-400 font-bold hover:underline hover:text-amber-300 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TenantRegister;
