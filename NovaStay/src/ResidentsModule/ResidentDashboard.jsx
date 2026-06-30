import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Image, FileText, DollarSign, AlertTriangle,
  Bell, Shield, Key, LogOut, Download, Droplet, Zap, Wifi,
  Loader2, RefreshCw, Home, CheckCircle, Clock, XCircle, X
} from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ns_account') || '{}');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${parsed.accessToken || ''}`,
      'accessToken': parsed.accessToken || '',
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

// Proxy image URLs qua backend để tránh Mixed Content
function formatImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `${API_ROOT}/api/rooms/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
}

function mapInvoiceStatus(status) {
  switch (status?.toLowerCase()) {
    case 'approved': return { label: 'Đã thanh toán', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'pending': return { label: 'Chờ thanh toán', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'rejected': return { label: 'Từ chối', cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
    default: return { label: status || '—', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
}

function mapContractStatus(status) {
  switch (status?.toLowerCase()) {
    case 'active': return { label: 'Đang hiệu lực', cls: 'text-emerald-400' };
    case 'expired': return { label: 'Đã hết hạn', cls: 'text-gray-400' };
    case 'terminated': return { label: 'Đã thanh lý', cls: 'text-red-400' };
    default: return { label: status || '—', cls: 'text-gray-300' };
  }
}

function LoadingSpinner({ text = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <Loader2 size={28} className="animate-spin text-[#E5C158]" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
      <XCircle size={28} className="text-red-400" />
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 text-xs text-[#E5C158] border border-[#E5C158]/30 px-4 py-2 rounded-lg hover:bg-[#E5C158]/10 transition-all">
          <RefreshCw size={12} /> Thử lại
        </button>
      )}
    </div>
  );
}

export default function RoomResidentDashboard() {
  const [activeTab, setActiveTabState] = useState(
    () => localStorage.getItem('ns_active_tab_resident') || 'overview'
  );
  const setActiveTab = (t) => { setActiveTabState(t); localStorage.setItem('ns_active_tab_resident', t); };

  const navigate = useNavigate();

  // ─── Auth state ─────────────────────────────────────────────────────────────
  const [residentData] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('ns_account') || '{}');
      return parsed.accountType === 'Resident' ? parsed : null;
    } catch { return null; }
  });

  useEffect(() => { if (!residentData) navigate('/login/resident'); }, [residentData, navigate]);

  // ─── API Data States ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState('');

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');

  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState('');

  // ─── Modal States ────────────────────────────────────────────────────────────
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', email: '', address: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const openEditProfile = () => {
    setEditForm({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      address: profile?.address || '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditError('');
    setEditProfileOpen(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setEditSaving(true); setEditError('');
    try {
      // 1. Upload avatar neu co
      if (avatarFile) {
        setAvatarUploading(true);
        const fd = new FormData();
        fd.append('file', avatarFile);
        const avatarRes = await fetch(`${API_ROOT}/api/residents/me/avatar`, {
          method: 'POST',
          headers: { 'Authorization': getAuthHeaders().Authorization, 'accessToken': getAuthHeaders().accessToken },
          body: fd,
        });
        if (!avatarRes.ok) throw new Error('Upload ảnh thất bại');
        setAvatarUploading(false);
      }
      // 2. Cập nhật thông tin hồ sơ
      const res = await fetch(`${API_ROOT}/api/residents/me/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Cập nhật thất bại');
      }
      const updated = await res.json();
      setProfile(updated);
      setEditProfileOpen(false);
    } catch (e) {
      setEditError(e.message || 'Lỗi không xác định');
    } finally {
      setEditSaving(false);
      setAvatarUploading(false);
    }
  };

  // ─── Fetch Functions ─────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setProfileLoading(true); setProfileError('');
    try {
      const res = await fetch(`${API_ROOT}/api/residents/me`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      setProfileError(e.message || 'Không thể tải hồ sơ');
    } finally { setProfileLoading(false); }
  }, []);

  const fetchRoom = useCallback(async () => {
    setRoomLoading(true); setRoomError('');
    try {
      const res = await fetch(`${API_ROOT}/api/residents/me/room`, { headers: getAuthHeaders() });
      if (res.status === 404) { setRoom(null); return; }
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();
      setRoom(data);
    } catch (e) {
      setRoomError(e.message || 'Không thể tải thông tin phòng');
    } finally { setRoomLoading(false); }
  }, []);

  const fetchServices = useCallback(async (propertyId, organizationId) => {
    if (!propertyId || !organizationId) return;
    setServicesLoading(true); setServicesError('');
    try {
      const res = await fetch(
        `${API_ROOT}/api/organizations/${organizationId}/properties/${propertyId}/services`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();
      setServices(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      setServicesError(e.message || 'Không thể tải bảng giá dịch vụ');
    } finally { setServicesLoading(false); }
  }, []);

  const fetchContracts = useCallback(async () => {
    setContractsLoading(true); setContractsError('');
    try {
      const res = await fetch(`${API_ROOT}/api/residents/me/contracts`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();
      setContracts(Array.isArray(data) ? data : []);
    } catch (e) {
      setContractsError(e.message || 'Không thể tải danh sách hợp đồng');
    } finally { setContractsLoading(false); }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true); setInvoicesError('');
    try {
      const res = await fetch(`${API_ROOT}/api/residents/me/invoices`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      setInvoicesError(e.message || 'Không thể tải danh sách hóa đơn');
    } finally { setInvoicesLoading(false); }
  }, []);

  // ─── Load on mount & tab change ─────────────────────────────────────────────
  useEffect(() => {
    if (!residentData) return;
    fetchProfile();
    fetchRoom();
  }, [residentData, fetchProfile, fetchRoom]);

  // Load services when profile+room ready
  useEffect(() => {
    if (profile?.organizationId && room?.propertyId) {
      fetchServices(room.propertyId, profile.organizationId);
    }
  }, [profile, room, fetchServices]);

  useEffect(() => {
    if (activeTab === 'contracts') fetchContracts();
    if (activeTab === 'billing') fetchInvoices();
  }, [activeTab, fetchContracts, fetchInvoices]);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      const parsed = JSON.parse(localStorage.getItem('ns_account') || '{}');
      await fetch(`${API_ROOT}/api/auth/logout`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ RefreshToken: parsed.refreshToken || '' })
      });
    } catch { /* ignore */ } finally {
      localStorage.removeItem('ns_account');
      localStorage.removeItem('ns_active_tab_resident');
      navigate('/');
    }
  };

  // ─── Derived display values ───────────────────────────────────────────────
  const displayName = profile?.fullName || residentData?.name || 'Cư dân';
  const displayRoom = room ? `Phòng ${room.roomNumber}` : (residentData?.roomName || '—');
  const displayAddress = room?.propertyAddress || profile?.businessName || residentData?.address || '—';
  const displayPhone = profile?.phone || residentData?.phone || '—';
  const ownerPhone = profile?.ownerPhone || residentData?.ownerPhone || '—';
  const avatarUrl = formatImageUrl(profile?.profileImageUrl);

  const navItems = [
    { id: 'overview', label: 'Tổng quan phòng ở', icon: <Shield size={18} /> },
    { id: 'gallery', label: 'Hình ảnh phòng', icon: <Image size={18} /> },
    { id: 'services', label: 'Bảng giá dịch vụ', icon: <Key size={18} /> },
    { id: 'contracts', label: 'Hợp đồng thuê nhà', icon: <FileText size={18} /> },
    { id: 'billing', label: 'Hóa đơn hàng tháng', icon: <DollarSign size={18} /> },
    { id: 'report', label: 'Báo hỏng / Gửi sự cố', icon: <AlertTriangle size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F7] font-sans antialiased flex selection:bg-[#E5C158] selection:text-black">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="w-80 bg-[#1A1A1A] border-r border-[#E5C158]/10 flex flex-col justify-between p-8 sticky top-0 h-screen">
        <div>
          {/* Tên tòa nhà */}
          <div className="text-center pb-8 border-b border-[#E5C158]/10">
            <h1 className="text-xl font-bold tracking-[0.15em] text-[#E5C158]">
              {profile?.businessName?.toUpperCase() || 'NOVASTAY'}
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mt-1 font-medium">Cổng thông tin cư dân</p>
          </div>

          {/* Avatar + tên cư dân — click để chỉnh sửa */}
          <div
            className="mt-8 p-5 bg-[#222222] rounded-xl border border-[#E5C158]/10 text-center shadow-inner cursor-pointer hover:border-[#E5C158]/40 transition-all group relative"
            onClick={openEditProfile}
            title="Nhấn để chỉnh sửa hồ sơ"
          >
            <div className="w-16 h-16 mx-auto bg-[#E5C158]/10 border border-[#E5C158]/30 rounded-full flex items-center justify-center mb-3 overflow-hidden relative">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : <User size={28} className="text-[#E5C158]" />
              }
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity">
                <span className="text-[10px] font-bold text-white">Sửa</span>
              </div>
            </div>
            <h3 className="text-base text-white font-semibold tracking-wide">{displayName}</h3>
            <p className="text-xs text-[#E5C158] font-medium tracking-wider mt-1 uppercase opacity-90">{displayRoom}</p>
            <p className="text-[11px] text-gray-400 mt-2 bg-black/40 py-1 px-3 rounded-md inline-block max-w-full truncate">{displayAddress}</p>
          </div>

          {/* Navigation */}
          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#E5C158] text-black font-semibold shadow-lg shadow-[#E5C158]/10'
                    : 'text-gray-400 hover:bg-[#222222] hover:text-[#E5C158]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-[#E5C158]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-transparent border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={16} /><span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="flex-1 p-12 overflow-y-auto max-w-6xl mx-auto w-full">

        {/* Top bar */}
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-[#E5C158]/10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-bold">Cổng Thông Tin Người Thuê Nhà</span>
            <h2 className="text-2xl font-semibold mt-1 text-white tracking-wide">Xin chào {displayName},</h2>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative p-3 bg-[#1A1A1A] border border-[#E5C158]/10 rounded-xl hover:border-[#E5C158]/40 transition-all">
              <Bell size={18} className="text-[#E5C158]" />
            </button>
            <div className="text-right border-l border-[#E5C158]/20 pl-6">
              <p className="text-xs text-gray-400 font-medium">SĐT Chủ nhà / Quản lý</p>
              <p className="text-[#E5C158] font-bold text-sm tracking-wider mt-0.5">{ownerPhone}</p>
            </div>
          </div>
        </header>

        {/* ═══════════ TAB: TỔNG QUAN ═══════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {profileLoading && <LoadingSpinner text="Đang tải hồ sơ cư dân..." />}
            {profileError && <ErrorCard message={profileError} onRetry={fetchProfile} />}

            {!profileLoading && (
              <>
                {/* Thống kê nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Số phòng thuê</p>
                    <p className="text-xl font-bold text-[#E5C158] mt-2 tracking-wide">{displayRoom}</p>
                    {room && <p className="text-xs text-gray-500 mt-1">{room.propertyName}</p>}
                  </div>
                  <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Giá phòng / tháng</p>
                    <p className="text-xl font-bold text-white mt-2 tracking-wide">
                      {room ? formatCurrency(room.basePrice) : '—'}
                    </p>
                  </div>
                  <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tình trạng phòng</p>
                    <p className="text-xl font-bold text-amber-400 mt-2 tracking-wide">
                      {room?.status || '—'}
                    </p>
                  </div>
                </div>

                {/* Thông tin cá nhân */}
                <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E5C158]/10 space-y-4">
                  <h3 className="text-base font-bold text-[#E5C158] tracking-wide">Thông tin cá nhân cư dân</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-300">
                    {[
                      { label: 'Họ và tên', value: displayName },
                      { label: 'Số điện thoại', value: displayPhone },
                      { label: 'Email', value: profile?.email || '—' },
                      { label: 'Giới tính', value: profile?.sex === 'Female' ? 'Nữ' : profile?.sex === 'Male' ? 'Nam' : (profile?.sex || '—') },
                      { label: 'Số CMND / CCCD', value: profile?.identityCardNumber || 'Chưa cung cấp' },
                      { label: 'Địa chỉ thường trú', value: profile?.address || 'Chưa cung cấp' },
                      { label: 'Mã thành viên', value: profile?.membershipCode || '—' },
                      { label: 'Trạng thái thành viên', value: profile?.membershipStatus || '—' },
                    ].map((f) => (
                      <div key={f.label}>
                        <span className="text-gray-400 block text-xs uppercase font-medium tracking-wider">{f.label}</span>
                        <span className="text-white font-semibold mt-1 block truncate" title={f.value}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nội quy */}
                <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E5C158]/10 space-y-4">
                  <h3 className="text-base font-bold text-[#E5C158] tracking-wide">Nội quy phòng trọ văn minh</h3>
                  <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside font-normal leading-relaxed">
                    <li>Giữ gìn trật tự chung sau <span className="text-[#E5C158]">23:00</span> để không ảnh hưởng phòng bên cạnh.</li>
                    <li>Đổ rác đúng nơi quy định tại khu vực hành lang tập trung.</li>
                    <li>Khóa xe máy cẩn thận ở tầng 1, tắt bớt thiết bị điện khi ra khỏi phòng.</li>
                    <li>Mọi sự cố hỏng hóc vui lòng báo ở tab <span className="text-[#E5C158]">&quot;Báo hỏng đồ&quot;</span> để ban quản lý xử lý.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════ TAB: HÌNH ẢNH PHÒNG ═══════════ */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#E5C158] tracking-wide">Hình Ảnh Hiện Trạng Phòng</h3>
              {room && <span className="text-xs text-gray-400">Phòng {room.roomNumber} — Tầng {room.floor}</span>}
            </div>

            {roomLoading && <LoadingSpinner text="Đang tải ảnh phòng..." />}
            {roomError && <ErrorCard message={roomError} onRetry={fetchRoom} />}
            {!roomLoading && !roomError && room === null && (
              <div className="text-center py-16 text-gray-500">
                <Home size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Chưa tìm thấy thông tin phòng. Hợp đồng có thể chưa được kích hoạt.</p>
              </div>
            )}

            {!roomLoading && room && (
              <>
                {room.images && room.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {room.images.map((img, idx) => (
                      <div key={img.id || idx} className="group overflow-hidden rounded-xl border border-[#E5C158]/10 bg-[#1A1A1A] transition-all hover:border-[#E5C158]/40">
                        <div 
                          className="overflow-hidden relative h-56 cursor-pointer"
                          onClick={() => setSelectedImage(formatImageUrl(img.imageUrl))}
                        >
                          <img
                            src={formatImageUrl(img.imageUrl)}
                            alt={`Ảnh phòng ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = 'https://placehold.co/600x400/1a1a1a/E5C158?text=Ảnh+phòng'; }}
                          />
                          {img.isCover && (
                            <span className="absolute top-2 left-2 text-[10px] bg-[#E5C158] text-black font-bold px-2 py-0.5 rounded uppercase tracking-widest">Ảnh bìa</span>
                          )}
                        </div>
                        <div className="p-4 bg-[#1A1A1A]">
                          <p className="text-sm font-semibold text-white tracking-wide">
                            {img.isCover ? 'Ảnh đại diện phòng' : `Ảnh ${idx + 1}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Đối chiếu khi trả phòng</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <Image size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Chủ nhà chưa tải ảnh phòng lên hệ thống.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════ TAB: BẢNG GIÁ DỊCH VỤ ═══════════ */}
        {activeTab === 'services' && (
          <div>
            <h3 className="text-lg font-bold text-[#E5C158] mb-6 tracking-wide">Biểu Phí Điện Nước &amp; Dịch Vụ Nhà Trọ</h3>

            {servicesLoading && <LoadingSpinner text="Đang tải bảng giá..." />}
            {servicesError && <ErrorCard message={servicesError} onRetry={() => fetchServices(room?.propertyId, profile?.organizationId)} />}

            {!servicesLoading && services.length === 0 && !servicesError && (
              <div className="text-center py-16 text-gray-500">
                <Key size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Chủ nhà chưa thiết lập bảng giá dịch vụ.</p>
              </div>
            )}

            {!servicesLoading && services.length > 0 && (
              <div className="bg-[#1A1A1A] rounded-xl border border-[#E5C158]/10 overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#222222] text-[#E5C158] border-b border-[#E5C158]/10 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Khoản mục</th>
                      <th className="p-4">Đơn giá</th>
                      <th className="p-4">Đơn vị</th>
                      <th className="p-4">Chu kỳ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#E5C158]/5">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-[#222222]/40 transition-colors">
                        <td className="p-4 pl-6 font-semibold text-white">{srv.serviceName}</td>
                        <td className="p-4 text-[#E5C158] font-semibold">{formatCurrency(srv.defaultPrice)}</td>
                        <td className="p-4 text-gray-400 text-xs">{srv.unit || '—'}</td>
                        <td className="p-4 text-xs text-gray-400">
                          <span className="border border-gray-700 px-2.5 py-1 rounded-md bg-black/20">{srv.billingCycle || 'Tháng'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB: HỢP ĐỒNG ═══════════ */}
        {activeTab === 'contracts' && (
          <div>
            <h3 className="text-lg font-bold text-[#E5C158] mb-6 tracking-wide">Hợp Đồng Thuê Nhà</h3>

            {contractsLoading && <LoadingSpinner text="Đang tải hợp đồng..." />}
            {contractsError && <ErrorCard message={contractsError} onRetry={fetchContracts} />}

            {!contractsLoading && !contractsError && contracts.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <FileText size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Chưa có hợp đồng nào.</p>
              </div>
            )}

            {!contractsLoading && contracts.length > 0 && (
              <div className="space-y-4">
                {contracts.map((c) => {
                  const statusInfo = mapContractStatus(c.status);
                  return (
                    <div key={c.id} className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10 hover:border-[#E5C158]/30 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-black/30 rounded-xl text-[#E5C158] shrink-0">
                            <FileText size={22} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white tracking-wide">
                              Hợp đồng thuê phòng {c.roomNumber || '—'} {c.residentName ? `• ${c.residentName}` : ''}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Mã HĐ: {c.id}</p>
                            
                            <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1">
                              <p className="text-xs text-gray-400">
                                <span className="text-gray-500">Thời hạn:</span> {formatDate(c.startDate)} → {formatDate(c.endDate)}
                              </p>
                              <p className="text-xs text-gray-400">
                                <span className="text-gray-500">Giá thuê:</span> {formatCurrency(c.basePrice)} / tháng
                              </p>
                              <p className="text-xs text-gray-400">
                                <span className="text-gray-500">Tiền cọc:</span> {c.depositAmount > 0 ? <span className="text-[#E5C158]">{formatCurrency(c.depositAmount)}</span> : 'Không có'}
                              </p>
                              <p className="text-xs">
                                <span className="text-gray-500">Trạng thái:</span> <span className={`font-semibold ${statusInfo.cls}`}>{statusInfo.label}</span>
                                {c.isExpiringSoon && <span className="ml-2 text-amber-400">⚠️ Sắp hết ({c.daysUntilExpiry} ngày)</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <button
                            onClick={() => setSelectedContract(c)}
                            className="flex items-center space-x-2 text-xs font-semibold text-[#E5C158] border border-[#E5C158]/30 bg-[#E5C158]/10 px-4 py-2 rounded-lg hover:bg-[#E5C158] hover:text-black transition-all"
                          >
                            <FileText size={14} /><span>Xem chi tiết</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB: HÓA ĐƠN ═══════════ */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#E5C158] tracking-wide">Danh Sách Hóa Đơn Hàng Tháng</h3>

            {invoicesLoading && <LoadingSpinner text="Đang tải hóa đơn..." />}
            {invoicesError && <ErrorCard message={invoicesError} onRetry={fetchInvoices} />}

            {!invoicesLoading && !invoicesError && invoices.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <DollarSign size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Chưa có hóa đơn nào.</p>
              </div>
            )}

            {!invoicesLoading && invoices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {invoices.map((inv) => {
                  const statusInfo = mapInvoiceStatus(inv.statusRaw || inv.status);
                  return (
                    <div key={inv.id} className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10 flex flex-col justify-between shadow-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold tracking-widest bg-black/40 px-2 py-1 rounded">{inv.receiptNumber}</span>
                          <h4 className="text-base font-bold text-white mt-3 tracking-wide">
                            {inv.incomeCategoryName || inv.incomeTypeRaw || 'Hóa đơn'}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Ngày thu: {formatDate(inv.collectedAt)} • {inv.paymentMethodRaw}
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {inv.description && (
                        <p className="mt-3 text-xs text-gray-400 bg-black/20 p-2 rounded-lg">{inv.description}</p>
                      )}

                      <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-400">Tổng tiền</p>
                          <p className="text-xl font-bold text-[#E5C158] mt-1 tracking-wide">{formatCurrency(inv.amount)}</p>
                        </div>
                        {inv.referenceCode && (
                          <p className="text-xs text-gray-500">Mã tham chiếu: <span className="text-white">{inv.referenceCode}</span></p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB: BÁO CÁO SỰ CỐ ═══════════ */}
        {activeTab === 'report' && (
          <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E5C158]/10 max-w-2xl">
            <h3 className="text-lg font-bold text-[#E5C158] tracking-wide">Báo Hỏng Đồ / Gửi Sự Cố Phòng Ở</h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">Vui lòng điền thông tin sự cố. Chủ nhà hoặc thợ sửa chữa sẽ qua xử lý cho bạn sớm nhất.</p>

            <form className="space-y-5" onSubmit={(e) => {
              e.preventDefault();
              alert('Đã gửi thông tin báo hỏng. Ban quản lý phòng trọ sẽ liên hệ qua kiểm tra đồ đạc cho bạn nhé.');
            }}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Vấn đề cần hỗ trợ</label>
                <select className="w-full bg-[#222222] border border-[#E5C158]/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E5C158] text-sm">
                  <option>Hỏng thiết bị điện (Điều hòa, tủ lạnh, bóng đèn, bình nóng lạnh...)</option>
                  <option>Hỏng hệ thống nước (Tắc cống, rò rỉ nước vòi sen, bồn cầu...)</option>
                  <option>Mạng Wifi yếu / Không kết nối được</option>
                  <option>Vấn đề an ninh, xe cộ, khóa vân tay tầng 1</option>
                  <option>Khác (Ý kiến đóng góp, phản ánh phòng bên ồn ào...)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Mô tả chi tiết sự cố</label>
                <textarea
                  rows="4"
                  placeholder="Ví dụ: Điều hòa phòng bật không lên mát, chảy nước ở cục lạnh. Nhờ chủ nhà cho thợ qua xem giúp..."
                  className="w-full bg-[#222222] border border-[#E5C158]/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E5C158] text-sm placeholder-gray-600 leading-relaxed"
                />
              </div>
              <button type="submit" className="w-full bg-[#E5C158] text-black text-sm font-bold tracking-wider uppercase py-3.5 rounded-lg hover:bg-[#d4b047] transition-all shadow-lg shadow-[#E5C158]/5">
                Gửi Thông Báo Tới Chủ Nhà
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      
      {/* 1. Modal xem ảnh Fullscreen */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 bg-black/50 text-white rounded-full hover:bg-[#E5C158] hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Phóng to ảnh" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10" 
          />
        </div>
      )}

      {/* 2. Modal xem chi tiết Hợp Đồng & PDF */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] border border-[#E5C158]/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-[#E5C158]/5">
            <div className="flex justify-between items-center p-6 border-b border-[#E5C158]/10">
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">Chi Tiết Hợp Đồng</h3>
                <p className="text-sm text-gray-400 mt-1">Mã HĐ: <span className="font-mono text-[#E5C158]">{selectedContract.id}</span></p>
              </div>
              <button 
                onClick={() => setSelectedContract(null)}
                className="p-2 bg-black/40 text-gray-400 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#121212]">
              {/* Thông tin tóm tắt */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Phòng thuê</p>
                  <p className="text-sm text-white font-bold mt-1">{selectedContract.roomNumber || '—'}</p>
                </div>
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Giá / Tháng</p>
                  <p className="text-sm text-[#E5C158] font-bold mt-1">{formatCurrency(selectedContract.basePrice)}</p>
                </div>
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Tiền cọc</p>
                  <p className="text-sm text-[#E5C158] font-bold mt-1">{formatCurrency(selectedContract.depositAmount)}</p>
                </div>
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Trạng thái</p>
                  <p className={`text-sm font-bold mt-1 ${mapContractStatus(selectedContract.status).cls}`}>
                    {mapContractStatus(selectedContract.status).label}
                  </p>
                </div>
              </div>

              {/* Khu vực hiển thị PDF */}
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-white/5 bg-[#222222] flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={16} className="text-[#E5C158]" /> Bản quét hợp đồng (PDF)
                  </h4>
                  {selectedContract.contractPdfUrl && (
                    <a 
                      href={selectedContract.contractPdfUrl} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 text-[#E5C158] hover:underline"
                    >
                      <Download size={12} /> Tải xuống
                    </a>
                  )}
                </div>
                <div className="flex-1 bg-[#2a2a2a] relative">
                  {selectedContract.contractPdfUrl ? (
                    <iframe 
                      src={selectedContract.contractPdfUrl} 
                      className="w-full h-full border-0"
                      title="PDF Hợp Đồng"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <FileText size={48} className="opacity-20 mb-3" />
                      <p className="text-sm">Chủ nhà chưa tải lên bản PDF của hợp đồng này.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal chỉnh sửa hồ sơ cá nhân */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] border border-[#E5C158]/20 rounded-2xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl shadow-[#E5C158]/5">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#E5C158]/10">
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">Chỉnh Sửa Hồ Sơ</h3>
                <p className="text-xs text-gray-400 mt-1">Cập nhật thông tin cá nhân của bạn</p>
              </div>
              <button onClick={() => setEditProfileOpen(false)}
                className="p-2 bg-black/40 text-gray-400 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 bg-[#121212]">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-24 h-24 rounded-full border-2 border-[#E5C158]/30 overflow-hidden bg-[#E5C158]/10 flex items-center justify-center">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    : avatarUrl
                      ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      : <User size={36} className="text-[#E5C158]" />
                  }
                </div>
                <label className="cursor-pointer text-xs font-semibold text-[#E5C158] border border-[#E5C158]/30 bg-[#E5C158]/10 px-5 py-2 rounded-lg hover:bg-[#E5C158] hover:text-black transition-all">
                  {avatarUploading ? 'Đang upload...' : '📷 Đổi ảnh đại diện'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarFileChange} />
                </label>
                {avatarFile && <p className="text-[11px] text-gray-500 truncate max-w-[200px]">✓ {avatarFile.name}</p>}
              </div>

              {/* Form fields */}
              {[
                { label: 'Họ và tên', key: 'fullName', type: 'text', placeholder: 'Nguyễn Văn A' },
                { label: 'Số điện thoại', key: 'phone', type: 'tel', placeholder: '09xxxxxxxx' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Địa chỉ thường trú', key: 'address', type: 'text', placeholder: 'Số nhà, đường, phường, quận...' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#E5C158]/50 focus:ring-1 focus:ring-[#E5C158]/20 transition-all placeholder-gray-600"
                  />
                </div>
              ))}

              {editError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{editError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#E5C158]/10 flex gap-3">
              <button
                onClick={() => setEditProfileOpen(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/5 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editSaving}
                className="flex-1 py-3 rounded-xl bg-[#E5C158] text-black text-sm font-bold hover:bg-[#d4b04d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editSaving ? 'Đang lưu...' : '✓ Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}