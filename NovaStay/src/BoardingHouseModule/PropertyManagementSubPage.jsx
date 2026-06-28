import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, MapPin, Edit2, Trash2, X, Check, AlertTriangle, Sparkles, Home, ChevronRight } from 'lucide-react';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../api/propertyApi';

// --- PREMIUM TOAST ---
function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const typeStyles = {
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        error: 'border-red-500/30 bg-red-500/10 text-red-400',
        info: 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    };

    const icons = { 
        success: <Check size={16} />, 
        error: <AlertTriangle size={16} />, 
        info: <Sparkles size={16} /> 
    };

    return (
        <div className="fixed top-6 right-6 z-[100] animate-[slideIn_0.3s_ease-out]">
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${typeStyles[type]}`}>
                <div className="p-1 rounded-full bg-white/10">
                    {icons[type]}
                </div>
                <span className="font-medium text-sm tracking-wide">{message}</span>
                <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100 transition-opacity">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

// --- PREMIUM MODAL ---
function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={(e) => e.target === e.currentTarget && onClose()}
            />
            <div className="relative w-full max-w-lg bg-[#0F1115] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                {/* Decorative glowing orb */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="relative p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

// --- PROPERTY FORM MODAL ---
function PropertyFormModal({ property, onClose, onSaved, showToast }) {
    const isEdit = !!property;
    const [form, setForm] = useState({
        propertyName: property?.propertyName || '',
        address: property?.address || '',
        propertyType: property?.propertyType || 'BoardingHouse'
    });
    const [submitting, setSubmitting] = useState(false);

    const organizationId = JSON.parse(localStorage.getItem('ns_account'))?.organizationId;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!organizationId) {
            showToast('Lỗi: Không tìm thấy OrganizationId.', 'error');
            return;
        }

        try {
            setSubmitting(true);
            if (isEdit) {
                await updateProperty(organizationId, property.id, form);
                showToast('Cập nhật cơ sở thành công!', 'success');
            } else {
                await createProperty(organizationId, form);
                showToast('Thêm cơ sở mới thành công!', 'success');
            }
            onSaved();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal title={isEdit ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">
                        Tên cơ sở <span className="text-amber-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        required 
                        placeholder="VD: Chung cư mini Cầu Giấy" 
                        value={form.propertyName}
                        onChange={e => setForm({...form, propertyName: e.target.value})}
                        className="w-full bg-[#1A1D24] border border-white/5 focus:border-amber-500/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-amber-500/20"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">
                        Địa chỉ <span className="text-amber-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        required 
                        placeholder="VD: Số 12 ngõ 34 Cầu Giấy, Hà Nội" 
                        value={form.address}
                        onChange={e => setForm({...form, address: e.target.value})}
                        className="w-full bg-[#1A1D24] border border-white/5 focus:border-amber-500/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-amber-500/20"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">Loại hình</label>
                    <select 
                        value={form.propertyType}
                        onChange={e => setForm({...form, propertyType: e.target.value})}
                        className="w-full bg-[#1A1D24] border border-white/5 focus:border-amber-500/50 rounded-xl px-4 py-3.5 text-white outline-none transition-all focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                    >
                        <option value="BoardingHouse">Nhà trọ / Chung cư mini</option>
                        <option value="Apartment">Căn hộ dịch vụ</option>
                        <option value="Dormitory">Ký túc xá</option>
                    </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-8">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:from-amber-300 hover:to-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                        {isEdit ? 'Lưu thay đổi' : 'Tạo cơ sở mới'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// --- MAIN PAGE ---
export default function PropertyManagementSubPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination & View Mode
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // UI State
    const [toast, setToast] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const organizationId = JSON.parse(localStorage.getItem('ns_account'))?.organizationId;

    const showToast = (message, type = 'info') => setToast({ message, type, id: Date.now() });

    const fetchProps = async (currentPage = 1) => {
        if (!organizationId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getProperties(organizationId, searchTerm, null, currentPage, 12);
            setProperties(data?.items || []);
            setTotalPages(data?.totalPages || 1);
            setPage(currentPage);
        } catch (error) {
            console.error('Fetch properties error:', error);
            showToast('Lỗi tải danh sách cơ sở', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProps(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        // fetchProps is called by the search effect above initially too
        // Add required animations to document if not present
        if (!document.getElementById('property-animations')) {
            const style = document.createElement('style');
            style.id = 'property-animations';
            style.innerHTML = `
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `;
            document.head.appendChild(style);
        }
    }, [organizationId]);

    const handleDelete = async (propertyId) => {
        try {
            await deleteProperty(organizationId, propertyId);
            showToast('Đã xóa cơ sở thành công.', 'success');
            setShowDeleteConfirm(null);
            fetchProps();
        } catch (error) {
            showToast(error.message, 'error');
            setShowDeleteConfirm(null);
        }
    };

    const filteredProps = properties.filter(p => 
        p.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-full p-6 md:p-10 animate-[fadeIn_0.3s_ease-out] text-white">
            {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="relative">
                    <div className="absolute -left-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-2 relative z-10">
                        Quản Lý Cơ Sở
                    </h1>
                    <p className="text-gray-400 font-medium relative z-10 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        Trung tâm điều hành không gian lưu trú của bạn
                    </p>
                </div>
                
                <button 
                    onClick={() => { setSelectedProperty(null); setShowFormModal(true); }}
                    className="group flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 rounded-2xl font-bold transition-all duration-300 shadow-lg"
                >
                    <div className="bg-amber-500 text-black p-1 rounded-lg group-hover:scale-110 transition-transform">
                        <Plus size={16} strokeWidth={3} />
                    </div>
                    <span className="group-hover:text-amber-400 transition-colors">Thêm Cơ Sở Mới</span>
                </button>
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full max-w-xl group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm nhanh tên cơ sở, địa chỉ..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-amber-500/30 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 outline-none transition-all focus:bg-white/[0.05] shadow-inner"
                    />
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-white/[0.03] border border-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Đang đồng bộ dữ liệu...</p>
                </div>
            ) : filteredProps.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="w-24 h-24 bg-white/[0.05] border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-2xl relative z-10 group hover:bg-amber-500/10 transition-colors duration-500">
                        <Building2 size={40} className="text-amber-500/70 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Chưa Khởi Tạo Cơ Sở</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
                        Hệ thống cần ít nhất một Tòa nhà / Cơ sở để có thể bắt đầu quá trình quản lý và sắp xếp phòng trọ.
                    </p>
                    
                    <button 
                        onClick={() => { setSelectedProperty(null); setShowFormModal(true); }}
                        className="relative z-10 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Khởi Tạo Ngay
                    </button>
                </div>
            ) : (
                <>
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                        {filteredProps.map(prop => (
                            <div 
                                key={prop.id} 
                                className={`group relative bg-[#0F1115]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 hover:bg-[#15181E] hover:border-amber-500/30 hover:shadow-[0_10px_40px_-10px_rgba(251,191,36,0.15)] transition-all duration-500 ${viewMode === 'list' ? 'flex flex-row items-center justify-between' : 'flex flex-col'}`}
                            >
                                {/* Card glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none" />

                                    <div className={`flex items-start relative z-10 ${viewMode === 'list' ? 'gap-6 items-center w-full' : 'mb-6 justify-between'}`}>
                                        <div className="flex items-center gap-4">
                                            {viewMode === 'grid' && (
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-inner group-hover:border-amber-500/30 transition-colors shrink-0">
                                                    <Home size={24} className="text-amber-500" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{prop.propertyName}</h3>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-[11px] font-medium text-gray-400 mt-1.5 uppercase tracking-wider">
                                                    <Building2 size={12} />
                                                    {prop.propertyType === 'Apartment' ? 'Căn Hộ Dịch Vụ' : prop.propertyType === 'Dormitory' ? 'Ký Túc Xá' : 'Nhà Trọ'}
                                                </span>
                                            </div>
                                        </div>

                                    {viewMode === 'list' && (
                                        <div className="flex items-center gap-3 text-sm text-gray-400 bg-black/20 p-3 rounded-xl border border-white/5 ml-auto mr-24">
                                            <MapPin size={16} className="shrink-0 text-amber-500/70" />
                                            <span className="line-clamp-1">{prop.address || 'Chưa cập nhật địa chỉ'}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {viewMode === 'grid' && (
                                    <div className="flex items-start gap-3 text-sm text-gray-400 mt-auto bg-black/20 p-4 rounded-2xl border border-white/5 relative z-10">
                                        <MapPin size={18} className="shrink-0 mt-0.5 text-amber-500/70" />
                                        <span className="line-clamp-2 leading-relaxed">{prop.address || 'Chưa cập nhật địa chỉ'}</span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className={`absolute right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 ${viewMode === 'list' ? 'top-1/2 -translate-y-1/2' : 'top-6 translate-x-4 group-hover:translate-x-0'}`}>
                                    <button 
                                        className="p-2 rounded-xl bg-gray-800/80 text-gray-300 hover:text-amber-400 hover:bg-gray-700 backdrop-blur-sm border border-white/5 transition-all shadow-lg hover:scale-110"
                                        onClick={(e) => { e.stopPropagation(); setSelectedProperty(prop); setShowFormModal(true); }}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        className="p-2 rounded-xl bg-gray-800/80 text-gray-300 hover:text-red-400 hover:bg-gray-700 backdrop-blur-sm border border-white/5 transition-all shadow-lg hover:scale-110"
                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(prop); }}
                                        title="Xóa"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                        <div className="flex justify-center items-center mt-10 gap-2">
                            <button
                                onClick={() => fetchProps(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Trước
                            </button>
                            <span className="text-gray-400 text-sm px-4">Trang {page} / {Math.max(1, totalPages)}</span>
                            <button
                                onClick={() => fetchProps(page + 1)}
                                disabled={page === totalPages || totalPages === 0}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                </>
            )}

            {/* MODALS */}
            {showFormModal && (
                <PropertyFormModal 
                    property={selectedProperty} 
                    onClose={() => setShowFormModal(false)} 
                    onSaved={() => {
                        setShowFormModal(false);
                        fetchProps();
                    }}
                    showToast={showToast}
                />
            )}

            {showDeleteConfirm && (
                <Modal title="Cảnh Báo Xóa Dữ Liệu" onClose={() => setShowDeleteConfirm(null)}>
                    <div className="flex flex-col items-center text-center pb-4">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping opacity-20" />
                            <AlertTriangle size={36} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Xóa "{showDeleteConfirm.propertyName}"?</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                            Hành động này không thể hoàn tác. <br/>
                            <span className="text-red-400 font-medium">Lưu ý: Bạn không thể xóa cơ sở nếu vẫn còn phòng trọ đang thuộc cơ sở này.</span>
                        </p>
                        
                        <div className="flex w-full gap-3 mt-2">
                            <button 
                                className="flex-1 py-3 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition-colors"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                Hủy Bỏ
                            </button>
                            <button 
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
                                onClick={() => handleDelete(showDeleteConfirm.id)}
                            >
                                Xác Nhận Xóa
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
