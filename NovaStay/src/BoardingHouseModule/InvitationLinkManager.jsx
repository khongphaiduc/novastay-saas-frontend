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
export default function InvitationLinkManager({ organizationId, onPendingChange }) {
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
      const list = Array.isArray(data) ? data : [];
      setPendingApprovals(list);
      if (typeof onPendingChange === 'function') {
        onPendingChange(list.length);
      }
    } catch (e) {
      console.error('Lỗi tải danh sách chờ duyệt:', e);
    } finally {
      setLoadingApprovals(false);
    }
  }, [organizationId, onPendingChange]);

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
          ) : pendingApprovals.length === 0 ? (
            <div className="ilm-empty">
              <div className="ilm-empty-icon-wrap">
                <UserCheck size={36} className="text-emerald-400" />
              </div>
              <span className="text-slate-300 font-semibold text-base">Hiện không có yêu cầu nào chờ duyệt</span>
              <span className="text-slate-500 text-sm max-w-md">
                Khi người thuê mở link mời và bấm tham gia, hồ sơ của họ sẽ hiển thị ở đây để bạn xác nhận vào danh sách cư dân.
              </span>
            </div>
          ) : (
            <div className="ilm-approvals-list">
              {pendingApprovals.map(item => {
                const isProcessing = actionLoadingId === item.membershipId;
                const initial = (item.fullName || 'U').charAt(0).toUpperCase();

                return (
                  <div key={item.membershipId} className="ilm-approval-card">
                    {/* Left: Avatar & Info */}
                    <div className="ilm-approval-main">
                      <div className="ilm-approval-avatar">
                        {initial}
                      </div>
                      <div className="ilm-approval-info">
                        <div className="ilm-approval-top">
                          <h4 className="ilm-approval-name">{item.fullName}</h4>
                          <span className="ilm-approval-badge">
                            <Clock size={12} /> Chờ phê duyệt
                          </span>
                        </div>

                        <div className="ilm-approval-meta-grid">
                          {item.email && (
                            <span className="ilm-approval-meta-tag">
                              <Mail size={13} /> {item.email}
                            </span>
                          )}
                          <span className="ilm-approval-meta-tag">
                            <Phone size={13} /> {item.phone || 'Chưa cập nhật SĐT'}
                          </span>
                          {item.identityCardNumber && (
                            <span className="ilm-approval-meta-tag">
                              <Hash size={13} /> CCCD: {item.identityCardNumber}
                            </span>
                          )}
                          <span className="ilm-approval-meta-tag muted">
                            <Clock size={13} /> Gửi lúc: {fmtDatetime(item.requestedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="ilm-approval-actions">
                      <button
                        className="ilm-btn-approve"
                        onClick={() => handleApprove(item)}
                        disabled={isProcessing}
                        title="Duyệt người thuê này"
                      >
                        {isProcessing ? (
                          <Loader2 size={16} className="ilm-spin" />
                        ) : (
                          <>
                            <Check size={16} /> Duyệt Tham Gia
                          </>
                        )}
                      </button>

                      <button
                        className="ilm-btn-reject"
                        onClick={() => handleReject(item)}
                        disabled={isProcessing}
                        title="Từ chối yêu cầu"
                      >
                        <X size={16} /> Từ Chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .ilm-wrap { display: flex; flex-direction: column; gap: 1.25rem; }
        .ilm-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .ilm-title-group { display: flex; align-items: flex-start; gap: 0.875rem; }
        .ilm-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          color: #818cf8; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ilm-title { color: #f1f5f9; font-size: 1.1rem; font-weight: 700; margin: 0; }
        .ilm-desc { color: #64748b; font-size: 0.82rem; margin: 2px 0 0; }
        .ilm-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .ilm-btn-refresh {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .ilm-btn-refresh:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
        .ilm-btn-create {
          display: flex; align-items: center; gap: 6px; padding: 0 1rem; height: 36px;
          border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-weight: 600; font-size: 0.88rem; border: none; cursor: pointer; transition: all 0.2s;
        }
        .ilm-btn-create:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }

        /* Tabs Nav */
        .ilm-tab-nav {
          display: flex; gap: 0.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 0.35rem;
          width: fit-content;
        }
        .ilm-tab-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0.6rem 1.1rem; border-radius: 10px;
          background: transparent; border: none;
          color: #94a3b8; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .ilm-tab-btn:hover { color: #f1f5f9; background: rgba(255,255,255,0.04); }
        .ilm-tab-btn.active {
          background: rgba(99,102,241,0.18);
          color: #c7d2fe;
          border: 1px solid rgba(99,102,241,0.35);
          box-shadow: 0 4px 12px rgba(99,102,241,0.15);
        }
        .ilm-tab-counter {
          font-size: 0.75rem; padding: 2px 7px; border-radius: 10px;
          background: rgba(255,255,255,0.08); color: #cbd5e1;
        }
        .ilm-tab-counter.alert {
          background: #ef4444; color: #ffffff; font-weight: 700;
          animation: pulse 2s infinite;
        }

        /* Form */
        .ilm-form {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;
        }
        .ilm-form-title { color: #a5b4fc; font-weight: 600; font-size: 0.95rem; }
        .ilm-form-row { display: flex; flex-direction: column; gap: 0.4rem; }
        .ilm-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .ilm-label { color: #64748b; font-size: 0.8rem; font-weight: 500; }
        .ilm-input, .ilm-select {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0.6rem 0.75rem; color: #e2e8f0; font-size: 0.88rem; outline: none;
          transition: border-color 0.15s; width: 100%;
        }
        .ilm-input:focus, .ilm-select:focus { border-color: rgba(99,102,241,0.6); }
        .ilm-select { cursor: pointer; }
        .ilm-select option { background: #1e1b4b; }
        .ilm-form-footer { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.25rem; }
        .ilm-btn-cancel {
          padding: 0.6rem 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: #94a3b8; cursor: pointer; font-size: 0.88rem;
          transition: all 0.15s;
        }
        .ilm-btn-cancel:hover { background: rgba(255,255,255,0.05); }
        .ilm-btn-submit {
          display: flex; align-items: center; gap: 6px; padding: 0.6rem 1.25rem;
          border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-weight: 600; font-size: 0.88rem; border: none; cursor: pointer;
          transition: all 0.2s;
        }
        .ilm-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .ilm-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Empty */
        .ilm-empty {
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          padding: 3.5rem 1rem; color: #475569; font-size: 0.9rem; text-align: center;
          background: rgba(255,255,255,0.015); border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 16px;
        }
        .ilm-empty-icon-wrap {
          width: 60px; height: 60px; border-radius: 50%;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
          display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem;
        }

        /* List Links */
        .ilm-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .ilm-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;
          transition: border-color 0.15s;
        }
        .ilm-card:hover { border-color: rgba(99,102,241,0.3); }
        .ilm-card--inactive { opacity: 0.55; }
        .ilm-status {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; width: fit-content;
        }
        .ilm-status.active { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
        .ilm-status.inactive { background: rgba(100,116,139,0.1); color: #64748b; border: 1px solid rgba(100,116,139,0.2); }
        .ilm-url-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .ilm-url-text {
          flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 0.45rem 0.75rem;
          color: #a5b4fc; font-size: 0.8rem; font-family: monospace;
        }
        .ilm-url-btns { display: flex; gap: 0.4rem; flex-shrink: 0; }
        .ilm-icon-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .ilm-icon-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .ilm-icon-btn.copied { color: #34d399; border-color: rgba(16,185,129,0.4); }
        .ilm-icon-btn.danger:hover { color: #f87171; border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); }
        .ilm-meta { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .ilm-meta-item {
          display: flex; align-items: center; gap: 4px;
          color: #64748b; font-size: 0.78rem;
          background: rgba(255,255,255,0.03); padding: 3px 8px; border-radius: 6px;
        }
        .ilm-note { color: #94a3b8; font-style: italic; }
        .ilm-loading-hint { color: #6366f1; font-size: 0.75rem; font-weight: 400; }

        /* Approvals List */
        .ilm-approvals-wrap { display: flex; flex-direction: column; gap: 1rem; }
        .ilm-approvals-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .ilm-approval-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px; padding: 1.25rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1.25rem;
          flex-wrap: wrap; transition: all 0.2s;
        }
        .ilm-approval-card:hover {
          border-color: rgba(99,102,241,0.3);
          background: rgba(255,255,255,0.045);
        }
        .ilm-approval-main { display: flex; align-items: center; gap: 1.1rem; flex: 1; min-width: 280px; }
        .ilm-approval-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #ffffff; font-weight: 700; font-size: 1.2rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }
        .ilm-approval-info { display: flex; flex-direction: column; gap: 0.35rem; }
        .ilm-approval-top { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .ilm-approval-name { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; margin: 0; }
        .ilm-approval-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(245,158,11,0.12); border: 1px solid rgba(251,191,36,0.35);
          color: #fbbf24; font-size: 0.75rem; font-weight: 600;
          padding: 2px 10px; border-radius: 20px;
        }
        .ilm-approval-meta-grid { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; margin-top: 2px; }
        .ilm-approval-meta-tag {
          display: inline-flex; align-items: center; gap: 5px;
          color: #94a3b8; font-size: 0.82rem;
        }
        .ilm-approval-meta-tag.muted { color: #64748b; font-size: 0.78rem; }
        
        /* Action buttons */
        .ilm-approval-actions { display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }
        .ilm-btn-approve {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.65rem 1.15rem; border-radius: 10px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff; font-weight: 600; font-size: 0.88rem;
          border: none; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }
        .ilm-btn-approve:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(16,185,129,0.45);
        }
        .ilm-btn-approve:disabled { opacity: 0.6; cursor: not-allowed; }

        .ilm-btn-reject {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.65rem 1rem; border-radius: 10px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; font-weight: 600; font-size: 0.88rem;
          cursor: pointer; transition: all 0.2s;
        }
        .ilm-btn-reject:hover:not(:disabled) {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.4);
          color: #fca5a5;
        }
        .ilm-btn-reject:disabled { opacity: 0.6; cursor: not-allowed; }

        .text-red-400 { color: #f87171; }
        .text-slate-300 { color: #cbd5e1; }
        .text-slate-500 { color: #64748b; }
        .text-slate-600 { color: #475569; }
        .text-emerald-400 { color: #34d399; }
        .text-indigo-400 { color: #818cf8; }
      `}</style>
    </div>
  );
}
