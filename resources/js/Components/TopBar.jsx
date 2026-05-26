import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Bell, HelpCircle, Check, Clock, UserCheck,
    AlertTriangle, X, ChevronRight, LogOut
} from 'lucide-react';

const notifIcon = (type) => {
    if (type === 'late')    return <AlertTriangle size={13} className="text-amber-500"/>;
    if (type === 'absent')  return <X size={13} className="text-red-500"/>;
    if (type === 'checkin') return <UserCheck size={13} className="text-green-500"/>;
    return <Bell size={13} className="text-blue-500"/>;
};

const notifBg = (type) => {
    if (type === 'late')   return 'bg-amber-50';
    if (type === 'absent') return 'bg-red-50';
    return 'bg-green-50';
};

const csrf = () => document.querySelector('meta[name=csrf-token]')?.content ?? '';

export default function TopBar({ title, notifications: notifProp }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? {};

    const [notifs, setNotifs]       = useState(notifProp ?? []);
    const [showNotif, setShowNotif] = useState(false);
    const notifRef  = useRef(null);
    const pollRef   = useRef(null);

    const fetchNotifs = async () => {
        try {
            const res = await fetch('/notifications/unread', {
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            if (res.ok) {
                const data = await res.json();
                setNotifs(data);
            }
        } catch (_) {}
    };

    useEffect(() => {
        fetchNotifs();
        pollRef.current = setInterval(fetchNotifs, 30_000);
        return () => clearInterval(pollRef.current);
    }, []);

    useEffect(() => {
        if (notifProp) setNotifs(notifProp);
    }, [notifProp]);

    useEffect(() => {
        const h = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const unread = notifs.filter(n => !n.read_at).length;

    const markAllRead = async () => {
        try {
            await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf(), 'Content-Type': 'application/json' }
            });
            setNotifs(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (_) {}
    };

    const doLogout = () => router.post('/logout');
    const avatarBg = '#BFDDF0';

    return (
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            {/* Title */}
            <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-slate-800 truncate max-w-[150px] sm:max-w-none">
                    {title || 'HumaneHR'}
                </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-3">
                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button onClick={() => setShowNotif(!showNotif)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition relative">
                        <Bell size={18}/>
                        {unread > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                            <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <span className="text-xs font-bold text-slate-800">Notifikasi ({unread})</span>
                                {unread > 0 && (
                                    <button onClick={markAllRead} className="text-[10px] font-semibold text-blue-600 hover:underline">
                                        Tandai dibaca
                                    </button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                                {notifs.slice(0, 5).map(n => (
                                    <div key={n.id} className={`p-3 flex gap-2.5 transition items-start ${!n.read_at ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notifBg(n.data?.type)}`}>
                                            {notifIcon(n.data?.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-700 leading-tight font-medium">{n.data?.message}</p>
                                            <p className="text-[9px] text-slate-400 mt-1">
                                                {n.created_at ? new Date(n.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {notifs.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 py-6">Tidak ada notifikasi baru.</p>
                                )}
                            </div>
                            <div className="p-2 bg-slate-50/50 border-t border-slate-50 text-center">
                                <Link href="/notifications" onClick={() => setShowNotif(false)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
                                    Lihat semua notifikasi <ChevronRight size={12}/>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1"/>

                {/* Avatar info */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: avatarBg, color: '#1e5a8a' }}>
                        {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="hidden sm:block leading-none">
                        <p className="text-xs font-semibold text-slate-700 truncate max-w-[100px]">{user.name ?? 'User'}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{user.role ?? 'employee'}</p>
                    </div>

                    <button
                        onClick={doLogout}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition ml-1"
                        title="Logout">
                        <LogOut size={17}/>
                    </button>
                </div>
            </div>
        </header>
    );
}