import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, Home, Lock, Briefcase, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import './CreateBusinessForm.css';

const CreateBusinessForm = () => {
  const [businessType, setBusinessType] = useState('Nhà trọ');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const registrationData = location.state || {};
  const API_ROOT = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (!registrationData.email || !registrationData.customerName) {
      navigate('/boarding-house');
    }
  }, [registrationData, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((isVisible) => !isVisible);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (value.length > 0 && value.length < 8) {
      setPasswordError('Mật khẩu phải chứa tối thiểu 8 ký tự');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || !businessName.trim() || loading) return;

    setLoading(true);
    setSubmitError('');

    try {
      const payload = {
        customerName: registrationData.customerName,
        phone: registrationData.phone,
        email: registrationData.email,
        businessArea: registrationData.businessArea,
        businessName: businessName,
        password: password,
      };

      const res = await fetch(`${API_ROOT}/api/auth/register-organization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = 'Đăng ký thất bại. Vui lòng thử lại.';
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
          // Keep default message
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
      } catch (err) {
        console.warn('Could not save auth data', err);
      }

      // navigate to success page
      navigate('/register-success', { replace: true });
    } catch (err) {
      console.error('Registration error', err);
      setSubmitError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      {/* ==================== PHẦN ẢNH NỀN BAO PHỦ TOÀN BỘ PAGE ==================== */}
      <div className="absolute-background">
        <img
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2560&auto=format&fit=crop"
          alt="Luxury Building Interior"
          className="bg-image"
        />
        {/* Các lớp phủ giảm sáng, giúp nổi bật khối form chính ở trung tâm */}
        <div className="bg-gradient-overlay-tr" />
        <div className="bg-gradient-overlay-b" />
      </div>

      {/* Hiệu ứng hào quang Neon/Glow Aura lan tỏa trên nền page */}
      <div className="blur-aura top-left" />
      <div className="blur-aura bottom-right" />

      {/* KHỐI CARD CHÍNH GIỮA TRANG */}
      <div className="main-split-card">

        {/* CỘT TRÁI: Banner giới thiệu */}
        <div className="card-left-banner">
          <div className="banner-overlay-dark" />
          <div className="banner-content">
            <div className="brand-logo-area">
              <div className="logo-box">
                <ShieldCheck className="logo-icon" />
              </div>
              <div>
                <span className="brand-text-main">NOVA<span className="text-gold">STAY</span></span>
                <span className="brand-text-sub">ENTERPRISE CONSOLE</span>
              </div>
            </div>

            <div className="banner-text-group">
              <h2 className="banner-main-title">
                Khởi tạo <br />
                <span className="text-gradient-gold">Không gian quản trị</span>
              </h2>
              <p className="banner-description">
                Gia nhập nền tảng tối ưu hóa doanh thu, tự động hóa quy trình vận hành chuỗi lưu trú và nâng cao trải nghiệm khách hàng hàng đầu.
              </p>
            </div>

            <div className="banner-footer">
              &copy; 2026 NovaStay Technology Global.
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form Nhập Liệu rộng rãi */}
        <div className="card-right-form">
          <div className="form-header-area">
            <div className="brand-badge">
              <Sparkles className="icon-sparkle" />
              <span>HỆ THỐNG KHỞI TẠO VẬN HÀNH</span>
            </div>
            <h1 className="right-form-title">Thiết lập hệ thống</h1>
          </div>

          <form onSubmit={handleSubmit} className="business-form">
            {submitError && (
              <div className="submit-error-box">
                <span className="error-icon">⚠️</span>
                <p className="error-text">{submitError}</p>
              </div>
            )}

            {/* Mô hình kinh doanh */}
            <div className="input-group">
              <label htmlFor="businessType" className="input-label">Mô hình kinh doanh</label>
              <div className="input-field-wrapper">
                <div className="input-icon-left">
                  {businessType === 'Nhà trọ' ? <Home size={19} /> : <Building2 size={19} />}
                </div>
                <select
                  id="businessType"
                  className="classic-select"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                >
                  <option value="Nhà trọ">Nhà trọ (Quản lý dãy trọ, điện nước & người thuê)</option>
                  <option value="Chung cư mini">Chung cư mini (Vận hành căn hộ dịch vụ cao cấp)</option>
                </select>
              </div>
            </div>

            {/* Tên Doanh Nghiệp */}
            <div className="input-group">
              <label htmlFor="businessName" className="input-label">Tên doanh nghiệp / Tòa nhà</label>
              <div className="input-field-wrapper">
                <div className="input-icon-left">
                  <Briefcase size={19} />
                </div>
                <input
                  type="text"
                  id="businessName"
                  className="classic-input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ví dụ: Căn hộ dịch vụ Phượng Hoàng Luxury"
                  required
                />
              </div>
            </div>

            {/* Mật Khẩu */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">Mật khẩu tài khoản quản trị</label>
              <div className="input-field-wrapper password-group">
                <div className="input-icon-left">
                  <Lock size={19} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`classic-input ${passwordError ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Nhập tối thiểu 8 ký tự bảo mật"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {passwordError && <span className="error-message">{passwordError}</span>}
            </div>

            {/* Nút Submit hành động */}
            <button type="submit" className="submit-button" disabled={!!passwordError || !businessName.trim() || loading}>
              <span>{loading ? 'Đang khởi tạo hệ thống...' : 'Khởi tạo hệ thống ngay'}</span>
              {!loading && <ArrowRight size={19} className="arrow-icon" />}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CreateBusinessForm;