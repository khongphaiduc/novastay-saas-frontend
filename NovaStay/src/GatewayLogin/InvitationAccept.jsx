import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  LogIn, 
  ShieldCheck, 
  XCircle, 
  Home, 
  UserCheck, 
  ArrowRight,
  RotateCcw,
  DoorOpen,
  Calendar
} from 'lucide-react';
import { previewInvitationLink, acceptInvitationLink } from '../api/invitationLinkApi';
import NovastayLogo from '../components/NovastayLogo';
import './InvitationAccept.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

export default function InvitationAccept() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'already_member' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const isLoggedIn = (() => {
    try {
      const data = JSON.parse(localStorage.getItem('ns_account') || '{}');
      return !!data.accessToken && data.accountType === 'Resident';
    } catch { 
      return false; 
    }
  })();

  useEffect(() => {
    previewInvitationLink(token)
      .then(setPreview)
      .catch(() => setPreview({ isValid: false, invalidReason: 'Không tìm thấy link mời hoặc đường dẫn không hợp lệ.' }))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!isLoggedIn) {
      sessionStorage.setItem('pending_invitation_token', token);
      navigate('/login/resident');
      return;
    }

    setAccepting(true);
    try {
      await acceptInvitationLink(token);
      setResult('success');
    } catch (e) {
      const msg = e.message || 'Không thể chấp nhận lời mời';
      setErrorMsg(msg);
      if (msg.toLowerCase().includes('đã là thành viên') || msg.toLowerCase().includes('already')) {
        setResult('already_member');
      } else {
        setResult('error');
      }
    } finally {
      setAccepting(false);
    }
  };

  // ─── 1. State: Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="inv-page-container">
        <div className="inv-card">
          <div className="inv-brand">
            <NovastayLogo className="inv-brand-logo" />
          </div>
          <div className="inv-icon-wrapper">
            <div className="inv-icon-circle indigo">
              <Loader2 size={36} className="inv-spin" />
            </div>
            <div className="inv-icon-pulse" />
          </div>
          <h2 className="inv-card-title">Đang kiểm tra lời mời...</h2>
          <p className="inv-card-subtitle">Vui lòng chờ trong giây lát trong khi chúng tôi tải thông tin.</p>
        </div>
      </div>
    );
  }

  // ─── 2. State: Invalid / Expired Link ─────────────────────────────────────
  if (!preview?.isValid) {
    return (
      <div className="inv-page-container">
        <div className="inv-card">
          <div className="inv-brand">
            <NovastayLogo className="inv-brand-logo" />
          </div>
          <div className="inv-icon-wrapper">
            <div className="inv-icon-circle red">
              <XCircle size={38} />
            </div>
            <div className="inv-icon-pulse" />
          </div>
          <span className="inv-badge-pill status-pending">
            Không thể sử dụng
          </span>
          <h1 className="inv-card-title">Link Mời Không Hợp Lệ</h1>
          <p className="inv-card-subtitle error">
            {preview?.invalidReason || 'Link mời này không tồn tại, đã hết hạn hoặc đã đạt giới hạn số lượt sử dụng.'}
          </p>

          <div className="inv-actions-container">
            <button className="inv-btn inv-btn-secondary" onClick={() => navigate('/')}>
              <Home size={18} /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. State: Already a Member (User already joined this organization) ──
  if (result === 'already_member') {
    return (
      <div className="inv-page-container">
        <div className="inv-card">
          <div className="inv-brand">
            <NovastayLogo className="inv-brand-logo" />
          </div>
          <div className="inv-icon-wrapper">
            <div className="inv-icon-circle green">
              <UserCheck size={38} />
            </div>
            <div className="inv-icon-pulse" />
          </div>
          
          <span className="inv-badge-pill status-member">
            <CheckCircle2 size={13} /> Thành viên hiện tại
          </span>

          <h1 className="inv-card-title">Bạn Đã Là Thành Viên!</h1>
          <div className="inv-org-highlight">{preview.businessName}</div>
          
          <p className="inv-card-subtitle">
            Tài khoản người thuê của bạn đã tham gia cơ sở này từ trước. Bạn có thể truy cập ngay vào bảng điều khiển để xem phòng, hóa đơn và hợp đồng.
          </p>

          <div className="inv-actions-container">
            <button className="inv-btn inv-btn-primary" onClick={() => navigate('/resident')}>
              Truy Cập Trang Cư Dân <ArrowRight size={18} />
            </button>
            <button className="inv-btn inv-btn-secondary" onClick={() => navigate('/')}>
              <Home size={18} /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 4. State: Sent approval successfully ─────────────────────────────────
  if (result === 'success') {
    return (
      <div className="inv-page-container">
        <div className="inv-card">
          <div className="inv-brand">
            <NovastayLogo className="inv-brand-logo" />
          </div>
          <div className="inv-icon-wrapper">
            <div className="inv-icon-circle green">
              <CheckCircle2 size={38} />
            </div>
            <div className="inv-icon-pulse" />
          </div>

          <span className="inv-badge-pill status-pending">
            <Clock size={13} /> Đang chờ duyệt
          </span>

          <h1 className="inv-card-title">Yêu Cầu Đã Gửi Thành Công!</h1>
          <div className="inv-org-highlight">{preview.businessName}</div>

          <p className="inv-card-subtitle">
            Yêu cầu gia nhập của bạn đã được chuyển tới chủ nhà trọ. Bạn sẽ nhận được thông báo ngay khi chủ trọ hoàn tất việc duyệt.
          </p>

          <div className="inv-actions-container">
            <button className="inv-btn inv-btn-primary" onClick={() => navigate('/resident')}>
              <UserCheck size={18} /> Đi Tới Trang Cá Nhân
            </button>
            <button className="inv-btn inv-btn-secondary" onClick={() => navigate('/')}>
              <Home size={18} /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 5. State: Generic Error ───────────────────────────────────────────────
  if (result === 'error') {
    return (
      <div className="inv-page-container">
        <div className="inv-card">
          <div className="inv-brand">
            <NovastayLogo className="inv-brand-logo" />
          </div>
          <div className="inv-icon-wrapper">
            <div className="inv-icon-circle red">
              <XCircle size={38} />
            </div>
            <div className="inv-icon-pulse" />
          </div>

          <h1 className="inv-card-title">Không Thể Tham Gia</h1>
          <p className="inv-card-subtitle error">
            {errorMsg || 'Đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng kiểm tra lại.'}
          </p>

          <div className="inv-actions-container">
            <button className="inv-btn inv-btn-primary" onClick={() => setResult(null)}>
              <RotateCcw size={18} /> Thử Lại
            </button>
            <button className="inv-btn inv-btn-secondary" onClick={() => navigate('/')}>
              <Home size={18} /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 6. State: Main Invitation Preview ─────────────────────────────────────
  return (
    <div className="inv-page-container">
      <div className="inv-card">
        {/* Brand Header */}
        <div className="inv-brand">
          <NovastayLogo className="inv-brand-logo" />
        </div>

        {/* Icon & Official Badge */}
        <div className="inv-icon-wrapper">
          <div className="inv-icon-circle indigo">
            <Building2 size={36} />
          </div>
          <div className="inv-icon-pulse" />
        </div>

        <span className="inv-badge-pill official">
          <ShieldCheck size={14} /> Lời mời tham gia chính thức
        </span>

        <h1 className="inv-card-title">Bạn được mời gia nhập</h1>
        <div className="inv-org-highlight">{preview.businessName}</div>

        {/* Accommodation Details Box */}
        <div className="inv-details-box">
          {preview.propertyName && (
            <div className="inv-detail-item">
              <span className="inv-detail-left">
                <Building2 size={16} /> Cơ sở lưu trú
              </span>
              <span className="inv-detail-right">{preview.propertyName}</span>
            </div>
          )}

          {preview.propertyName && preview.roomName && (
            <div className="inv-detail-divider" />
          )}

          {preview.roomName && (
            <div className="inv-detail-item">
              <span className="inv-detail-left">
                <DoorOpen size={16} /> Phòng gợi ý
              </span>
              <span className="inv-detail-right">Phòng {preview.roomName}</span>
            </div>
          )}

          {(preview.propertyName || preview.roomName) && (
            <div className="inv-detail-divider" />
          )}

          <div className="inv-detail-item">
            <span className="inv-detail-left">
              <Calendar size={16} /> Thời hạn link
            </span>
            <span className="inv-detail-right">{formatDate(preview.expiresAt)}</span>
          </div>
        </div>

        {/* Notice for unauthenticated users */}
        {!isLoggedIn && (
          <div className="inv-notice-banner">
            <LogIn size={18} />
            <div>
              Bạn cần <strong>đăng nhập tài khoản người thuê</strong> để hoàn tất việc xác nhận và gia nhập cơ sở này.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="inv-actions-container">
          <button
            className="inv-btn inv-btn-primary"
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? (
              <>
                <Loader2 size={18} className="inv-spin" /> Đang xử lý...
              </>
            ) : isLoggedIn ? (
              <>
                <CheckCircle2 size={18} /> Xác Nhận Tham Gia
              </>
            ) : (
              <>
                <LogIn size={18} /> Đăng Nhập Để Tham Gia
              </>
            )}
          </button>

          <button className="inv-btn inv-btn-secondary" onClick={() => navigate('/')}>
            Từ Chối / Về Trang Chủ
          </button>
        </div>

        <p className="inv-card-footer">
          Sau khi xác nhận, yêu cầu của bạn sẽ được gửi tới chủ trọ để phê duyệt vào danh sách thành viên.
        </p>
      </div>
    </div>
  );
}
