import { useState, useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import {
    Plus, X, Pencil, Trash2, Clock, Users, Sun, Moon,
    Sunset, ChevronLeft, ChevronRight, Search, CheckCircle2,
    AlertCircle, Save, Calendar, Building2, Timer,
    MoreVertical, UserCheck, Shield
} from 'lucide-react';

/* ── Helpers ─────────────────────────────────────────────── */
const pad   = (n) => String(n).padStart(2, '0');
const fmtTime = (t) => t ?? '—';

const shiftColors = [
    { name: 'Biru',   value: '#2d6a9f', bg: '#BFDDF0' },
    { name: 'Hijau',  value: '#16a34a', bg: '#DCFCE7' },
    { name: 'Ungu',   value: '#7c3aed', bg: '#ede9fe' },
    { name: 'Oranye', value: '#ea580c', bg: '#ffedd5' },
    { name: 'Merah',  value: '#dc2626', bg: '#fee2e2' },
    { name: 'Pink',   value: '#db2777', bg: '#fce7f3' },
];

const shiftIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('pagi') || n.includes('morning') || n.includes('day'))
        return <Sun size={16} className="text-amber-500"/>;
    if (n.includes('malam') || n.includes('night'))
        return <Moon size={16} className="text-indigo-500"/>;
    if (n.includes('sore') || n.includes('evening') || n.includes('swing'))
        return <Sunset size={16} className="text-orange-400"/>;
    return <Clock size={16} className="text-blue-500"/>;
};

