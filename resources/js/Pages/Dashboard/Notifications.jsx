import { useState } from 'react';
import { router } from '@inertiajs/react';
import Sidebar, { MobileBottomNav } from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import {
    Bell, AlertTriangle, X, UserCheck,
    Check, Trash2, Clock, Filter
} from 'lucide-react';

/* ── Icon & warna per tipe ── */
const notifIcon = (type) => {
    if (type === 'late')    return <AlertTriangle size={15} className="text-amber-500"/>;
    if (type === 'absent')  return <X size={15} className="text-red-500"/>;
    if (type === 'checkin') return <UserCheck size={15} className="text-green-500"/>;
    return <Bell size={15} className="text-blue-500"/>;
};

const notifBgClass = (type) => {
    if (type === 'late')   return 'bg-amber-50';
    if (type === 'absent') return 'bg-red-50';
    return 'bg-green-50';
};

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content ?? '';

export default function Notifications({ notifications: initNotifs = [] }) {
    const [notifs, setNotifs]   = useState(initNotifs);
    const [filter, setFilter]   = useState('all'); // 'all' | 'unread'
    const [loading, setLoading] = useState(false);

    const displayed = filter === 'unread'
        ? notifs.filter(n => !n.read_at)
        : notifs;

    const unreadCount = notifs.filter(n => !n.read_at).length;

    /* ── Tandai satu ── */
    const markRead = async (id) => {
        setNotifs(prev => prev.map(n =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ));
        await fetch(`/notifications/${id}/read`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
            credentials: 'same-origin',
        }).catch(() => {});
    };

    /* ── Tandai semua ── */
    const markAllRead = async () => {
        setLoading(true);
        await fetch('/notifications/mark-all-read', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
            credentials: 'same-origin',
        }).catch(() => {});
        setNotifs(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
        setLoading(false);
    };

    /* ── Hapus satu ── */
    const dismiss = async (id) => {
        setNotifs(prev => prev.filter(n => n.id !== id));
        await fetch(`/notifications/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
            credentials: 'same-origin',
        }).catch(() => {});
    };

    /* ── Hapus semua yang sudah dibaca ── */
    const clearRead = async () => {
        const readIds = notifs.filter(n => n.read_at).map(n => n.id);
        setNotifs(prev => prev.filter(n => !n.read_at));
        await Promise.all(readIds.map(id =>
            fetch(`/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
                credentials: 'same-origin',
            }).catch(() => {})
        ));
    };

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#FFF9D2', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700&display=swap');`}</style>
            <div className="hidden lg:flex flex-shrink-0"><div className="hidden lg:flex flex-shrink-0"><Sidebar/></div></div>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <TopBar title="Notifikasi"/>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl w-full mx-auto space-y-4 pb-16 lg:pb-0">

                    {/* ── Header bar ── */}
                    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {/* Filter tabs */}
                            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                                {[
                                    { key: 'all',    label: 'Semua' },
                                    { key: 'unread', label: 'Belum Dibaca' },
                                ].map(f => (
                                    <button key={f.key} onClick={() => setFilter(f.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                            filter === f.key
                                                ? 'bg-white text-slate-800 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}>
                                        {f.label}
                                        {f.key === 'unread' && unreadCount > 0 && (
                                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} disabled={loading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition disabled:opacity-60">
                                    <Check size={12}/> Tandai semua dibaca
                                </button>
                            )}
                            {notifs.some(n => n.read_at) && (
                                <button onClick={clearRead}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition">
                                    <Trash2 size={12}/> Hapus yang sudah dibaca
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── List ── */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {displayed.length === 0 ? (
                            <div className="py-20 text-center text-slate-400">
                                <Bell size={36} className="mx-auto mb-3 opacity-20"/>
                                <p className="font-medium text-sm">
                                    {filter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Tidak ada notifikasi'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {displayed.map(n => (
                                    <div key={n.id}
                                        className={`flex gap-4 px-5 py-4 hover:bg-slate-50 transition cursor-pointer group ${
                                            !n.read_at ? 'bg-blue-50/30' : ''
                                        }`}
                                        onClick={() => !n.read_at && markRead(n.id)}>

                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${notifBgClass(n.type)}`}>
                                            {notifIcon(n.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-semibold leading-tight ${!n.read_at ? 'text-slate-800' : 'text-slate-500'}`}>
                                                    {n.title ?? '—'}
                                                </p>
                                                {/* Unread dot */}
                                                {!n.read_at && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"/>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5 leading-snug">
                                                {n.body ?? ''}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                                <Clock size={10}/> {n.time ?? ''}
                                            </p>
                                        </div>

                                        {/* Hapus */}
                                        <button
                                            onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5">
                                            <X size={13}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Total info */}
                    {displayed.length > 0 && (
                        <p className="text-xs text-slate-400 text-center">
                            Menampilkan {displayed.length} notifikasi
                            {filter === 'all' && unreadCount > 0 && ` · ${unreadCount} belum dibaca`}
                        </p>
                    )}
                </main>

                <footer className="bg-white border-t py-4 text-center text-xs text-slate-400">
                    © 2024 HumaneHR SaaS
                </footer>
                <MobileBottomNav />
            </div>
        </div>
    );
}