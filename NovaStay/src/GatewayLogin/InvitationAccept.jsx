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
  return <div>Đang tải...</div>;
}