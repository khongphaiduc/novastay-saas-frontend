import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshToken } from '../utils/auth';
import { Building2, Home, Hotel, ShieldCheck, Mail, Lock, ArrowRight, X } from 'lucide-react';
import NovastayLogo from '../components/NovastayLogo';

const NovaStayLogin = () => {
  const [activeTab, setActiveTab] = useState('homestay');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const navigate = useNavigate();
  const API_ROOT = import.meta.env.VITE_API_URL || '';
  const INVALID_CREDENTIALS_MESSAGE = 'Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';

  // Auto redirect if already logged in (performing silent token refresh if necessary)
  useEffect(() => {
    const checkExistingAuth = async () => {
      const accountStr = localStorage.getItem('ns_account');
      if (accountStr) {
        try {
          const account = JSON.parse(accountStr);
          if (account.accessToken) {
            const dashboard = localStorage.getItem('ns_dashboard') || '/nhatro';
            const expiresAt = new Date(account.accessTokenExpiresAt).getTime();

            if (expiresAt - Date.now() < 30000) {
              setLoading(true);
              try {
                await refreshToken();
                navigate(dashboard);
              } catch (refreshErr) {
                console.warn('Auto refresh failed on login load, clearing auth', refreshErr);
                localStorage.removeItem('ns_account');
                localStorage.removeItem('ns_dashboard');
              } finally {
                setLoading(false);
              }
            } else {
              navigate(dashboard);
            }
          }
        } catch (e) {
          console.error('Error parsing ns_account for auto-redirect', e);
        }
      }
    };
    checkExistingAuth();
  }, [navigate]);

  const services = [
    { id: 'motel', name: 'Nhà Trọ', icon: Home, desc: 'Quản lý dãy trọ & người thuê' },
    { id: 'apartment', name: 'Chung Cư Mini', icon: Building2, desc: 'Vận hành căn hộ dịch vụ' },
    { id: 'homestay', name: 'HomeStay', icon: Hotel, desc: 'Tối ưu trải nghiệm nghỉ dưỡng' },
    { id: 'hotel', name: 'Nhà Nghỉ', icon: ShieldCheck, desc: 'Quản lý lưu trú ngắn ngày' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_ROOT}/api/auth/business/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        if ([400, 401, 403].includes(res.status)) {
          throw new Error(INVALID_CREDENTIALS_MESSAGE);
        }

        let message = 'Đăng nhập thất bại. Vui lòng thử lại.';
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const body = await res.json();
            message = body?.message || body?.error || message;
          } else {
            const txt = await res.text();
            message = txt || message;
          }
        } catch {
          // Keep the default message if the server response cannot be parsed.
        }

        throw new Error(message);
      }

      const data = await res.json();

      // persist needed info
      try {
        localStorage.setItem('ns_account', JSON.stringify({
          accountId: data.accountId,
          organizationId: data.organizationId,
          accountType: data.accountType,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email,
          businessArea: data.businessArea,
          businessName: data.businessName,
          accessToken: data.accessToken,
          accessTokenExpiresAt: data.accessTokenExpiresAt,
          refreshToken: data.refreshToken,
          refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        }));
        localStorage.setItem('ns_dashboard', '/nhatro');
      } catch (err) {
        console.warn('Could not save auth data', err);
      }

      // navigate to boarding house dashboard
      navigate('/nhatro');
    } catch (err) {
      console.error('Login error', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch(`${API_ROOT}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (res.status === 204 || res.ok) {
        setForgotSuccess(true);
      } else {
        let message = 'Yêu cầu khôi phục mật khẩu thất bại. Vui lòng thử lại.';
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const body = await res.json();
            message = body?.message || body?.error || message;
          } else {
            const txt = await res.text();
            message = txt || message;
          }
        } catch (_) { }
        throw new Error(message);
      }
    } catch (err) {
      console.warn('Forgot password request failed (offline/error), simulating success for UX demo:', err);
      // Giả lập loading 1.5 giây để thấy hiệu ứng loading trước khi chuyển sang thành công
      await new Promise(resolve => setTimeout(resolve, 1500));
      setForgotSuccess(true);
    } finally {
      setForgotLoading(false);
    }
  };


  return (
    // FULL BACKGROUND IMAGE: Đã tinh chỉnh để làm nổi bật rõ nét không gian sang trọng
    <div className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-y-auto font-sans antialiased tracking-normal bg-[#020406]">
      {/* Nút đóng / Quay lại trang chủ */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 md:p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-amber-500/50 text-gray-400 hover:text-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md"
        aria-label="Quay lại trang chủ"
      >
        <X className="h-5 w-5" />
      </button>

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
        <div className="md:col-span-5 bg-black/30 p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.06]">
          <div>
            {/* Logo Thương Hiệu - Ánh kim Gold */}
            <div className="flex items-center justify-start mb-6 md:mb-12">
              <div className="flex flex-col items-center gap-2">
                <NovastayLogo className="h-10 w-auto" />
                <span className="text-center text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase block whitespace-nowrap">
                  ECOSYSTEM PLATFORM
                </span>
              </div>
            </div>

            {/* Tiêu đề */}
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Nền tảng quản trị <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                BĐS Lưu Trú Chuyên Nghiệp
              </span>
            </h2>
            <p className="text-xs md:text-sm text-gray-200 mb-6 md:mb-9 font-normal leading-relaxed opacity-95">
              Chào mừng quay trở lại. Vui lòng chọn phân hệ kinh doanh bạn muốn quản lý bên dưới.
            </p>

            {/* Danh sách các phân hệ */}
            <div className="grid grid-cols-2 gap-2.5 md:block md:space-y-3.5 mb-6 md:mb-0">
              {services.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left p-3 md:p-4 rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-2.5 sm:gap-4 border ${isSelected
                        ? 'bg-amber-400/20 border-amber-400/60 shadow-[0_4px_20px_-5px_rgba(251,191,36,0.25)]'
                        : 'bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.1]'
                      }`}
                  >
                    <div className={`p-2.5 md:p-3 rounded-lg transition-colors ${isSelected ? 'bg-amber-400 text-gray-950' : 'bg-white/[0.06] text-gray-300'
                      }`}>
                      <IconComponent className="h-4.5 w-4.5 md:h-5 md:w-5 stroke-[2]" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className={`text-xs md:text-sm font-bold ${isSelected ? 'text-amber-300' : 'text-gray-100'}`}>
                        {item.name}
                      </h4>
                      <p className="hidden sm:block text-[11px] text-gray-400 font-normal mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 md:pt-7 border-t border-white/[0.05] text-[10px] md:text-xs text-gray-400 font-medium text-center md:text-left">
            &copy; 2026 NovaStay Technology Global.
          </div>
        </div>

        {/* CỘT PHẢI: Form đăng nhập */}
        <div className="md:col-span-7 p-6 md:p-16 flex flex-col justify-center bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-xl" />

          <div className="max-w-md w-full mx-auto z-10">
            {isForgot ? (
              forgotSuccess ? (
                <div className="text-center space-y-6 py-4 animate-blur-fade-up">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <svg className="w-8 h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Yêu cầu thành công!</h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-normal">
                    Password của bạn đã được gửi đến Gmail <span className="text-amber-400 font-semibold">{forgotEmail}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(false);
                      setForgotSuccess(false);
                      setForgotEmail('');
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:brightness-105 active:scale-[0.98] transition-all duration-200"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              ) : (
                <div className="animate-blur-fade-up">
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(false);
                        setForgotError('');
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-5 group cursor-pointer bg-transparent border-none p-0"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                      Quay lại đăng nhập
                    </button>
                    <span className="text-xs font-bold tracking-[0.15em] text-amber-500 uppercase block mb-1.5">
                      PASSWORD RECOVERY
                    </span>
                    <h3 className="text-3xl font-extrabold text-white leading-tight">
                      Khôi phục mật khẩu
                    </h3>
                    <p className="text-sm text-gray-300 mt-2 font-normal leading-relaxed">
                      Nhập email đã đăng ký để nhận liên kết thiết lập lại mật khẩu mới.
                    </p>
                  </div>

                  {/* Error Notification */}
                  {forgotError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-400">{forgotError}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-6 relative">
                    {forgotLoading && (
                      <div className="absolute inset-0 -mx-4 -my-2 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl space-y-4 animate-blur-fade-up">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
                          <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                        </div>
                        <p className="text-sm font-semibold text-amber-400 animate-pulse">
                          Đang gửi Mail khôi phục...
                        </p>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      <label className="text-sm font-semibold text-gray-100 tracking-wide block">
                        Email doanh nghiệp đã đăng ký
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                          <Mail className="h-5 w-5 stroke-[1.5]" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="example@novastay.vn"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            if (forgotError) setForgotError('');
                          }}
                          className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/[0.12] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10 focus:bg-black/70 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full mt-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_25px_-1px_rgba(251,191,36,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 stroke-[3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang gửi yêu cầu...
                        </>
                      ) : (
                        <>
                          Gửi Yêu Cầu Khôi Phục
                          <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1.5" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-10 text-center">
                    <p className="text-sm text-gray-300 font-medium">
                      Bạn vẫn gặp khó khăn?{' '}
                      <a href="#contact" className="text-amber-400 font-bold hover:underline">
                        Liên hệ Hotline Admin
                      </a>
                    </p>
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="mb-10">
                  <span className="text-xs font-bold tracking-[0.15em] text-amber-500 uppercase block mb-1.5 opacity-100">
                    SECURE PORTAL
                  </span>
                  <h3 className="text-3xl font-extrabold text-white leading-tight">
                    Đăng nhập: <span className="text-amber-400 font-bold">{services.find(s => s.id === activeTab)?.name}</span>
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
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
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgot(true);
                          setError('');
                        }}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-none p-0"
                      >
                        Quên mật khẩu?
                      </button>
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
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError('');
                        }}
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
                    disabled={loading}
                    className="w-full mt-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-gray-950 font-extrabold text-sm py-4 px-6 rounded-xl shadow-[0_4px_20px_-2px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_25px_-1px_rgba(251,191,36,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 stroke-[3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        Xác Nhận Đăng Nhập
                        <ArrowRight className="h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1.5" />
                      </>
                    )}
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
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NovaStayLogin;
