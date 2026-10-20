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
  return <div>List</div>;
}