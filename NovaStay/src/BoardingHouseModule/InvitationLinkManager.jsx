import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2, Plus, Copy, Trash2, CheckCircle2, XCircle, Clock,
  Loader2, RefreshCw, Building2, Home, ChevronDown, ChevronUp,
  ExternalLink, Shield, Users, Calendar, Hash, UserCheck, UserX,
  Check, X, Mail, Phone, AlertCircle
} from 'lucide-react';
import { 
  createInvitationLink, 
  getInvitationLinks, 
  deactivateInvitationLink,
  getPendingApprovals,
  approvePendingResident,
  rejectPendingResident
} from '../api/invitationLinkApi';
import { getProperties } from '../api/propertyApi';
import { getRooms } from '../api/roomApi';

/* ── helpers ─────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDatetime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function isExpired(d) { return d && new Date(d) < new Date(); }

/* ── Component ────────────────────────────────────────────────── */
export default function InvitationLinkManager({ organizationId }) {
  const [activeTab, setActiveTab] = useState('links'); // 'links' | 'approvals'
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Pending approvals
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Properties & rooms fetched internally
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [form, setForm] = useState({
    propertyId: '', roomId: '', expiresInDays: 7, maxUses: 0, note: '',
  });

  const loadLinks = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await getInvitationLinks(organizationId);
      setLinks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadApprovals = useCallback(async () => {
    if (!organizationId) return;
    setLoadingApprovals(true);
    try {
      const data = await getPendingApprovals(organizationId);
      setPendingApprovals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Lỗi tải danh sách chờ duyệt:', e);
    } finally {
      setLoadingApprovals(false);
    }
  }, [organizationId]);

  useEffect(() => { 
    loadLinks(); 
    loadApprovals();
  }, [loadLinks, loadApprovals]);

  // Fetch properties khi có organizationId
  useEffect(() => {
    if (!organizationId) return;
    setLoadingProps(true);
    getProperties(organizationId, null, null, 1, 100)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items ?? []);
        setProperties(list);
      })
      .catch(e => console.error('Lỗi tải danh sách cơ sở:', e))
      .finally(() => setLoadingProps(false));
  }, [organizationId]);

  // Fetch rooms khi chọn property
  useEffect(() => {
    if (!form.propertyId) {
      setRooms([]);
      return;
    }
    setLoadingRooms(true);
    getRooms({ propertyId: form.propertyId, pageSize: 200 })
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items ?? []);
        setRooms(list);
      })
      .catch(e => console.error('Lỗi tải danh sách phòng:', e))
      .finally(() => setLoadingRooms(false));
  }, [form.propertyId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createInvitationLink(organizationId, {
        propertyId: form.propertyId || null,
        roomId: form.roomId || null,
        expiresInDays: Number(form.expiresInDays),
        maxUses: Number(form.maxUses),
        note: form.note || null,
      });
      setShowCreate(false);
      setForm({ propertyId: '', roomId: '', expiresInDays: 7, maxUses: 0, note: '' });
      await loadLinks();
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  };

  const getFullInviteUrl = (link) => {
    if (link?.token) {
      return `${window.location.origin}/invitation/${link.token}`;
    }
    return link?.inviteUrl || '';
  };

  const handleDeactivate = async (link) => {
    const fullUrl = getFullInviteUrl(link);
    if (!window.confirm(`Vô hiệu hoá link này?\n${fullUrl}`)) return;
    try {
      await deactivateInvitationLink(organizationId, link.id);
      await loadLinks();
    } catch (e) {
      alert(e.message);
    }
  };

  const copyUrl = (link) => {
    const fullUrl = getFullInviteUrl(link);
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleApprove = async (item) => {
    if (!window.confirm(`Xác nhận phê duyệt cho người thuê "${item.fullName}" gia nhập?`)) return;
    setActionLoadingId(item.membershipId);
    try {
      await approvePendingResident(organizationId, item.membershipId);
      alert(`Đã duyệt người thuê "${item.fullName}" thành công!`);
      await loadApprovals();
    } catch (e) {
      alert(e.message || 'Lỗi khi duyệt người thuê');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn từ chối yêu cầu của "${item.fullName}"?`)) return;
    setActionLoadingId(item.membershipId);
    try {
      await rejectPendingResident(organizationId, item.membershipId);
      alert(`Đã từ chối yêu cầu của "${item.fullName}".`);
      await loadApprovals();
    } catch (e) {
      alert(e.message || 'Lỗi khi từ chối');
    } finally {
      setActionLoadingId(null);
    }
  };

  // rooms đã được fetch riêng theo property được chọn
  const filteredRooms = rooms;

  /* ── render ────────────────────────────────────────────────── */
  return (
    <div className="ilm-wrap">
      {/* Header */}
      <div className="ilm-header">
        <div className="ilm-title-group">
          <div className="ilm-icon"><Link2 size={20} /></div>
          <div>
            <h2 className="ilm-title">Quản Lý Link Mời & Người Thuê</h2>
            <p className="ilm-desc">Tạo link mời tự đăng ký và phê duyệt người thuê gia nhập cơ sở lưu trú</p>
          </div>
        </div>
        <div className="ilm-actions">
          <button 
            className="ilm-btn-refresh" 
            onClick={() => { loadLinks(); loadApprovals(); }} 
            title="Làm mới tất cả"
          >
            <RefreshCw size={15} />
          </button>
          {activeTab === 'links' && (
            <button className="ilm-btn-create" onClick={() => setShowCreate(v => !v)}>
              {showCreate ? <><ChevronUp size={16} /> Đóng</> : <><Plus size={16} /> Tạo Link Mới</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="ilm-tab-nav">
        <button
          className={`ilm-tab-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <Link2 size={16} />
          <span>Danh Sách Link Mời</span>
          <span className="ilm-tab-counter">{links.length}</span>
        </button>

        <button
          className={`ilm-tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <UserCheck size={16} />
          <span>Yêu Cầu Chờ Duyệt</span>
          {pendingApprovals.length > 0 ? (
            <span className="ilm-tab-counter alert">{pendingApprovals.length}</span>
          ) : (
            <span className="ilm-tab-counter">0</span>
          )}
        </button>
      </div>

      {/* TAB 1: DANH SÁCH LINK MỜI */}
      {activeTab === 'links' && (
        <>
          {/* Create form */}
          {showCreate && (
            <form className="ilm-form" onSubmit={handleCreate}>
              <div className="ilm-form-title">Tạo link mời mới</div>
              <div className="ilm-form-row">
                <label className="ilm-label">
                  Cơ sở (không bắt buộc)
                  {loadingProps && <span className="ilm-loading-hint"> — Đang tải...</span>}
                </label>
                <select
                  className="ilm-select"
                  value={form.propertyId}
                  onChange={e => setForm(f => ({ ...f, propertyId: e.target.value, roomId: '' }))}
                  disabled={loadingProps}
                >
                  <option value="">{loadingProps ? 'Đang tải cơ sở...' : '-- Tất cả cơ sở --'}</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.propertyName || p.name || p.id}</option>
                  ))}
                </select>
              </div>
              <div className="ilm-form-row">
                <label className="ilm-label">
                  Phòng cụ thể (không bắt buộc)
                  {loadingRooms && <span className="ilm-loading-hint"> — Đang tải...</span>}
                </label>
                <select
                  className="ilm-select"
                  value={form.roomId}
                  onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                  disabled={!form.propertyId || loadingRooms}
                >
                  <option value="">
                    {!form.propertyId
                      ? '-- Chọn cơ sở trước --'
                      : loadingRooms
                        ? 'Đang tải phòng...'
                        : '-- Không chỉ định phòng --'
                    }
                  </option>
                  {filteredRooms.map(r => (
                    <option key={r.id} value={r.id}>Phòng {r.roomNumber}</option>
                  ))}
                </select>
              </div>
              <div className="ilm-form-2col">
                <div className="ilm-form-row">
                  <label className="ilm-label">Hiệu lực (ngày)</label>
                  <input
                    type="number" min={1} max={90} className="ilm-input"
                    value={form.expiresInDays}
                    onChange={e => setForm(f => ({ ...f, expiresInDays: e.target.value }))}
                  />
                </div>
                <div className="ilm-form-row">
                  <label className="ilm-label">Số lượt tối đa (0=vô hạn)</label>
                  <input
                    type="number" min={0} max={1000} className="ilm-input"
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ilm-form-row">
                <label className="ilm-label">Ghi chú</label>
                <input
                  type="text" className="ilm-input" placeholder="Ví dụ: Phòng 101 tầng 2..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>
              <div className="ilm-form-footer">
                <button type="button" className="ilm-btn-cancel" onClick={() => setShowCreate(false)}>Huỷ</button>
                <button type="submit" className="ilm-btn-submit" disabled={creating}>
                  {creating ? <><Loader2 size={15} className="ilm-spin" /> Đang tạo...</> : <><Plus size={15} /> Tạo Link</>}
                </button>
              </div>
            </form>
          )}

          {/* List Links */}
          {loading ? (
            <div className="ilm-empty">
              <Loader2 size={24} className="ilm-spin text-indigo-400" />
              <span>Đang tải danh sách link mời...</span>
            </div>
          ) : links.length === 0 ? (
            <div className="ilm-empty">
              <Link2 size={32} className="text-slate-600" />
              <span>Chưa có link mời nào. Bấm <strong>"+ Tạo Link Mới"</strong> để bắt đầu mời người thuê.</span>
            </div>
          ) : (
            <div className="ilm-list">
              {links.map(link => {
                const expired = isExpired(link.expiresAt);
                const exhausted = link.maxUses > 0 && link.usedCount >= link.maxUses;
                const active = link.isActive && !expired && !exhausted;

                return (
                  <div key={link.id} className={`ilm-card ${!active ? 'ilm-card--inactive' : ''}`}>
                    {/* Status pill */}
                    <div className={`ilm-status ${active ? 'active' : 'inactive'}`}>
                      {active ? <><CheckCircle2 size={12} /> Đang hoạt động</> : <><XCircle size={12} /> Không hợp lệ</>}
                    </div>

                    {/* URL row */}
                    <div className="ilm-url-row">
                      <code className="ilm-url-text">{getFullInviteUrl(link)}</code>
                      <div className="ilm-url-btns">
                        <button
                          className={`ilm-icon-btn ${copiedId === link.id ? 'copied' : ''}`}
                          onClick={() => copyUrl(link)}
                          title="Sao chép link"
                        >
                          {copiedId === link.id ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                        </button>
                        <a
                          href={getFullInviteUrl(link)} target="_blank" rel="noreferrer"
                          className="ilm-icon-btn" title="Mở link"
                        >
                          <ExternalLink size={15} />
                        </a>
                        {active && (
                          <button
                            className="ilm-icon-btn danger"
                            onClick={() => handleDeactivate(link)}
                            title="Vô hiệu hoá"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="ilm-meta">
                      {link.propertyName && (
                        <span className="ilm-meta-item"><Building2 size={12} /> {link.propertyName}</span>
                      )}
                      {link.roomName && (
                        <span className="ilm-meta-item"><Home size={12} /> Phòng {link.roomName}</span>
                      )}
                      <span className="ilm-meta-item">
                        <Calendar size={12} />
                        {expired
                          ? <span className="text-red-400">Hết hạn {fmtDate(link.expiresAt)}</span>
                          : <>Hết hạn {fmtDate(link.expiresAt)}</>
                        }
                      </span>
                      <span className="ilm-meta-item">
                        <Users size={12} />
                        {link.usedCount}/{link.maxUses === 0 ? '∞' : link.maxUses} lượt
                      </span>
                      {link.note && (
                        <span className="ilm-meta-item ilm-note">"{link.note}"</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: YÊU CẦU CHỜ PHÊ DUYỆT */}
      {activeTab === 'approvals' && (
        <div className="ilm-approvals-wrap">
          {loadingApprovals ? (
            <div className="ilm-empty">
              <Loader2 size={24} className="ilm-spin text-indigo-400" />
              <span>Đang kiểm tra các yêu cầu chờ duyệt...</span>
            </div>
  return <div>Tabs</div>;
}