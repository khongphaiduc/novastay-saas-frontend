import { useEffect, useState } from 'react';
import { getContractOccupants, getCoResidentCandidates, setContractCoResidents } from '../api/contractApi';

export default function ContractOccupantsPanel({ contractId, active, onChanged, isDarkMode = true }) {
    const [occupancy, setOccupancy] = useState(null);
    const [selected, setSelected] = useState([]);
    const [editing, setEditing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [candidates, setCandidates] = useState({ items: [], totalPages: 0 });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let current = true;
        getContractOccupants(contractId).then(data => {
            if (!current) return;
            setOccupancy(data);
            setSelected(data.occupants.filter(person => !person.isRepresentative));
        }).catch(e => { if (current) setError(e.message); });
        return () => { current = false; };
    }, [contractId, version]);

    useEffect(() => {
        if (!editing) return;
        let current = true;
        const timer = setTimeout(() => {
            getCoResidentCandidates(contractId, { search, page }).then(data => {
                if (current) setCandidates(data);
            }).catch(e => { if (current) setError(e.message); });
        }, 250);
        return () => { current = false; clearTimeout(timer); };
    }, [contractId, search, page, editing, version]);

    async function save() {
        if (saving) return;
        setSaving(true); setError('');
        try {
            const updated = await setContractCoResidents(contractId, selected.map(person => person.residentId));
            setOccupancy(updated); setSelected(updated.occupants.filter(person => !person.isRepresentative));
            setEditing(false); setVersion(value => value + 1);
            onChanged?.();
        } catch (e) { setError(e.message); }
        finally { setSaving(false); }
    }

    const representative = occupancy?.occupants.find(person => person.isRepresentative);
    const displayed = editing ? selected : occupancy?.occupants.filter(person => !person.isRepresentative) ?? [];
    const capacity = occupancy?.maxOccupants ?? 1;
    const muted = isDarkMode ? 'text-gray-400' : 'text-slate-600';
    return (
        <section className={`rounded-2xl border border-amber-500/25 p-4 space-y-3 ${isDarkMode ? 'bg-black/10 text-slate-100' : 'bg-amber-50/30 text-slate-900'}`} aria-label="Người trong phòng">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-bold">Người trong phòng {occupancy && `(${displayed.length + 1}/${capacity})`}</h4>
                {active && occupancy && !editing && <button type="button" className="min-h-11 rounded-lg border border-amber-500/40 px-3 text-sm text-amber-500"
                    onClick={() => { setEditing(true); setError(''); }}>Quản lý người ở ghép</button>}
            </div>
            <p className={`text-xs ${muted}`}>Mỗi phòng có một người đại diện thanh toán. Thêm người ở ghép không nhân đôi tiền phòng hoặc tạo thêm hóa đơn.</p>
            {error && <p role="alert" className="text-sm text-rose-400 break-words">{error}</p>}
            {!occupancy && !error && <p role="status" className="text-sm">Đang tải người trong phòng…</p>}
            {representative && <p className="rounded-lg border border-amber-500/20 p-3 text-sm break-words">
                <strong>{representative.fullName}</strong> · Đại diện thanh toán
            </p>}
            <ul className="space-y-2">
                {displayed.map(person => <li key={person.residentId} className="flex items-center justify-between gap-3 rounded-lg border border-gray-500/20 p-3 text-sm">
                    <span className="min-w-0 break-words">{person.fullName}<span className={`block text-xs ${muted}`}>{person.phone} · Ở cùng</span></span>
                    {editing && <button type="button" disabled={saving} aria-label={`Bỏ ${person.fullName} khỏi danh sách ở ghép`}
                        className="min-h-11 shrink-0 px-2 text-rose-400" onClick={() => setSelected(current => current.filter(x => x.residentId !== person.residentId))}>Bỏ chọn</button>}
                </li>)}
            </ul>
            {editing && <div className="space-y-3">
                <label className="block text-sm">Tìm cư dân chưa được xếp phòng
                    <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="mt-2 min-h-11 w-full rounded-lg border border-gray-500/30 bg-transparent px-3 text-base" placeholder="Tên hoặc số điện thoại" />
                </label>
                <p className={`text-xs ${muted}`}>Còn {Math.max(0, capacity - selected.length - 1)} chỗ. Muốn thêm người, hãy tăng sức chứa phòng trước.</p>
                <ul className="max-h-60 overflow-y-auto space-y-2">
                    {(candidates.items ?? []).filter(person => !selected.some(x => x.residentId === person.residentId)).map(person => <li key={person.residentId}
                        className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 break-words">{person.fullName}<span className={`block text-xs ${muted}`}>{person.phone}</span></span>
                        <button type="button" disabled={saving || selected.length + 1 >= capacity} className="min-h-11 shrink-0 rounded-lg border border-gray-500/30 px-3 disabled:opacity-40"
                            onClick={() => setSelected(current => current.length + 1 >= capacity || current.some(x => x.residentId === person.residentId)
                                ? current : [...current, person])}>Thêm</button>
                    </li>)}
                </ul>
                {candidates.items?.length === 0 && <p className={`text-sm ${muted}`}>Không có cư dân phù hợp chưa được xếp phòng.</p>}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <button type="button" disabled={page <= 1 || saving} className="min-h-11 px-2 disabled:opacity-40" onClick={() => setPage(value => value - 1)}>Trước</button>
                    <span>Trang {page}/{Math.max(1, candidates.totalPages ?? 1)}</span>
                    <button type="button" disabled={page >= (candidates.totalPages ?? 1) || saving} className="min-h-11 px-2 disabled:opacity-40" onClick={() => setPage(value => value + 1)}>Sau</button>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button type="button" disabled={saving} className="min-h-11 rounded-lg bg-amber-400 px-4 font-bold text-black disabled:opacity-50" onClick={save}>{saving ? 'Đang lưu…' : 'Lưu người ở ghép'}</button>
                    <button type="button" disabled={saving} className="min-h-11 px-4" onClick={() => { setEditing(false); setSelected(occupancy.occupants.filter(x => !x.isRepresentative)); setError(''); }}>Hủy</button>
                </div>
            </div>}
        </section>
    );
}
