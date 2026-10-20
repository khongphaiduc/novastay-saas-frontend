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
  return <div>Preview</div>;
}