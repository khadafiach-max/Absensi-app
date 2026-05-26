import { useState } from 'react';
import { router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import {
    FileText, BarChart2, MapPin, Filter,
    MoreVertical, Search, ChevronLeft, ChevronRight,
    Download, User
} from 'lucide-react';

const statusConfig = {
    present:      { label: 'Present',   color: '#16a34a', bg: '#f0fdf4', dot: '#22C55E' },
    late:         { label: 'Late',      color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
    absent:       { label: 'Absent',    color: '#dc2626', bg: '#fef2f2', dot: '#EF4444' },
    auto_checkout:{ label: 'Auto CO',   color: '#64748b', bg: '#f8fafc', dot: '#94a3b8' },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] ?? statusConfig.absent;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }}/>
            {cfg.label}
        </span>
    );
}

const avatarColors = ['#BFDDF0','#d1fae5','#fce7f3','#ede9fe','#ffedd5'];
const getAvatarBg = (name = '') => avatarColors[(name?.charCodeAt(0) ?? 0) % avatarColors.length];

function initials(name = '') {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function History({ histories, filters }) {
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo,   setDateTo]   = useState(filters?.date_to   ?? '');
    const [status,   setStatus]   = useState(filters?.status    ?? '');
    const [search,   setSearch]   = useState(filters?.search    ?? '');
    const [exporting, setExporting] = useState(null); // 'pdf' | 'excel' | null

    const applyFilters = () => {
        router.get('/history', { date_from: dateFrom, date_to: dateTo, status, search }, { preserveState: true });
    };

    /* ── Export PDF — buka tab baru ke endpoint backend ── */
    const exportPdf = () => {
        setExporting('pdf');
        const params = new URLSearchParams({
            date_from: dateFrom, date_to: dateTo, status, search,
        }).toString();
        const url = `/history/export-pdf?${params}`;
        /* Buka di tab baru agar tidak block UI */
        window.open(url, '_blank');
        setTimeout(() => setExporting(null), 1500);
    };

    /* ── Export Excel — trigger download langsung ── */
    const exportExcel = () => {
        setExporting('excel');
        const params = new URLSearchParams({
            date_from: dateFrom, date_to: dateTo, status, search,
        }).toString();
        /* Buat link element, click, lalu hapus — memicu download */
        const a = document.createElement('a');
        a.href = `/history/export-excel?${params}`;
        a.download = `attendance_${dateFrom || 'all'}_${dateTo || 'all'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => setExporting(null), 1500);
    };

    return (
        <div className="flex min-h-screen" style={{ background: '#FFF9D2', fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700&display=swap');`}</style>
            <Sidebar/>
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar title="Attendance History"/>
                <main className="flex-1 p-6 space-y-5">

                    {/* ── Filter bar ── */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex flex-wrap gap-3 items-end">

                            {/* Search */}
                            <div className="flex-1 min-w-[180px]">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Cari Karyawan</label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                    <input type="text" placeholder="Nama karyawan…"
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                                        value={search} onChange={e => setSearch(e.target.value)}/>
                                </div>
                            </div>

                            {/* Date range */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Tanggal</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"/>
                                    <span className="text-slate-400 text-sm">—</span>
                                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"/>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)}
                                    className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none appearance-none min-w-[150px]">
                                    <option value="">Semua Status</option>
                                    <option value="present">Present</option>
                                    <option value="late">Late</option>
                                    <option value="absent">Absent</option>
                                    <option value="auto_checkout">Auto Checkout</option>
                                </select>
                            </div>

                            {/* Filter button */}
                            <button onClick={applyFilters}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                                <Filter size={14}/> Filter
                            </button>

                            {/* Export buttons */}
                            <div className="flex gap-2 ml-auto">
                                <button onClick={exportPdf} disabled={exporting === 'pdf'}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition disabled:opacity-60 hover:bg-blue-50"
                                    style={{ borderColor: '#2d6a9f', color: '#2d6a9f' }}>
                                    {exporting === 'pdf'
                                        ? <span className="w-4 h-4 border-2 border-blue-400/40 border-t-blue-600 rounded-full animate-spin"/>
                                        : <FileText size={15}/>
                                    }
                                    Export PDF
                                </button>
                                <button onClick={exportExcel} disabled={exporting === 'excel'}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 hover:brightness-90"
                                    style={{ background: '#16a34a' }}>
                                    {exporting === 'excel'
                                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                                        : <Download size={15}/>
                                    }
                                    Export Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100" style={{ background: '#fafbfc' }}>
                                        <th className="px-5 py-3.5 text-left font-semibold tracking-wide">Nama</th>
                                        <th className="px-5 py-3.5 text-left font-semibold tracking-wide">Tanggal</th>
                                        <th className="px-5 py-3.5 text-left font-semibold tracking-wide">Jam Masuk</th>
                                        <th className="px-5 py-3.5 text-left font-semibold tracking-wide">Jam Keluar</th>
                                        <th className="px-5 py-3.5 text-left font-semibold tracking-wide">Durasi</th>
                                        <th className="px-5 py-3.5 text-left font-semibold tracking-wide">Status</th>
                                        <th className="px-5 py-3.5 text-left font-semibold tracking-wide">Lokasi</th>
                                        <th className="px-5 py-3.5"/>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {histories.data.map(h => (
                                        <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                        style={{ background: getAvatarBg(h.employee_name), color: '#1e5a8a' }}>
                                                        {initials(h.employee_name)}
                                                    </div>
                                                    <span className="font-medium text-slate-800">{h.employee_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">{h.date}</td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{h.check_in ?? '—'}</td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-800">{h.check_out ?? '—'}</td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">{h.duration ?? '—'}</td>
                                            <td className="px-5 py-3.5"><StatusBadge status={h.status}/></td>
                                            <td className="px-5 py-3.5 text-xs text-slate-500">
                                                {h.location
                                                    ? <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400 flex-shrink-0"/>{h.location}</span>
                                                    : <span className="text-slate-300">—</span>
                                                }
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-300">
                                                <button><MoreVertical size={15}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {histories.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center">
                                                <User size={32} className="mx-auto text-slate-200 mb-3"/>
                                                <p className="text-slate-400">Tidak ada data absensi.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                            <span>
                                Menampilkan <strong className="text-slate-700">{histories.from ?? 0}–{histories.to ?? 0}</strong> dari <strong className="text-slate-700">{histories.total}</strong> entri
                            </span>
                            <div className="flex gap-1">
                                {histories.links.map((link, i) => (
                                    <button key={i} disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
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

                <footer className="text-center py-4 text-xs bg-white border-t text-slate-400">
                    © 2024 HumaneHR SaaS
                </footer>
            </div>
        </div>
    );
}