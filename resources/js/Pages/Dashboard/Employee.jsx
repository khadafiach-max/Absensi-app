import { useState, useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';
import Sidebar, { MobileBottomNav } from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import {
    Search, Plus, Trash2, X, User, Mail, Briefcase,
    Phone, MapPin, Building2, ChevronLeft, ChevronRight,
    Filter, UserCheck, UserX, Clock, Lock,
    AlertCircle, CheckCircle2, Pencil, Save
} from 'lucide-react';

/* ── Status ─────────────────────────────────────────────── */
const statusConfig = {
    active:   { label: 'Active',   color: '#16a34a', bg: '#f0fdf4', dot: '#22C55E' },
    inactive: { label: 'Inactive', color: '#64748b', bg: '#f8fafc', dot: '#94a3b8' },
    on_leave: { label: 'On Leave', color: '#dc2626', bg: '#fef2f2', dot: '#EF4444' },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] ?? statusConfig.inactive;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }}/>
            {cfg.label}
        </span>
    );
}

/* ── Avatar ─────────────────────────────────────────────── */
const avatarPalette = [
    ['#BFDDF0','#1e5a8a'],['#d1fae5','#065f46'],['#fce7f3','#9d174d'],
    ['#ede9fe','#5b21b6'],['#ffedd5','#9a3412'],['#fef9c3','#713f12'],
];
function Avatar({ emp, size = 9 }) {
    const [bg, fg] = avatarPalette[(emp.name?.charCodeAt(0) ?? 0) % avatarPalette.length];
    if (emp.photo) return (
        <img src={`/storage/${emp.photo}`}
            className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`} alt=""/>
    );
    return (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}
            style={{ background: bg, color: fg }}>
            {emp.name?.charAt(0)?.toUpperCase()}
        </div>
    );
}

/* ── Shared input style ──────────────────────────────────── */
const inp = "w-full px-3 py-2.5 pl-9 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition font-[DM_Sans]";

function LabeledInput({ label, icon: Icon, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {label}
            </label>
            <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                {children}
            </div>
            {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
        </div>
    );
}

/* ══ MODAL — Add / Edit ══════════════════════════════════ */
function EmployeeModal({ mode, initial, allDepartments, onClose }) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors } = useForm(
        isEdit
            ? { name: initial.name ?? '', email: initial.email ?? '', position: initial.position ?? '',
                department: initial.department ?? '', phone: initial.phone ?? '',
                work_location: initial.work_location ?? '', status: initial.status ?? 'active' }
            : { name: '', email: '', password: '', position: '', department: '', phone: '', work_location: '' }
    );

    const submit = () => {
        if (isEdit) {
            put(`/employees/${initial.id}`, { onSuccess: onClose });
        } else {
            post('/employees', { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Sora',sans-serif" }}>
                            {isEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isEdit ? `Mengubah data ${initial.name}` : 'Isi semua kolom dengan lengkap'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
                        <X size={16}/>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <LabeledInput label="Nama Lengkap" icon={User} error={errors.name}>
                                <input className={inp} type="text" placeholder="Name Surname"
                                    value={data.name} onChange={e => setData('name', e.target.value)}/>
                            </LabeledInput>
                        </div>

                        <div className="col-span-2">
                            <LabeledInput label="Email" icon={Mail} error={errors.email}>
                                <input className={inp} type="email" placeholder="name@company.com"
                                    value={data.email} onChange={e => setData('email', e.target.value)}/>
                            </LabeledInput>
                        </div>

                        {/* Password hanya saat tambah baru */}
                        {!isEdit && (
                            <div className="col-span-2">
                                <LabeledInput label="Password" icon={Lock} error={errors.password}>
                                    <input className={inp} type="password" placeholder="Min. 8 karakter"
                                        value={data.password} onChange={e => setData('password', e.target.value)}/>
                                </LabeledInput>
                            </div>
                        )}

                        <LabeledInput label="Jabatan" icon={Briefcase} error={errors.position}>
                            <input className={inp} type="text" placeholder="Frontend Dev"
                                value={data.position} onChange={e => setData('position', e.target.value)}/>
                        </LabeledInput>

                        {/* Departemen — bisa ketik / pilih dari datalist */}
                        <LabeledInput label="Departemen" icon={Building2} error={errors.department}>
                            <input className={inp} type="text" placeholder="Pilih atau ketik…"
                                list="dept-options"
                                value={data.department} onChange={e => setData('department', e.target.value)}/>
                            <datalist id="dept-options">
                                {allDepartments.map(d => <option key={d} value={d}/>)}
                            </datalist>
                        </LabeledInput>

                        <LabeledInput label="Nomor Telepon" icon={Phone} error={errors.phone}>
                            <input className={inp} type="text" placeholder="08xx-xxxx-xxxx"
                                value={data.phone} onChange={e => setData('phone', e.target.value)}/>
                        </LabeledInput>

                        <LabeledInput label="Lokasi Kerja" icon={MapPin} error={errors.work_location}>
                            <input className={inp} type="text" placeholder="HQ Jakarta"
                                value={data.work_location} onChange={e => setData('work_location', e.target.value)}/>
                        </LabeledInput>

                        {/* Status hanya saat edit */}
                        {isEdit && (
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Status
                                </label>
                                <div className="flex gap-2">
                                    {Object.entries(statusConfig).map(([val, cfg]) => (
                                        <button key={val} type="button"
                                            onClick={() => setData('status', val)}
                                            className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition"
                                            style={{
                                                borderColor: data.status === val ? cfg.color : '#e2e8f0',
                                                background:  data.status === val ? cfg.bg : 'white',
                                                color:       data.status === val ? cfg.color : '#94a3b8',
                                            }}>
                                            {cfg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition">
                        Batal
                    </button>
                    <button onClick={submit} disabled={processing}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-90 flex items-center justify-center gap-2"
                        style={{ background: '#2d6a9f' }}>
                        {processing
                            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/><span>Menyimpan…</span></>
                            : isEdit
                                ? <><Save size={14}/> Simpan Perubahan</>
                                : <><CheckCircle2 size={14}/> Simpan Karyawan</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══ Confirm Delete ══════════════════════════════════════ */
function DeleteDialog({ emp, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={22} className="text-red-500"/>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Hapus Karyawan?</h3>
                <p className="text-sm text-slate-500 mb-1">
                    Kamu akan menghapus <strong>{emp?.name}</strong>.
                </p>
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

/* ══ MAIN PAGE ═══════════════════════════════════════════ */
export default function Employee({ employees, filters, departments: deptProp }) {
    const [modal, setModal]           = useState(null);  // null | { mode:'add'|'edit', emp? }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [search, setSearch]         = useState(filters?.search ?? '');

    /* Kumpulkan departemen unik dari data yang ada + prop + fallback */
    // Hanya pakai departemen dari database (dikirim controller via prop departments)
    // Tidak ada hardcode — list otomatis ikut data karyawan yang ada
    const allDepartments = useMemo(() => {
        return Array.isArray(deptProp) ? deptProp : [];
    }, [deptProp]);

    const handleSearch = (val) => {
        setSearch(val);
        router.get('/employees', { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const doDelete = () => {
        router.delete(`/employees/${deleteTarget.id}`, { onFinish: () => setDeleteTarget(null) });
    };

    const closeModal = () => setModal(null);

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF9D2', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Sora:wght@600;700&display=swap');
                .row-hover:hover { background: #f8fafc; }
                select { background-image: none; }
            `}</style>

            <div className="hidden lg:flex flex-shrink-0"><Sidebar/></div>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <TopBar title="Employee Directory"/>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-16 lg:pb-0">

                    {/* ── Filter bar ── */}
                    <div className="flex flex-col sm:flex-row gap-3">

                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                            <input type="text" placeholder="Cari nama, jabatan, atau email…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:outline-none focus:border-blue-300 transition"
                                value={search} onChange={e => handleSearch(e.target.value)}/>
                        </div>

                        {/* Filter Dept — dinamis */}
                        <div className="relative">
                            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                            <select
                                className="pl-9 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:outline-none cursor-pointer appearance-none"
                                style={{ minWidth: 160 }}
                                value={filters?.department ?? ''}
                                onChange={e => router.get('/employees', { ...filters, department: e.target.value }, { preserveState: true })}>
                                <option value="">Semua Departemen</option>
                                {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Filter Status */}
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                            <select
                                className="pl-9 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-white focus:outline-none cursor-pointer appearance-none"
                                style={{ minWidth: 150 }}
                                value={filters?.status ?? ''}
                                onChange={e => router.get('/employees', { ...filters, status: e.target.value }, { preserveState: true })}>
                                <option value="">Semua Status</option>
                                <option value="active">Active</option>
                                <option value="on_leave">On Leave</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setModal({ mode: 'add' })}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition hover:brightness-90"
                            style={{ background: '#2d6a9f' }}>
                            <Plus size={16}/> Tambah Karyawan
                        </button>
                    </div>

                    {/* ── Table ── */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100" style={{ background: '#fafbfc' }}>
                                        <th className="text-left px-5 py-3.5 font-semibold tracking-wide">Karyawan</th>
                                        <th className="text-left px-5 py-3.5 font-semibold tracking-wide">Email</th>
                                        <th className="text-left px-5 py-3.5 font-semibold tracking-wide">Departemen</th>
                                        <th className="text-left px-5 py-3.5 font-semibold tracking-wide">Telepon</th>
                                        <th className="text-left px-5 py-3.5 font-semibold tracking-wide">Status</th>
                                        <th className="text-left px-5 py-3.5 font-semibold tracking-wide">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {employees.data.map(emp => (
                                        <tr key={emp.id} className="row-hover transition-colors">
                                            {/* Karyawan */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar emp={emp}/>
                                                    <div>
                                                        <div className="font-semibold text-slate-800 leading-tight">{emp.name}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                            <Briefcase size={10}/> {emp.position ?? '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Mail size={12} className="text-slate-300 flex-shrink-0"/> {emp.email}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {emp.department
                                                    ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                                                        <Building2 size={11}/> {emp.department}
                                                      </span>
                                                    : <span className="text-slate-300 text-xs">—</span>
                                                }
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Phone size={12} className="text-slate-300 flex-shrink-0"/> {emp.phone ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusBadge status={emp.status}/>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setModal({ mode: 'edit', emp })}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition">
                                                        <Pencil size={12}/> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(emp)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition">
                                                        <Trash2 size={12}/> Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <User size={32} className="mx-auto text-slate-200 mb-3"/>
                                                <p className="text-slate-400 text-sm">Tidak ada karyawan ditemukan.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                            <span>
                                Menampilkan <strong className="text-slate-700">{employees.from ?? 0}–{employees.to ?? 0}</strong> dari <strong className="text-slate-700">{employees.total}</strong> karyawan
                            </span>
                            <div className="flex gap-1">
                                {employees.links.map((link, i) => (
                                    <button key={i}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center font-medium transition disabled:opacity-30"
                                        style={{ background: link.active ? '#2d6a9f' : '#f1f5f9', color: link.active ? 'white' : '#64748b' }}>
                                        {link.label.includes('&laquo;') ? <ChevronLeft size={13}/>
                                            : link.label.includes('&raquo;') ? <ChevronRight size={13}/>
                                            : <span dangerouslySetInnerHTML={{ __html: link.label }}/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100 bg-white">
                    © 2024 HumaneHR SaaS. Designed for people.
                </footer>
                <MobileBottomNav />
            </div>

            {/* ══ Modal Add / Edit ══ */}
            {modal && (
                <EmployeeModal
                    mode={modal.mode}
                    initial={modal.emp ?? {}}
                    allDepartments={allDepartments}
                    onClose={closeModal}
                />
            )}

            {/* ══ Confirm Delete ══ */}
            {deleteTarget && (
                <DeleteDialog
                    emp={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={doDelete}
                />
            )}
        </div>
    );
}