const daysId = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const daysEn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function calcDuration(start, end) {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}j ${m > 0 ? m + 'm' : ''}`.trim();
}

/* ── Status badge ─────────────────────────────────────────── */
function Badge({ label, color = '#64748b', bg = '#f8fafc' }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: bg, color }}>
            {label}
        </span>
    );
}

/* ── Shift Card ───────────────────────────────────────────── */
function ShiftCard({ shift, onEdit, onDelete, onAssign }) {
    const colorCfg = shiftColors.find(c => c.value === shift.color) ?? shiftColors[0];
    const duration = calcDuration(shift.start_time, shift.end_time);
    const activeDays = shift.work_days ?? [1,2,3,4,5];

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Color bar */}
            <div className="h-1.5 w-full" style={{ background: shift.color ?? '#2d6a9f' }}/>

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: colorCfg.bg }}>
                            {shiftIcon(shift.name)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight">{shift.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{shift.description ?? 'Tidak ada deskripsi'}</p>
                        </div>
                    </div>
                    {/* Actions menu */}
                    <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => onEdit(shift)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition">
                            <Pencil size={13}/>
                        </button>
                        <button onClick={() => onDelete(shift)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                            <Trash2 size={13}/>
                        </button>
                    </div>
                </div>

                {/* Time info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Masuk</p>
                        <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Sora',sans-serif" }}>
                            {fmtTime(shift.start_time)}
                        </p>
                    </div>
                    <div className="text-slate-300 text-xs font-medium">→</div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Keluar</p>
                        <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Sora',sans-serif" }}>
                            {fmtTime(shift.end_time)}
                        </p>
                    </div>
                </div>

                {/* Duration + grace */}
                <div className="flex gap-2 mb-4">
                    {duration && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                            <Timer size={11}/> {duration}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: '#fffbeb', color: '#d97706' }}>
                        <Shield size={11}/> Toleransi {shift.grace_period ?? 15}m
                    </span>
                </div>

                {/* Work days */}
                <div className="flex gap-1 mb-4">
                    {daysId.map((d, i) => {
                        const active = activeDays.includes(i);
                        return (
                            <div key={i}
                                className="flex-1 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition"
                                style={{
                                    background: active ? (shift.color ?? '#2d6a9f') : '#f1f5f9',
                                    color: active ? 'white' : '#94a3b8',
                                }}>
                                {d}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users size={12}/>
                        <span><strong className="text-slate-700">{shift.employee_count ?? 0}</strong> karyawan</span>
                    </span>
                    <button onClick={() => onAssign(shift)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:brightness-90"
                        style={{ background: colorCfg.bg, color: shift.color ?? '#2d6a9f' }}>
                        <UserCheck size={12}/> Assign
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Shift Form Modal ─────────────────────────────────────── */
function ShiftModal({ mode, initial = {}, onClose }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors } = useForm({
        name:         initial.name         ?? '',
        description:  initial.description  ?? '',
        start_time:   initial.start_time   ?? '08:00',
        end_time:     initial.end_time     ?? '17:00',
        grace_period: initial.grace_period ?? 15,
        work_days:    initial.work_days    ?? [1,2,3,4,5],
        color:        initial.color        ?? '#2d6a9f',
        is_active:    initial.is_active    ?? true,
    });

    const duration = calcDuration(data.start_time, data.end_time);

    const toggleDay = (d) => {
        setData('work_days', data.work_days.includes(d)
            ? data.work_days.filter(x => x !== d)
            : [...data.work_days, d].sort());
    };

    const submit = () => {
        if (isEdit) {
            put(`/shifts/${initial.id}`, { onSuccess: onClose });
        } else {
            post('/shifts', { onSuccess: onClose });
        }
    };

    const inp = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '92vh' }}>

                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Sora',sans-serif" }}>
                            {isEdit ? 'Edit Shift' : 'Tambah Shift Baru'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isEdit ? `Mengubah shift ${initial.name}` : 'Buat jadwal shift baru'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
                        <X size={16}/>
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5 overflow-y-auto">

                    {/* Nama & Deskripsi */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Nama Shift</label>
                            <input className={inp} type="text" placeholder="Shift Pagi, Morning Shift…"
                                value={data.name} onChange={e => setData('name', e.target.value)}/>
                            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Deskripsi</label>
                            <input className={inp} type="text" placeholder="Opsional…"
                                value={data.description} onChange={e => setData('description', e.target.value)}/>
                        </div>
                    </div>

                    {/* Jam */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Jam Kerja</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 mb-1">Jam Masuk</p>
                                <input className={inp} type="time"
                                    value={data.start_time} onChange={e => setData('start_time', e.target.value)}/>
                            </div>
                            <div className="text-slate-300 mt-5 font-bold">→</div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 mb-1">Jam Keluar</p>
                                <input className={inp} type="time"
                                    value={data.end_time} onChange={e => setData('end_time', e.target.value)}/>
                            </div>
                        </div>
                        {duration && (
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <Timer size={11}/> Durasi: <strong>{duration}</strong>
                            </p>
                        )}
                        {errors.start_time && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.start_time}</p>}
                    </div>

                    {/* Toleransi */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                            Toleransi Keterlambatan (menit)
                        </label>
                        <div className="flex items-center gap-3">
                            <input className={`${inp} max-w-[120px]`} type="number" min="0" max="60"
                                value={data.grace_period} onChange={e => setData('grace_period', Number(e.target.value))}/>
                            <div className="flex gap-2">
                                {[5,10,15,30].map(m => (
                                    <button key={m} type="button"
                                        onClick={() => setData('grace_period', m)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition border"
                                        style={{
                                            borderColor: data.grace_period === m ? '#d97706' : '#e2e8f0',
                                            background:  data.grace_period === m ? '#fffbeb' : 'white',
                                            color:       data.grace_period === m ? '#d97706' : '#94a3b8',
                                        }}>
                                        {m}m
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Hari Kerja */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Hari Kerja</label>
                        <div className="flex gap-2">
                            {daysId.map((d, i) => {
                                const active = data.work_days.includes(i);
                                return (
                                    <button key={i} type="button" onClick={() => toggleDay(i)}
                                        className="flex-1 py-2 rounded-xl text-xs font-bold transition border-2"
                                        style={{
                                            background:  active ? data.color : 'white',
                                            color:       active ? 'white' : '#94a3b8',
                                            borderColor: active ? data.color : '#e2e8f0',
                                        }}>
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                            {data.work_days.length} hari/minggu dipilih
                        </p>
                    </div>

                    {/* Warna */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Warna Shift</label>
                        <div className="flex gap-2 flex-wrap">
                            {shiftColors.map(c => (
                                <button key={c.value} type="button" onClick={() => setData('color', c.value)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition"
                                    style={{
                                        borderColor: data.color === c.value ? c.value : '#e2e8f0',
                                        background:  data.color === c.value ? c.bg : 'white',
                                        color:       data.color === c.value ? c.value : '#94a3b8',
                                    }}>
                                    <span className="w-3 h-3 rounded-full" style={{ background: c.value }}/>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status aktif */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Status Shift</p>
                            <p className="text-xs text-slate-400 mt-0.5">Shift aktif akan bisa diassign ke karyawan</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}/>
                            <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"/>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition">
                        Batal
                    </button>
                    <button onClick={submit} disabled={processing}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-90 flex items-center justify-center gap-2"
                        style={{ background: data.color }}>
                        {processing
                            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                            : <Save size={14}/>}
                        {isEdit ? 'Simpan Perubahan' : 'Buat Shift'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Assign Modal ─────────────────────────────────────────── */
function AssignModal({ shift, employees = [], onClose }) {
    const [search, setSearch]       = useState('');
    const [selected, setSelected]   = useState([]);
    const [saving, setSaving]       = useState(false);
    const [saved, setSaved]         = useState(false);

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.department ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const assignAll = () => setSelected(filtered.map(e => e.id));
    const clearAll  = () => setSelected([]);

    const submit = () => {
        setSaving(true);
        router.post(`/shifts/${shift.id}/assign`, { employee_ids: selected }, {
            onSuccess: () => { setSaved(true); setSaving(false); setTimeout(onClose, 1200); },
            onError:   () => setSaving(false),
        });
    };

    const colorCfg = shiftColors.find(c => c.value === shift.color) ?? shiftColors[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>

                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Sora',sans-serif" }}>
                            Assign Karyawan
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: shift.color }}>
                            Shift: {shift.name} · {shift.start_time} – {shift.end_time}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
                        <X size={16}/>
                    </button>
                </div>

                <div className="px-5 py-4 border-b border-slate-100 space-y-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        <input type="text" placeholder="Cari nama atau departemen…"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                            value={search} onChange={e => setSearch(e.target.value)}/>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span><strong className="text-slate-700">{selected.length}</strong> karyawan dipilih dari {filtered.length}</span>
                        <div className="flex gap-2">
                            <button onClick={assignAll} className="text-blue-500 hover:underline">Pilih semua</button>
                            <span className="text-slate-300">|</span>
                            <button onClick={clearAll}  className="text-slate-400 hover:underline">Batal pilih</button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            <Users size={28} className="mx-auto mb-2 opacity-30"/>
                            Tidak ada karyawan
                        </div>
                    )}
                    {filtered.map(emp => {
                        const isSelected = selected.includes(emp.id);
                        return (
                            <div key={emp.id}
                                className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition ${isSelected ? 'bg-blue-50/40' : ''}`}
                                onClick={() => toggle(emp.id)}>
                                {/* Checkbox visual */}
                                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition"
                                    style={{
                                        borderColor: isSelected ? shift.color : '#e2e8f0',
                                        background:  isSelected ? shift.color : 'white',
                                    }}>
                                    {isSelected && <CheckCircle2 size={12} className="text-white"/>}
                                </div>
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{ background: colorCfg.bg, color: shift.color }}>
                                    {emp.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{emp.position} · {emp.department}</p>
                                </div>
                                {emp.current_shift && (
                                    <Badge label={emp.current_shift} color="#64748b" bg="#f1f5f9"/>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition">
                        Batal
                    </button>
                    <button onClick={submit} disabled={saving || selected.length === 0}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-90 flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ background: shift.color }}>
                        {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : <UserCheck size={14}/>}
                        {saved ? 'Tersimpan!' : `Assign ${selected.length > 0 ? selected.length : ''} Karyawan`}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Delete Confirm ───────────────────────────────────────── */
function DeleteDialog({ shift, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={22} className="text-red-500"/>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Hapus Shift?</h3>
                <p className="text-sm text-slate-500 mb-1">
                    Shift <strong>{shift?.name}</strong> akan dihapus permanen.
                </p>
                {(shift?.employee_count ?? 0) > 0 && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                        ⚠️ {shift.employee_count} karyawan masih assigned ke shift ini.
                    </p>
                )}
                <p className="text-xs text-slate-400 mb-5">Tindakan ini tidak dapat dibatalkan.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                        Batal
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition flex items-center justify-center gap-2">
                        <Trash2 size={13}/> Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══ MAIN PAGE ════════════════════════════════════════════ */
export default function ShiftManagement({ shifts = [], employees = [], filters = {} }) {
    const [modal, setModal]             = useState(null); // null | {type:'add'|'edit'|'assign', shift?}
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [search, setSearch]           = useState(filters.search ?? '');
    const [filterStatus, setFilterStatus] = useState(filters.status ?? 'all');

    const displayed = useMemo(() => {
        return shifts.filter(s => {
            const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? s.is_active : !s.is_active);
            return matchSearch && matchStatus;
        });
    }, [shifts, search, filterStatus]);

    const doDelete = () => {
        router.delete(`/shifts/${deleteTarget.id}`, { onFinish: () => setDeleteTarget(null) });
    };

    const totalEmployees = shifts.reduce((s, sh) => s + (sh.employee_count ?? 0), 0);
    const activeShifts   = shifts.filter(s => s.is_active).length;

    return (
        <div className="flex min-h-screen" style={{ background: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Sora:wght@600;700&display=swap');`}</style>

            <Sidebar/>
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar title="Shift Management"/>
                <main className="flex-1 p-6 space-y-6">

                    {/* ── Summary cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Shift',     value: shifts.length,  color: '#BFDDF0' },
                            { label: 'Shift Aktif',     value: activeShifts,   color: '#DCFCE7' },
                            { label: 'Total Karyawan',  value: totalEmployees, color: '#FFEBCC' },
                            { label: 'Shift Nonaktif',  value: shifts.length - activeShifts, color: '#FEE2E2' },
                        ].map(card => (
                            <div key={card.label} className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: card.color }}>
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{card.label}</p>
                                <p className="text-3xl font-bold text-slate-700" style={{ fontFamily: "'Sora',sans-serif" }}>
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ── Toolbar ── */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                            <input type="text" placeholder="Cari shift…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-300 transition"
                                value={search} onChange={e => setSearch(e.target.value)}/>
                        </div>
                        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                            {[
                                { key: 'all',      label: 'Semua'    },
                                { key: 'active',   label: 'Aktif'    },
                                { key: 'inactive', label: 'Nonaktif' },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFilterStatus(f.key)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                        filterStatus === f.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setModal({ type: 'add' })}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition hover:brightness-90"
                            style={{ background: '#2d6a9f' }}>
                            <Plus size={16}/> Tambah Shift
                        </button>
                    </div>

                    {/* ── Shift grid ── */}
                    {displayed.length === 0 ? (
                        <div className="bg-white rounded-2xl py-20 text-center shadow-sm">
                            <Clock size={40} className="mx-auto text-slate-200 mb-3"/>
                            <p className="text-slate-400 font-medium">Tidak ada shift ditemukan.</p>
                            <button onClick={() => setModal({ type: 'add' })}
                                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mx-auto transition hover:brightness-90"
                                style={{ background: '#2d6a9f' }}>
                                <Plus size={15}/> Buat Shift Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {displayed.map(shift => (
                                <ShiftCard
                                    key={shift.id}
                                    shift={shift}
                                    onEdit={(s)   => setModal({ type: 'edit',   shift: s })}
                                    onDelete={(s) => setDeleteTarget(s)}
                                    onAssign={(s) => setModal({ type: 'assign', shift: s })}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100 bg-white">
                    © 2024 HumaneHR SaaS. Designed for people.
                </footer>
            </div>

            {/* ── Modals ── */}
            {modal?.type === 'add' && (
                <ShiftModal mode="add" onClose={() => setModal(null)}/>
            )}
            {modal?.type === 'edit' && (
                <ShiftModal mode="edit" initial={modal.shift} onClose={() => setModal(null)}/>
            )}
            {modal?.type === 'assign' && (
                <AssignModal shift={modal.shift} employees={employees} onClose={() => setModal(null)}/>
            )}
            {deleteTarget && (
                <DeleteDialog shift={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={doDelete}/>
            )}
        </div>
    );
}