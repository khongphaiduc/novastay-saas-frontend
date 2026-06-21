import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, LayoutDashboard } from 'lucide-react';
import './RegisterSuccess.css';

export default function RegisterSuccess() {
  const [countdown, setCountdown] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="success-page-container">
      {/* Background elements */}
      <div className="absolute-background">
        <img 
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2560&auto=format&fit=crop" 
          alt="Luxury Stay Interior"
          className="bg-image" 
        />
        <div className="bg-gradient-overlay-tr" />
        <div className="bg-gradient-overlay-b" />
      </div>

      <div className="blur-aura top-left" />
      <div className="blur-aura bottom-right" />

      {/* Main Card */}
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon-container">
            <CheckCircle2 className="main-success-icon" />
          </div>
          <h1 className="success-title">Đăng ký thành công!</h1>
          <p className="success-description">
            Thông tin đăng ký cổng doanh nghiệp của bạn đã được gửi tới địa chỉ email đăng ký.
          </p>
        </div>

        <div className="countdown-section">
          <p className="countdown-text">
            Tự động quay lại trang chủ sau <span className="countdown-number">{countdown}s</span>
          </p>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(countdown / 20) * 100}%` }}
            />
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="action-btn home-btn"
          >
            <Home size={18} />
            <span>Về trang chủ</span>
          </button>
          
          <button 
            onClick={() => navigate('/nhatro', { replace: true })}
            className="action-btn dashboard-btn"
          >
            <LayoutDashboard size={18} />
            <span>Đến trang quản trị</span>
          </button>
        </div>
      </div>
    </div>
  );
}
