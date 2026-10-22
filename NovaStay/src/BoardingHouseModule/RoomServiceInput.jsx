import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Home,
    CheckCircle2,
    AlertCircle,
    Zap,
    Droplet,
    Trash2,
    X,
    Save,
    Sparkles,
    Bell,
    AlertTriangle,
    Info,
    Check,
    RefreshCw,
    Loader2,
    Search,
    Building,
    ChevronDown,
    CalendarDays,
    History,
    Plus,
    Layers,
    FileSpreadsheet,
    Wand2,
    CheckSquare,
    Square,
    ChevronRight,
    Settings,
    Clock,
    Flame
} from 'lucide-react';
import { getProperties, getPropertyServices } from '../api/propertyApi';
import { getRooms } from '../api/roomApi';
import {
    getMetersByProperty,
    getReadingsByMeterPaged,
    createMeter,
    recordReading
} from '../api/utilityApi';
import { getPeriodReading, getPreviousReading, isRoomRecorded } from '../utils/utilityReadings';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOrgId() {
    try {
        return JSON.parse(localStorage.getItem('ns_account'))?.organizationId || '';
    } catch { return ''; }
}

function getCurrentBillingPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const RoomServiceInput = ({ isDarkMode = true }) => {
    // ─── State: Cơ sở (Properties) ──────────────────────────────────────────────
    const [properties, setProperties] = useState([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [loadingProperties, setLoadingProperties] = useState(true);

    // ─── State: Dịch vụ của cơ sở (Điện, Nước...) ──────────────────────────────
    const [propertyServices, setPropertyServices] = useState([]);

    // ─── State: Danh sách Phòng & Đồng hồ của Cơ sở ────────────────────────────
    const [rooms, setRooms] = useState([]);
    const [meters, setMeters] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // ─── State: Bộ lọc & Tìm kiếm ──────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [billingPeriod, setBillingPeriod] = useState(getCurrentBillingPeriod());
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unconfigured' | 'pending' | 'recorded'
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    // ─── State: Active View chính & Nhật ký ────────────────────────────────────
    const [mainTab, setMainTab] = useState('rooms'); // 'rooms' | 'logs'
    const [logs, setLogs] = useState([]);

    // ─── State: Modal Ghi số liệu một phòng ────────────────────────────────────
    const [recordingRoom, setRecordingRoom] = useState(null);
    const [meterFormValues, setMeterFormValues] = useState({});
    const [readingNote, setReadingNote] = useState('');
    const [savingReading, setSavingReading] = useState(false);
    const [recordError, setRecordError] = useState('');

    // ─── State: Modal Thiết lập nhanh đồng hồ 1 phòng ──────────────────────────
    const [setupRoom, setSetupRoom] = useState(null);
    const [setupElectric, setSetupElectric] = useState(true);
    const [setupWater, setSetupWater] = useState(true);
    const [initialElectricReading, setInitialElectricReading] = useState('0');
    const [initialWaterReading, setInitialWaterReading] = useState('0');
    const [savingSetup, setSavingSetup] = useState(false);
    const [setupError, setSetupError] = useState('');

    // ─── State: Modal Thiết lập Hàng loạt (Batch Setup) ────────────────────────
    const [isBatchSetupOpen, setIsBatchSetupOpen] = useState(false);
    const [batchSelectedRoomIds, setBatchSelectedRoomIds] = useState([]);
    const [batchInitialElectric, setBatchInitialElectric] = useState('0');
    const [batchInitialWater, setBatchInitialWater] = useState('0');
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

    // ─── State: Modal Lịch sử chỉ số (Paged Readings) ──────────────────────────
    const [historyMeter, setHistoryMeter] = useState(null);
    const [historyReadings, setHistoryReadings] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const [historyTotalCount, setHistoryTotalCount] = useState(0);

    // ─── 1. Tải danh sách Cơ sở khi khởi động ──────────────────────────────────
    useEffect(() => {
        const fetchProps = async () => {
            setLoadingProperties(true);
            try {
                const orgId = getOrgId();
                if (!orgId) return;
                const data = await getProperties(orgId);
                const items = data.items || data.data || (Array.isArray(data) ? data : []);
                setProperties(items);
                if (items.length > 0) {
                    const firstId = items[0].id || items[0].propertyId;
                    setSelectedPropertyId(firstId);
                }
            } catch (err) {
                console.error('Fetch properties error:', err);
            } finally {
                setLoadingProperties(false);
            }
        };
        fetchProps();
    }, []);

    // ─── 2. Tải toàn bộ Phòng, Dịch vụ & Đồng hồ của Cơ sở được chọn ───────────
    const loadPropertyData = useCallback(async () => {
        if (!selectedPropertyId) return;
        const orgId = getOrgId();
        setLoadingData(true);
        setFetchError('');

        try {
            const [roomsRes, metersRes, servicesRes] = await Promise.all([
                getRooms({ propertyId: selectedPropertyId, pageSize: 200 }),
                getMetersByProperty(selectedPropertyId),
                orgId ? getPropertyServices(orgId, selectedPropertyId).catch(() => []) : []
            ]);

            const roomList = roomsRes.items || roomsRes.data || (Array.isArray(roomsRes) ? roomsRes : []);
            const meterList = Array.isArray(metersRes) ? metersRes : (metersRes.items || []);
            const serviceList = (Array.isArray(servicesRes) ? servicesRes : []).filter(s => s.isActive);

            setRooms(roomList);
            setMeters(meterList);
            setPropertyServices(serviceList);
        } catch (err) {
            console.error('Load property data error:', err);
            setFetchError(err.message || 'Không thể nạp dữ liệu cơ sở. Vui lòng thử lại.');
        } finally {
            setLoadingData(false);
        }
    }, [selectedPropertyId]);

    useEffect(() => {
        if (selectedPropertyId) {
            loadPropertyData();
        }
    }, [selectedPropertyId, loadPropertyData]);

    // ─── Dịch vụ Tiêu chuẩn (Điện & Nước) ──────────────────────────────────────
    const standardElectricService = useMemo(() => {
        return propertyServices.find(s =>
            (s.serviceCode || '').toUpperCase() === 'ELECTRICITY' ||
            (s.serviceName || '').toLowerCase().includes('điện')
        );
    }, [propertyServices]);

    const standardWaterService = useMemo(() => {
        return propertyServices.find(s =>
            (s.serviceCode || '').toUpperCase() === 'WATER' ||
            (s.serviceName || '').toLowerCase().includes('nước')
        );
    }, [propertyServices]);

    // ─── Kết nối Phòng với các Đồng hồ tương ứng ──────────────────────────────
    const roomsWithMeters = useMemo(() => {
        return rooms.map(room => {
            const roomMeters = meters.filter(m => m.roomId === room.id && m.isActive);
            const electricMeter = roomMeters.find(m =>
                (m.meterType || '').toLowerCase().includes('electric') ||
                (m.serviceName || '').toLowerCase().includes('điện')
            );
            const waterMeter = roomMeters.find(m =>
                (m.meterType || '').toLowerCase().includes('water') ||
                (m.serviceName || '').toLowerCase().includes('nước')
            );
            const isRecorded = isRoomRecorded(roomMeters, billingPeriod);

            return {
                ...room,
                displayName: room.roomNumber || room.name || `Phòng ${room.id?.slice(0, 6)}`,
                meters: roomMeters,
                hasMeters: roomMeters.length > 0,
                electricMeter,
                waterMeter,
                hasElectric: Boolean(electricMeter),
                hasWater: Boolean(waterMeter),
                isFullyConfigured: Boolean(electricMeter && waterMeter),
                isRecorded
            };
        });
    }, [rooms, meters, billingPeriod]);

    // ─── Thống kê số lượng ────────────────────────────────────────────────────
    const unconfiguredRooms = useMemo(() => {
        return roomsWithMeters.filter(r => !r.hasMeters);
    }, [roomsWithMeters]);

    const pendingRooms = useMemo(() => {
        return roomsWithMeters.filter(r => r.hasMeters && !r.isRecorded);
    }, [roomsWithMeters]);

    const recordedRooms = useMemo(() => {
        return roomsWithMeters.filter(r => r.hasMeters && r.isRecorded);
    }, [roomsWithMeters]);

    // ─── Danh sách Phòng đã lọc theo Tab & Ô tìm kiếm ─────────────────────────
    const filteredRooms = useMemo(() => {
        return roomsWithMeters.filter(room => {
            // Lọc theo Tab
            if (activeTab === 'unconfigured' && room.hasMeters) return false;
            if (activeTab === 'pending' && (!room.hasMeters || room.isRecorded)) return false;
            if (activeTab === 'recorded' && (!room.hasMeters || !room.isRecorded)) return false;

            // Tìm kiếm
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchName = (room.displayName || '').toLowerCase().includes(term);
                const matchStatus = (room.status || '').toLowerCase().includes(term);
                const matchMeter = room.meters.some(m => (m.meterCode || '').toLowerCase().includes(term));
                if (!matchName && !matchStatus && !matchMeter) return false;
            }

            return true;
        });
    }, [roomsWithMeters, activeTab, searchTerm]);

    // Phân trang danh sách phòng
    const totalRoomsCount = filteredRooms.length;
    const totalPages = Math.max(1, Math.ceil(totalRoomsCount / pageSize));
    const paginatedRooms = useMemo(() => {
        const start = (pageIndex - 1) * pageSize;
        return filteredRooms.slice(start, start + pageSize);
    }, [filteredRooms, pageIndex, pageSize]);

    // Reset về trang 1 khi đổi bộ lọc
    useEffect(() => {
        setPageIndex(1);
    }, [activeTab, searchTerm, pageSize, selectedPropertyId]);

    // ─── THAO TÁC 1: KHỞI TẠO ĐỒNG HỒ CHO 1 PHÒNG (QUICK SETUP) ───────────────
    const openSetupModal = (room) => {
        setSetupRoom(room);
        setSetupError('');
        setSetupElectric(!room.hasElectric);
        setSetupWater(!room.hasWater);
        setInitialElectricReading('0');
        setInitialWaterReading('0');
    };

    const handleSingleRoomSetup = async (e) => {
        e.preventDefault();
        if (!setupRoom) return;
        setSetupError('');

        if (!setupElectric && !setupWater) {
            setSetupError('Vui lòng chọn ít nhất một loại đồng hồ để khởi tạo.');
            return;
        }

        const tasks = [];

        // Khởi tạo điện
        if (setupElectric && !setupRoom.hasElectric) {
            if (!standardElectricService) {
                setSetupError('Cơ sở chưa có dịch vụ Điện. Vui lòng vào Cài đặt dịch vụ để thêm trước.');
                return;
            }
            const initE = Number(initialElectricReading);
            if (isNaN(initE) || initE < 0) {
                setSetupError('Chỉ số điện ban đầu không hợp lệ.');
                return;
            }
            tasks.push(createMeter({
                roomId: setupRoom.id,
                propertyServiceId: standardElectricService.id,
                meterType: 'Electric',
                unit: standardElectricService.unit?.trim() || 'kWh',
                initialReading: initE,
                meterCode: `DH-D-${setupRoom.displayName}`
            }));
        }

        // Khởi tạo nước
        if (setupWater && !setupRoom.hasWater) {
            if (!standardWaterService) {
                setSetupError('Cơ sở chưa có dịch vụ Nước. Vui lòng vào Cài đặt dịch vụ để thêm trước.');
                return;
            }
            const initW = Number(initialWaterReading);
            if (isNaN(initW) || initW < 0) {
                setSetupError('Chỉ số nước ban đầu không hợp lệ.');
                return;
            }
            tasks.push(createMeter({
                roomId: setupRoom.id,
                propertyServiceId: standardWaterService.id,
                meterType: 'Water',
                unit: standardWaterService.unit?.trim() || 'm3',
                initialReading: initW,
                meterCode: `DH-N-${setupRoom.displayName}`
            }));
        }

        if (tasks.length === 0) {
            setSetupRoom(null);
            return;
        }

        setSavingSetup(true);
        try {
            await Promise.all(tasks);
            addLog('success', `Đã thiết lập thành công đồng hồ dịch vụ cho ${setupRoom.displayName}.`);
            setSetupRoom(null);
            await loadPropertyData();
        } catch (err) {
            setSetupError(err.message || 'Lỗi khi khởi tạo đồng hồ dịch vụ.');
        } finally {
            setSavingSetup(false);
        }
    };

    // ─── THAO TÁC 2: KHỞI TẠO ĐỒNG HỒ HÀNG LOẠT (BATCH SETUP) ─────────────────
    const openBatchSetupModal = () => {
        const targetIds = unconfiguredRooms.map(r => r.id);
        setBatchSelectedRoomIds(targetIds);
        setBatchInitialElectric('0');
        setBatchInitialWater('0');
        setIsBatchSetupOpen(true);
    };

    const handleExecuteBatchSetup = async () => {
        if (batchSelectedRoomIds.length === 0) return;
        if (!standardElectricService && !standardWaterService) {
            alert('Cơ sở chưa có cấu hình dịch vụ Điện và Nước. Hãy thêm dịch vụ trước trong Cài đặt dịch vụ.');
            return;
        }

        const initE = Number(batchInitialElectric) || 0;
        const initW = Number(batchInitialWater) || 0;

        setIsBatchProcessing(true);
        setBatchProgress({ current: 0, total: batchSelectedRoomIds.length });

        let successCount = 0;

        for (let i = 0; i < batchSelectedRoomIds.length; i++) {
            const roomId = batchSelectedRoomIds[i];
            const room = roomsWithMeters.find(r => r.id === roomId);

            try {
                const tasks = [];
                if (standardElectricService && (!room || !room.hasElectric)) {
                    tasks.push(createMeter({
                        roomId,
                        propertyServiceId: standardElectricService.id,
                        meterType: 'Electric',
                        unit: standardElectricService.unit?.trim() || 'kWh',
                        initialReading: initE,
                        meterCode: room ? `DH-D-${room.displayName}` : null
                    }));
                }
                if (standardWaterService && (!room || !room.hasWater)) {
                    tasks.push(createMeter({
                        roomId,
                        propertyServiceId: standardWaterService.id,
                        meterType: 'Water',
                        unit: standardWaterService.unit?.trim() || 'm3',
                        initialReading: initW,
                        meterCode: room ? `DH-N-${room.displayName}` : null
                    }));
                }
                if (tasks.length > 0) {
                    await Promise.allSettled(tasks);
                }
                successCount++;
            } catch (err) {
                console.warn(`Error setting up room ${roomId}:`, err);
            }
            setBatchProgress({ current: i + 1, total: batchSelectedRoomIds.length });
        }

        addLog('success', `Đã hoàn tất khởi tạo đồng hồ hàng loạt cho ${successCount} phòng.`);
        setIsBatchProcessing(false);
        setIsBatchSetupOpen(false);
        await loadPropertyData();
    };

    // ─── THAO TÁC 3: MỞ MODAL GHI SỐ ĐIỆN NƯỚC CHO PHÒNG ──────────────────────
    const openRecordModal = (room) => {
        setRecordingRoom(room);
        setRecordError('');
        setReadingNote('');

        const initialValues = {};
        room.meters.forEach(meter => {
            const currentReading = getPeriodReading(meter, billingPeriod);
            initialValues[meter.id] = currentReading ? String(currentReading.currentReading) : '';
        });
        setMeterFormValues(initialValues);
    };

    const handleSaveReadings = async (e) => {
        e.preventDefault();
        if (!recordingRoom) return;
        setRecordError('');

        // Kiểm tra dữ liệu đầu vào
        for (const meter of recordingRoom.meters) {
            const raw = meterFormValues[meter.id];
            if (raw == null || String(raw).trim() === '') {
                setRecordError(`Vui lòng nhập chỉ số mới cho đồng hồ ${meter.serviceName}.`);
                return;
            }
            const cur = Number(raw);
            if (isNaN(cur) || cur < 0) {
                setRecordError(`Chỉ số của ${meter.serviceName} phải là số không âm.`);
                return;
            }
            const prev = getPreviousReading(meter, billingPeriod);
            if (cur < prev) {
                setRecordError(`Chỉ số mới của ${meter.serviceName} (${cur}) không được nhỏ hơn số cũ (${prev} ${meter.unit}).`);
                return;
            }
        }

        setSavingReading(true);
        try {
            const tasks = recordingRoom.meters.map(meter => {
                const cur = Number(meterFormValues[meter.id]);
                return recordReading(meter.id, {
                    billingPeriod,
                    currentReading: cur,
                    note: readingNote.trim() || null
                });
            });

            await Promise.all(tasks);
            addLog('success', `Đã ghi số thành công cho ${recordingRoom.displayName} - Kỳ ${billingPeriod}.`);
            setRecordingRoom(null);
            await loadPropertyData();
        } catch (err) {
            setRecordError(err.message || 'Lỗi khi lưu chỉ số. Vui lòng thử lại.');
        } finally {
            setSavingReading(false);
        }
    };

    // ─── THAO TÁC 4: LỊCH SỬ CHỈ SỐ (PAGED READINGS API) ──────────────────────
    const fetchMeterHistory = useCallback(async (meterId, page = 1) => {
        if (!meterId) return;
        setHistoryLoading(true);
        try {
            const res = await getReadingsByMeterPaged(meterId, {
                pageIndex: page,
                pageSize: 6
            });
            if (res && Array.isArray(res.items)) {
                setHistoryReadings(res.items);
                setHistoryTotalCount(res.totalCount ?? res.items.length);
                setHistoryTotalPages(res.totalPages ?? Math.max(1, Math.ceil((res.totalCount || res.items.length) / 6)));
            } else {
                setHistoryReadings([]);
                setHistoryTotalCount(0);
                setHistoryTotalPages(1);
            }
        } catch (err) {
            console.error('Fetch meter history error:', err);
            setHistoryReadings([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    const openHistoryModal = (meter) => {
        setHistoryMeter(meter);
        setHistoryPage(1);
        fetchMeterHistory(meter.id, 1);
    };

    // ─── Log helpers ──────────────────────────────────────────────────────────
    const addLog = (type, text) => {
        setLogs(prev => [{
            id: Date.now(),
            type,
            text,
            date: new Date().toLocaleString('vi-VN'),
            read: false
        }, ...prev]);
    };
    const handleMarkRead = (id) => setLogs(prev => prev.map(l => l.id === id ? { ...l, read: true } : l));
    const handleDeleteLog = (id) => setLogs(prev => prev.filter(l => l.id !== id));
    const handleClearLogs = () => { if (window.confirm('Xóa toàn bộ nhật ký ghi số?')) setLogs([]); };

    // ─── Theme ────────────────────────────────────────────────────────────────
    const theme = isDarkMode
        ? {
            wrapper: 'text-slate-100',
            panel: 'bg-[#11111A] border-[#2A2518] text-slate-200 shadow-xl shadow-black/40',
            panelSoft: 'bg-[#161622] border-[#2A2518]/60',
            cardBg: 'bg-gradient-to-br from-[#12121B] to-[#151522] border-[#2A2518]/80 hover:border-[#D4AF37]/50 shadow-md',
            cardUnconfigured: 'bg-gradient-to-br from-[#141217] to-[#18131B] border-amber-500/30 hover:border-amber-500/60 shadow-md shadow-amber-950/10',
            cardRecorded: 'bg-gradient-to-br from-[#0F1A15] to-[#111F19] border-emerald-500/30 hover:border-emerald-500/60 shadow-md shadow-emerald-950/10',
            input: 'bg-[#0B0B12] border-[#2A2518] text-[#D4AF37] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 placeholder-slate-700',
            divider: 'border-[#2A2518]/40',
            textMuted: 'text-slate-300',
            textMutedSoft: 'text-slate-500',
            modalPanel: 'bg-[#11111A] border-[#2A2518] shadow-2xl shadow-black',
            tabActive: 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-black',
            tabIdle: 'text-slate-400 hover:text-white hover:bg-white/5 font-semibold',
            shimmerBtn: 'luxury-gold-shimmer text-black font-extrabold shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95'
        }
        : {
            wrapper: 'text-slate-900',
            panel: 'bg-white border-[#E5D4AD] text-slate-800 shadow-xl shadow-amber-500/5',
            panelSoft: 'bg-[#FAF8F5] border-[#E5D4AD]/70',
            cardBg: 'bg-white border-[#E5D4AD] hover:border-[#D4AF37] shadow-sm',
            cardUnconfigured: 'bg-amber-50/40 border-amber-300 hover:border-amber-400 shadow-sm',
            cardRecorded: 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400 shadow-sm',
            input: 'bg-[#FFF9EC] border-[#E5D4AD] text-slate-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 placeholder-slate-400',
            divider: 'border-[#E5D4AD]/60',
            textMuted: 'text-slate-700',
            textMutedSoft: 'text-slate-400',
            modalPanel: 'bg-white border-[#E5D4AD] shadow-2xl shadow-amber-900/10',
            tabActive: 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-black',
            tabIdle: 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-semibold',
            shimmerBtn: 'luxury-gold-shimmer text-black font-extrabold shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/25 hover:brightness-105 active:scale-95'
        };

    return (
        <div className={`p-8 space-y-7 font-sans ${theme.wrapper}`}>
            <style>{`
                @keyframes goldShimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .luxury-gold-shimmer {
                    background: linear-gradient(135deg, #AA7C11, #D4AF37, #FFF3CC, #D4AF37, #AA7C11);
                    background-size: 200% auto;
                    animation: goldShimmer 4s linear infinite;
                }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── HEADER CHÍNH ──────────────────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" /> GHI SỐ DỊCH VỤ & QUẢN LÝ ĐỒNG HỒ ĐIỆN NƯỚC
                        </span>
                        <h2 className="text-2xl font-black tracking-tight mt-0.5 bg-gradient-to-r from-white via-slate-200 to-[#D4AF37] bg-clip-text text-transparent">
                            Chốt Số Điện Nước Hàng Tháng Theo Phòng
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Bộ chọn Cơ sở (Property Selector) */}
                        <div className="relative w-full sm:w-56">
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                disabled={loadingProperties || loadingData}
                                className={`text-xs font-bold border rounded-xl px-3.5 py-2.5 pr-8 appearance-none focus:outline-none focus:border-[#D4AF37] w-full transition-all cursor-pointer ${
                                    isDarkMode
                                        ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37]'
                                        : 'bg-[#FFF9EC] border-[#E5D4AD] text-[#AA7C11] shadow-sm'
                                }`}
                            >
                                {properties.map(p => (
                                    <option key={p.id || p.propertyId} value={p.id || p.propertyId} className={isDarkMode ? 'bg-[#161622] text-white' : 'bg-white text-slate-900'}>
                                        {p.propertyName || p.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4AF37]" />
                        </div>

                        {/* Nút Làm mới */}
                        <button
                            type="button"
                            onClick={loadPropertyData}
                            disabled={loadingData}
                            title="Làm mới dữ liệu"
                            className={`p-2.5 rounded-xl border transition-all ${
                                isDarkMode ? 'border-[#2A2518] text-slate-300 hover:bg-slate-800' : 'border-[#E5D4AD] text-slate-600 hover:bg-stone-100'
                            }`}
                        >
                            <RefreshCw size={15} className={loadingData ? 'animate-spin text-[#D4AF37]' : ''} />
                        </button>
                    </div>
                </div>

                {/* ── 4 THẺ THỐNG KÊ NHANH ────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-2xl border transition-all ${theme.panel}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMutedSoft}`}>
                                Tổng số phòng
                            </span>
                            <Home size={15} className="text-slate-400" />
                        </div>
                        <span className="text-2xl font-black text-white">{roomsWithMeters.length}</span>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        unconfiguredRooms.length > 0
                            ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-500'
                            : theme.panel
                    }`} onClick={() => setActiveTab('unconfigured')}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                Chưa có đồng hồ
                            </span>
                            <AlertTriangle size={15} className="text-amber-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-400">{unconfiguredRooms.length}</span>
                            <span className="text-[11px] text-amber-400/80">phòng</span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${theme.panel}`} onClick={() => setActiveTab('pending')}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMutedSoft}`}>
                                Cần ghi số kỳ này
                            </span>
                            <Clock size={15} className="text-[#D4AF37]" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-[#D4AF37]">{pendingRooms.length}</span>
                            <span className="text-[11px] text-[#D4AF37]/80">phòng</span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${theme.panel}`} onClick={() => setActiveTab('recorded')}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMutedSoft}`}>
                                Đã chốt xong kỳ này
                            </span>
                            <CheckCircle2 size={15} className="text-emerald-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-400">{recordedRooms.length}</span>
                            <span className="text-[11px] text-emerald-400/80">phòng</span>
                        </div>
                    </div>
                </div>

                {/* ── BANNER THÔNG MINH: NHẮC NHỞ CÁC PHÒNG CHƯA CÓ ĐỒNG HỒ ────────── */}
                {unconfiguredRooms.length > 0 && (
                    <div className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-[#18131B] to-amber-950/20 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 md:mt-0">
                                <Wand2 size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                                    Phát hiện {unconfiguredRooms.length} phòng chưa từng thiết lập đồng hồ điện & nước
                                </h4>
                                <p className={`text-xs ${theme.textMutedSoft} mt-0.5`}>
                                    Các phòng mới này chưa thể ghi số. Bạn có thể khởi tạo nhanh đồng hồ Điện & Nước cho từng phòng hoặc thiết lập tự động hàng loạt chỉ trong 1 lần nhấn.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveTab('unconfigured')}
                                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 transition-all"
                            >
                                Xem các phòng ({unconfiguredRooms.length})
                            </button>
                            <button
                                type="button"
                                onClick={openBatchSetupModal}
                                className="px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                            >
                                <Zap size={14} strokeWidth={3} /> Thiết lập hàng loạt
                            </button>
                        </div>
                    </div>
                )}

                {/* ── THANH ĐIỀU KHIỂN & BỘ LỌC THÔNG MINH ────────────────────────── */}
                <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${theme.panel}`}>
                    {/* Các Tab lọc trạng thái */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all ${
                                activeTab === 'all' ? theme.tabActive : theme.tabIdle
                            }`}
                        >
                            Tất cả ({roomsWithMeters.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('unconfigured')}
                            className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                                activeTab === 'unconfigured'
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : unconfiguredRooms.length > 0
                                        ? 'text-amber-400 hover:bg-amber-500/10'
                                        : theme.tabIdle
                            }`}
                        >
                            Chưa có ĐH ({unconfiguredRooms.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('pending')}
                            className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all ${
                                activeTab === 'pending' ? theme.tabActive : theme.tabIdle
                            }`}
                        >
                            Cần ghi số ({pendingRooms.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('recorded')}
                            className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all ${
                                activeTab === 'recorded' ? theme.tabActive : theme.tabIdle
                            }`}
                        >
                            Đã chốt ({recordedRooms.length})
                        </button>
                    </div>

                    {/* Bộ lọc tìm kiếm & Kỳ chốt số */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        {/* Chọn Kỳ ghi nhận */}
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${theme.textMutedSoft} flex items-center gap-1`}>
                                <CalendarDays className="w-3.5 h-3.5 text-[#D4AF37]" /> Kỳ chốt:
                            </span>
                            <input
                                type="month"
                                value={billingPeriod}
                                onChange={(e) => setBillingPeriod(e.target.value)}
                                className={`text-xs font-bold border rounded-xl px-2.5 py-1.5 focus:outline-none transition-all ${theme.input}`}
                            />
                        </div>

                        {/* Ô tìm kiếm phòng */}
                        <div className="relative w-full sm:w-56">
                            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMutedSoft}`} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm số phòng, tên cư dân..."
                                className={`w-full text-xs font-medium pl-8 pr-3 py-1.5 rounded-xl border focus:outline-none transition-all ${theme.input}`}
                            />
                        </div>
                    </div>
                </div>

                {/* THÔNG BÁO LỖI NẾU CÓ */}
                {fetchError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle size={16} /> {fetchError}
                    </div>
                )}

                {/* ── DANH SÁCH THẺ PHÒNG THÔNG MINH (ROOM CARDS GRID) ────────────── */}
                {loadingData ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                        <span className={`text-xs ${theme.textMutedSoft}`}>Đang nạp danh sách phòng và số liệu đồng hồ...</span>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className={`p-16 rounded-2xl border text-center ${theme.panel}`}>
                        <Home className="w-10 h-10 opacity-30 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-300">Không tìm thấy phòng nào phù hợp.</p>
                        <p className={`text-xs ${theme.textMutedSoft} mt-1`}>
                            {activeTab === 'unconfigured'
                                ? 'Tất cả các phòng trong cơ sở này đều đã được thiết lập đồng hồ.'
                                : 'Thử đổi từ khóa tìm kiếm hoặc chuyển sang tab lọc khác.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {paginatedRooms.map((room) => {
                            const isUnconfigured = !room.hasMeters;
                            const isRecorded = room.isRecorded;

                            return (
                                <div
                                    key={room.id}
                                    className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                                        isUnconfigured
                                            ? theme.cardUnconfigured
                                            : isRecorded
                                                ? theme.cardRecorded
                                                : theme.cardBg
                                    }`}
                                >
                                    {/* Header Thẻ Phòng */}
                                    <div>
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`p-2.5 rounded-xl ${
                                                    isUnconfigured
                                                        ? 'bg-amber-500/20 text-amber-400'
                                                        : isRecorded
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-[#D4AF37]/15 text-[#D4AF37]'
                                                }`}>
                                                    <Home size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-base text-white">
                                                        {room.displayName}
                                                    </h3>
                                                    <span className={`text-[10px] block ${theme.textMutedSoft}`}>
                                                        {room.status ? `Trạng thái: ${room.status}` : 'Đang thuê'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Huy hiệu trạng thái */}
                                            {isUnconfigured ? (
                                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                                    <AlertTriangle size={11} /> Chưa có ĐH
                                                </span>
                                            ) : isRecorded ? (
                                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                                    <CheckCircle2 size={11} /> Đã chốt đủ
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
                                                    <Clock size={11} /> Cần ghi số
                                                </span>
                                            )}
                                        </div>

                                        {/* TH 1: PHÒNG CHƯA TỪNG CÓ ĐỒNG HỒ (THIẾT LẬP NHANH DỄ DÀNG) */}
                                        {isUnconfigured ? (
                                            <div className="my-3 p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2.5">
                                                <p className="text-xs font-semibold text-amber-200">
                                                    Phòng này chưa từng thiết lập đồng hồ dịch vụ
                                                </p>
                                                <p className={`text-[11px] ${theme.textMutedSoft}`}>
                                                    Bấm để khởi tạo nhanh đồng hồ Điện & Nước cho phòng này:
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => openSetupModal(room)}
                                                    className="w-full py-2 px-3 text-xs font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:brightness-110 text-black shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 transition-all"
                                                >
                                                    <Wand2 size={13} strokeWidth={2.5} /> Thiết lập nhanh (Điện + Nước)
                                                </button>
                                            </div>
                                        ) : (
                                            /* TH 2: PHÒNG ĐÃ CÓ ĐỒNG HỒ (HIỂN THỊ ĐIỆN & NƯỚC) */
                                            <div className="space-y-2.5 my-3">
                                                {room.meters.map((meter) => {
                                                    const isElectric = (meter.meterType || '').toLowerCase().includes('electric') || meter.serviceName.toLowerCase().includes('điện');
                                                    const isWater = (meter.meterType || '').toLowerCase().includes('water') || meter.serviceName.toLowerCase().includes('nước');

                                                    const periodReading = getPeriodReading(meter, billingPeriod);
                                                    const prevVal = getPreviousReading(meter, billingPeriod);
                                                    const curVal = periodReading ? Number(periodReading.currentReading) : null;
                                                    const consumption = periodReading ? Number(periodReading.consumption || 0) : null;
                                                    const amount = periodReading ? Number(periodReading.amount || 0) : null;

                                                    return (
                                                        <div
                                                            key={meter.id}
                                                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                                                periodReading
                                                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                                                    : 'bg-[#0B0B12]/60 border-[#2A2518]/60'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1.5 rounded-lg ${
                                                                    isElectric ? 'bg-amber-500/15 text-[#D4AF37]' : isWater ? 'bg-cyan-500/15 text-cyan-400' : 'bg-purple-500/15 text-purple-400'
                                                                }`}>
                                                                    {isElectric ? <Zap size={14} /> : isWater ? <Droplet size={14} /> : <Sparkles size={14} />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold flex items-center gap-1 text-slate-200">
                                                                        {meter.serviceName}
                                                                        <span className={`text-[10px] font-mono ${theme.textMutedSoft}`}>
                                                                            ({meter.unit})
                                                                        </span>
                                                                    </div>
                                                                    <span className={`text-[10px] font-mono ${theme.textMutedSoft}`}>
                                                                        Số cũ: <strong>{prevVal.toLocaleString('vi-VN')}</strong>
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Chỉ số kỳ này */}
                                                            <div className="text-right">
                                                                {periodReading ? (
                                                                    <div>
                                                                        <span className="font-mono font-bold text-emerald-400 block">
                                                                            {curVal?.toLocaleString('vi-VN')} {meter.unit}
                                                                        </span>
                                                                        <span className={`text-[10px] ${theme.textMutedSoft}`}>
                                                                            +{consumption} · {amount?.toLocaleString('vi-VN')}đ
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[11px] text-amber-400/90 italic font-semibold">
                                                                        Chưa ghi
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Nút xem lịch sử của đồng hồ */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); openHistoryModal(meter); }}
                                                                title="Xem lịch sử ghi số"
                                                                className="ml-2 p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#D4AF37] transition-colors"
                                                            >
                                                                <History size={13} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}

                                                {/* Cảnh báo nếu phòng mới chỉ có 1 đồng hồ (vd thiếu nước hoặc thiếu điện) */}
                                                {!room.isFullyConfigured && (
                                                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                                        <span>⚠️ Phòng này đang thiếu {!room.hasElectric ? 'ĐH Điện' : 'ĐH Nước'}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => openSetupModal(room)}
                                                            className="underline font-bold text-[#D4AF37]"
                                                        >
                                                            Bổ sung ngay
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Thao tác trên Thẻ Phòng */}
                                    <div className="pt-3 border-t border-[#2A2518]/40 flex items-center justify-between gap-2">
                                        {!isUnconfigured && (
                                            <button
                                                type="button"
                                                onClick={() => openSetupModal(room)}
                                                className={`text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1`}
                                                title="Thêm hoặc cấu hình lại đồng hồ"
                                            >
                                                <Settings size={12} /> Cài đặt ĐH
                                            </button>
                                        )}

                                        {isUnconfigured ? (
                                            <button
                                                type="button"
                                                onClick={() => openSetupModal(room)}
                                                className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${theme.shimmerBtn}`}
                                            >
                                                <Plus size={14} /> Thêm đồng hồ phòng này
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openRecordModal(room)}
                                                className={`ml-auto px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                                                    isRecorded
                                                        ? 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                                        : theme.shimmerBtn
                                                }`}
                                            >
                                                {isRecorded ? <Check size={13} /> : <Zap size={13} />}
                                                {isRecorded ? 'Sửa số đã chốt' : 'Ghi số kỳ này'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── CHÂN TRANG PHÂN TRANG (PAGINATION) ──────────────────────────── */}
                {totalRoomsCount > 0 && (
                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border ${theme.panel}`}>
                        <div className={`text-xs ${theme.textMutedSoft} flex items-center gap-3`}>
                            <span>
                                Hiển thị <strong className="text-[#D4AF37]">{(pageIndex - 1) * pageSize + 1}</strong> - <strong className="text-[#D4AF37]">{Math.min(pageIndex * pageSize, totalRoomsCount)}</strong> trong tổng số <strong className="text-[#D4AF37]">{totalRoomsCount}</strong> phòng
                            </span>
                            <div className="flex items-center gap-1.5 pl-2 border-l border-[#2A2518]/30">
                                <span className="text-[11px]">Số phòng/trang:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPageIndex(1);
                                    }}
                                    className={`text-xs font-bold border rounded-lg px-2 py-1 outline-none cursor-pointer ${
                                        isDarkMode ? 'bg-[#161622] border-[#2A2518] text-[#D4AF37]' : 'bg-white border-[#E5D4AD] text-[#AA7C11]'
                                    }`}
                                >
                                    <option value={12}>12</option>
                                    <option value={24}>24</option>
                                    <option value={48}>48</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                                disabled={pageIndex <= 1}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    pageIndex <= 1
                                        ? 'opacity-40 cursor-not-allowed border-transparent text-gray-500'
                                        : isDarkMode
                                            ? 'border-[#2A2518] hover:bg-white/5 text-gray-300'
                                            : 'border-[#E5D4AD] hover:bg-amber-50 text-slate-700'
                                }`}
                            >
                                Trước
                            </button>

                            {(() => {
                                const pages = [];
                                const maxVisible = 5;
                                let startPage = Math.max(1, pageIndex - Math.floor(maxVisible / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                                if (endPage - startPage + 1 < maxVisible) {
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }
                                for (let p = startPage; p <= endPage; p++) {
                                    pages.push(
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPageIndex(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                pageIndex === p
                                                    ? theme.tabActive
                                                    : isDarkMode
                                                        ? 'hover:bg-white/5 text-gray-400'
                                                        : 'hover:bg-amber-50 text-slate-600'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                }
                                return pages;
                            })()}

                            <button
                                type="button"
                                onClick={() => setPageIndex(p => Math.min(totalPages, p + 1))}
                                disabled={pageIndex >= totalPages}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    pageIndex >= totalPages
                                        ? 'opacity-40 cursor-not-allowed border-transparent text-gray-500'
                                        : isDarkMode
                                            ? 'border-[#2A2518] hover:bg-white/5 text-gray-300'
                                            : 'border-[#E5D4AD] hover:bg-amber-50 text-slate-700'
                                }`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}

                {/* ── MODAL 1: THIẾT LẬP NHANH ĐỒNG HỒ CHO 1 PHÒNG ────────────────── */}
                {setupRoom && (
                    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${theme.modalPanel}`}>
                            {/* Header */}
                            <div className="px-6 py-4 flex justify-between items-center border-b border-[#2A2518]/50">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Wand2 size={16} className="text-[#D4AF37]" />
                                        Thiết Lập Đồng Hồ: {setupRoom.displayName}
                                    </h3>
                                    <p className={`text-xs ${theme.textMutedSoft} mt-0.5`}>
                                        Khởi tạo đồng hồ đo điện, nước để bắt đầu ghi số
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSetupRoom(null)}
                                    disabled={savingSetup}
                                    className="p-1.5 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSingleRoomSetup} className="p-6 space-y-4">
                                {setupError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                                        {setupError}
                                    </div>
                                )}

                                <div className="space-y-3.5">
                                    {/* Tùy chọn Đồng hồ Điện */}
                                    <div className={`p-4 rounded-xl border transition-all ${
                                        setupElectric ? 'bg-[#151522] border-[#D4AF37]/50' : 'bg-transparent border-[#2A2518]/50 opacity-60'
                                    }`}>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={setupElectric}
                                                    disabled={setupRoom.hasElectric || savingSetup}
                                                    onChange={(e) => setSetupElectric(e.target.checked)}
                                                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-0 cursor-pointer"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                                        <Zap size={14} className="text-[#D4AF37]" /> Đồng hồ Điện
                                                        {setupRoom.hasElectric && <span className="text-[10px] text-emerald-400">(Đã có)</span>}
                                                    </span>
                                                    <span className={`text-[11px] block ${theme.textMutedSoft}`}>
                                                        Dịch vụ: {standardElectricService?.serviceName || 'Tiền điện'} ({standardElectricService?.unit || 'kWh'})
                                                    </span>
                                                </div>
                                            </div>
                                        </label>

                                        {setupElectric && !setupRoom.hasElectric && (
                                            <div className="mt-3 pt-3 border-t border-[#2A2518]/40">
                                                <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block mb-1`}>
                                                    Chỉ số điện ban đầu (kWh) *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.001"
                                                    value={initialElectricReading}
                                                    onChange={(e) => setInitialElectricReading(e.target.value)}
                                                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-all ${theme.input}`}
                                                    placeholder="VD: 0 hoặc số trên công tơ thực tế"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Tùy chọn Đồng hồ Nước */}
                                    <div className={`p-4 rounded-xl border transition-all ${
                                        setupWater ? 'bg-[#151522] border-cyan-500/50' : 'bg-transparent border-[#2A2518]/50 opacity-60'
                                    }`}>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={setupWater}
                                                    disabled={setupRoom.hasWater || savingSetup}
                                                    onChange={(e) => setSetupWater(e.target.checked)}
                                                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                                        <Droplet size={14} className="text-cyan-400" /> Đồng hồ Nước
                                                        {setupRoom.hasWater && <span className="text-[10px] text-emerald-400">(Đã có)</span>}
                                                    </span>
                                                    <span className={`text-[11px] block ${theme.textMutedSoft}`}>
                                                        Dịch vụ: {standardWaterService?.serviceName || 'Tiền nước'} ({standardWaterService?.unit || 'm3'})
                                                    </span>
                                                </div>
                                            </div>
                                        </label>

                                        {setupWater && !setupRoom.hasWater && (
                                            <div className="mt-3 pt-3 border-t border-[#2A2518]/40">
                                                <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block mb-1`}>
                                                    Chỉ số nước ban đầu (m³) *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.001"
                                                    value={initialWaterReading}
                                                    onChange={(e) => setInitialWaterReading(e.target.value)}
                                                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-all ${theme.input}`}
                                                    placeholder="VD: 0 hoặc số trên công tơ thực tế"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2.5 pt-3 border-t border-[#2A2518]/40">
                                    <button
                                        type="button"
                                        onClick={() => setSetupRoom(null)}
                                        disabled={savingSetup}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#2A2518] hover:bg-white/5 text-slate-300"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingSetup}
                                        className={`px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 ${theme.shimmerBtn}`}
                                    >
                                        {savingSetup ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        {savingSetup ? 'Đang tạo...' : 'Xác nhận tạo đồng hồ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── MODAL 2: THIẾT LẬP HÀNG LOẠT (BATCH SETUP UNCONFIGURED ROOMS) ── */}
                {isBatchSetupOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`border w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl ${theme.modalPanel}`}>
                            {/* Header */}
                            <div className="px-6 py-4 flex justify-between items-center border-b border-[#2A2518]/50">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Wand2 size={16} className="text-[#D4AF37]" />
                                        Khởi Tạo Đồng Hồ Hàng Loạt
                                    </h3>
                                    <p className={`text-xs ${theme.textMutedSoft} mt-0.5`}>
                                        Thiết lập đồng hồ Điện (kWh) và Nước (m³) cùng lúc cho nhiều phòng
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !isBatchProcessing && setIsBatchSetupOpen(false)}
                                    disabled={isBatchProcessing}
                                    className="p-1.5 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={`text-xs font-bold ${theme.textMutedSoft}`}>
                                            Chọn các phòng cần khởi tạo đồng hồ:
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (batchSelectedRoomIds.length === unconfiguredRooms.length) {
                                                    setBatchSelectedRoomIds([]);
                                                } else {
                                                    setBatchSelectedRoomIds(unconfiguredRooms.map(r => r.id));
                                                }
                                            }}
                                            className="text-xs text-[#D4AF37] font-bold hover:underline"
                                        >
                                            {batchSelectedRoomIds.length === unconfiguredRooms.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                        </button>
                                    </div>

                                    {/* Danh sách phòng dạng tag checkbox */}
                                    <div className={`p-3 rounded-xl border max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 ${theme.panelSoft}`}>
                                        {unconfiguredRooms.map(room => {
                                            const isSelected = batchSelectedRoomIds.includes(room.id);
                                            return (
                                                <button
                                                    key={room.id}
                                                    type="button"
                                                    disabled={isBatchProcessing}
                                                    onClick={() => {
                                                        setBatchSelectedRoomIds(prev =>
                                                            isSelected ? prev.filter(id => id !== room.id) : [...prev, room.id]
                                                        );
                                                    }}
                                                    className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all text-left ${
                                                        isSelected
                                                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                                                            : 'bg-transparent border-[#2A2518] text-slate-400 hover:bg-white/5'
                                                    }`}
                                                >
                                                    {isSelected ? <CheckSquare size={13} className="text-[#D4AF37]" /> : <Square size={13} />}
                                                    <span className="truncate">{room.displayName}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Nhập số ban đầu mặc định */}
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block mb-1`}>
                                            Chỉ số Điện ban đầu (kWh)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={batchInitialElectric}
                                            disabled={isBatchProcessing}
                                            onChange={(e) => setBatchInitialElectric(e.target.value)}
                                            className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-all ${theme.input}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block mb-1`}>
                                            Chỉ số Nước ban đầu (m³)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={batchInitialWater}
                                            disabled={isBatchProcessing}
                                            onChange={(e) => setBatchInitialWater(e.target.value)}
                                            className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-all ${theme.input}`}
                                        />
                                    </div>
                                </div>

                                {isBatchProcessing && (
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                                        <div className="flex justify-between text-xs text-amber-300 font-bold">
                                            <span>Đang tạo đồng hồ...</span>
                                            <span>{batchProgress.current} / {batchProgress.total} phòng</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-500 to-[#D4AF37] transition-all duration-300"
                                                style={{ width: `${(batchProgress.current / Math.max(1, batchProgress.total)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2.5 pt-3 border-t border-[#2A2518]/40">
                                    <button
                                        type="button"
                                        onClick={() => setIsBatchSetupOpen(false)}
                                        disabled={isBatchProcessing}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#2A2518] hover:bg-white/5 text-slate-300"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExecuteBatchSetup}
                                        disabled={isBatchProcessing || batchSelectedRoomIds.length === 0}
                                        className={`px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 ${theme.shimmerBtn} disabled:opacity-50`}
                                    >
                                        {isBatchProcessing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                        {isBatchProcessing ? 'Đang khởi tạo...' : `Khởi tạo cho ${batchSelectedRoomIds.length} phòng`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MODAL 3: GHI SỐ ĐIỆN NƯỚC CHO PHÒNG (RECORD READINGS) ───────── */}
                {recordingRoom && (
                    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${theme.modalPanel}`}>
                            {/* Header */}
                            <div className="px-6 py-4 flex justify-between items-center border-b border-[#2A2518]/50">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Zap size={16} className="text-[#D4AF37]" />
                                        Ghi số dịch vụ: {recordingRoom.displayName}
                                    </h3>
                                    <p className={`text-xs ${theme.textMutedSoft} mt-0.5`}>
                                        Kỳ ghi nhận: <strong className="text-[#D4AF37] font-mono">{billingPeriod}</strong>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRecordingRoom(null)}
                                    disabled={savingReading}
                                    className="p-1.5 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSaveReadings} className="p-6 space-y-4">
                                {recordError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                                        {recordError}
                                    </div>
                                )}

                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                    {recordingRoom.meters.map(meter => {
                                        const isElectric = (meter.meterType || '').toLowerCase().includes('electric') || meter.serviceName.toLowerCase().includes('điện');
                                        const prevVal = getPreviousReading(meter, billingPeriod);
                                        const curVal = Number(meterFormValues[meter.id] || 0);
                                        const consumption = Math.max(0, curVal - prevVal);

                                        return (
                                            <div key={meter.id} className={`p-4 rounded-xl border ${theme.panelSoft} space-y-3`}>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                                        {isElectric ? <Zap size={14} className="text-[#D4AF37]" /> : <Droplet size={14} className="text-cyan-400" />}
                                                        {meter.serviceName}
                                                        <span className={`text-[10px] font-mono ${theme.textMutedSoft}`}>
                                                            ({meter.unit})
                                                        </span>
                                                    </span>
                                                    {meter.meterCode && (
                                                        <span className={`text-[10px] font-mono ${theme.textMutedSoft}`}>
                                                            #{meter.meterCode}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3.5">
                                                    <div>
                                                        <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block mb-1`}>
                                                            Số cũ ({meter.unit})
                                                        </label>
                                                        <input
                                                            type="number"
                                                            disabled
                                                            value={prevVal}
                                                            className={`w-full border rounded-xl px-3 py-2 text-xs font-mono opacity-50 cursor-not-allowed ${theme.input}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] block mb-1">
                                                            Số mới ({meter.unit}) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min={prevVal}
                                                            step="0.001"
                                                            value={meterFormValues[meter.id] ?? ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setMeterFormValues(prev => ({ ...prev, [meter.id]: val }));
                                                                setRecordError('');
                                                            }}
                                                            placeholder="Nhập chỉ số..."
                                                            className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-all ${theme.input}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center text-xs pt-1">
                                                    <span className={theme.textMutedSoft}>Tiêu thụ tính toán:</span>
                                                    <span className="font-mono font-bold text-emerald-400">
                                                        +{consumption.toLocaleString('vi-VN')} {meter.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Ghi chú */}
                                    <div>
                                        <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMutedSoft} block mb-1`}>
                                            Ghi chú chốt số (tuỳ chọn)
                                        </label>
                                        <input
                                            type="text"
                                            value={readingNote}
                                            onChange={(e) => setReadingNote(e.target.value)}
                                            placeholder="VD: Chốt định kỳ ngày 25..."
                                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${theme.input}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2.5 pt-3 border-t border-[#2A2518]/40">
                                    <button
                                        type="button"
                                        onClick={() => setRecordingRoom(null)}
                                        disabled={savingReading}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#2A2518] hover:bg-white/5 text-slate-300"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingReading}
                                        className={`px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 ${theme.shimmerBtn}`}
                                    >
                                        {savingReading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        {savingReading ? 'Đang lưu...' : 'Xác nhận chốt số'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── MODAL 4: LỊCH SỬ CHỈ SỐ THEO ĐỒNG HỒ (PAGED READINGS API) ────── */}
                {historyMeter && (
                    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl ${theme.modalPanel}`}>
                            {/* Header */}
                            <div className="px-6 py-4 flex justify-between items-center border-b border-[#2A2518]/50">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <History size={16} className="text-[#D4AF37]" />
                                        Lịch Sử Chỉ Số: {historyMeter.serviceName}
                                    </h3>
                                    <p className={`text-xs ${theme.textMutedSoft} mt-0.5`}>
                                        Mã đồng hồ: <span className="font-mono text-[#D4AF37]">#{historyMeter.meterCode || 'N/A'}</span> · Đơn vị: {historyMeter.unit}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setHistoryMeter(null)}
                                    className="p-1.5 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Table */}
                            <div className="p-6 space-y-4">
                                <div className={`border rounded-xl overflow-hidden ${theme.panelSoft}`}>
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className={`border-b border-[#2A2518]/40 ${theme.textMutedSoft} font-bold uppercase tracking-wider`}>
                                                <th className="p-3">Kỳ ghi</th>
                                                <th className="p-3">Ngày ghi</th>
                                                <th className="p-3 text-right">Số cũ</th>
                                                <th className="p-3 text-right">Số mới</th>
                                                <th className="p-3 text-right">Tiêu thụ</th>
                                                <th className="p-3 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2A2518]/40">
                                            {historyLoading ? (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center">
                                                        <Loader2 size={20} className="animate-spin text-[#D4AF37] mx-auto mb-1" />
                                                        <span className={`text-xs ${theme.textMutedSoft}`}>Đang nạp lịch sử chỉ số...</span>
                                                    </td>
                                                </tr>
                                            ) : historyReadings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className={`p-8 text-center italic ${theme.textMutedSoft}`}>
                                                        Chưa có bản ghi lịch sử chỉ số nào cho đồng hồ này.
                                                    </td>
                                                </tr>
                                            ) : (
                                                historyReadings.map(r => (
                                                    <tr key={r.id} className="hover:bg-white/[0.02]">
                                                        <td className="p-3 font-mono font-bold text-[#D4AF37]">{r.billingPeriod}</td>
                                                        <td className={`p-3 ${theme.textMutedSoft}`}>
                                                            {r.readingDate ? new Date(r.readingDate).toLocaleDateString('vi-VN') : '--'}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-slate-400">
                                                            {Number(r.previousReading).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-white">
                                                            {Number(r.currentReading).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                                                            +{Number(r.consumption).toLocaleString('vi-VN')} {historyMeter.unit}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-black text-[#D4AF37]">
                                                            {Number(r.amount).toLocaleString('vi-VN')}đ
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {historyTotalCount > 0 && (
                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <span className={theme.textMutedSoft}>
                                            Tổng cộng: <strong className="text-[#D4AF37]">{historyTotalCount}</strong> kỳ đã ghi
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const prevP = Math.max(1, historyPage - 1);
                                                    setHistoryPage(prevP);
                                                    fetchMeterHistory(historyMeter.id, prevP);
                                                }}
                                                disabled={historyPage <= 1 || historyLoading}
                                                className="px-2.5 py-1 rounded-lg border border-[#2A2518] hover:bg-white/5 disabled:opacity-40"
                                            >
                                                Trước
                                            </button>
                                            <span className="font-mono px-2 text-[#D4AF37]">
                                                {historyPage} / {historyTotalPages}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nextP = Math.min(historyTotalPages, historyPage + 1);
                                                    setHistoryPage(nextP);
                                                    fetchMeterHistory(historyMeter.id, nextP);
                                                }}
                                                disabled={historyPage >= historyTotalPages || historyLoading}
                                                className="px-2.5 py-1 rounded-lg border border-[#2A2518] hover:bg-white/5 disabled:opacity-40"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RoomServiceInput;
