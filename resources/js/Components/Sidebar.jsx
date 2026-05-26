import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, CalendarCheck, Users, History,
    Settings, ChevronRight, User, Bell, Shield,
    Palette, Globe, KeyRound, X, Save, CheckCircle2,
    AlertCircle, LogOut, Clock,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard',  key: 'dashboard'  },
    { label: 'Absen',     icon: CalendarCheck,   href: '/attendance', key: 'attendance' },
    { label: 'Karyawan',  icon: Users,            href: '/employees',  key: 'employees'  },
    { label: 'Shifts',    icon: Clock,           href: '/shifts',     key: 'shifts'     },
    { label: 'History',   icon: History,          href: '/history',    key: 'history'    },
];

const avatarColors = ['#BFDDF0','#d1fae5','#fce7f3','#ede9fe','#ffedd5'];
const getAvatarBg  = (name = '') => avatarColors[(name.charCodeAt(0) ?? 0) % avatarColors.length];

/* ══ SIDEBAR ══════════════════════════════════════════════ */
export default function Sidebar() {
    const { url, props } = usePage();
    const user = props?.auth?.user ?? {};

    // Perbaikan: exact match untuk '/' dan startsWith untuk route lain
    const isActive = (href) => {
        if (href === '/') return url === '/';
        return url === href || url.startsWith(href + '/') || url.startsWith(href + '?');
    };

    return (
        <aside className="w-64 sticky top-0 h-screen flex flex-col flex-shrink-0 border-r border-blue-200/50"
            style={{ background: '#BFDDF0' }}>

            {/* Logo */}
            <div className="px-5 py-5 border-b border-blue-200/40">
                <div className="font-bold text-slate-800 text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
                    HumaneHR
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Management Portal</div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
                    Menu Utama
                </p>
                {navItems.map(item => (
                    <Link
                        key={item.key}
                        href={item.href}
                        // Gunakan preserveScroll agar tidak scroll ke atas saat navigasi
                        preserveScroll
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive(item.href)
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                        }`}
                    >
                        <item.icon size={17} className={isActive(item.href) ? 'text-blue-600' : ''}/>
                        <span>{item.label}</span>
                        {isActive(item.href) && <ChevronRight size={13} className="ml-auto text-slate-400"/>}
                    </Link>
                ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 pb-4 pt-2 border-t border-blue-200/40 space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
                    Preferensi
                </p>

                {/* Settings */}
                <Link
                    href="/settings"
                    preserveScroll
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive('/settings')
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                    }`}
                >
                    <Settings size={17} className={isActive('/settings') ? 'text-blue-600' : ''}/>
                    <span>Pengaturan</span>
                    {isActive('/settings') && <ChevronRight size={13} className="ml-auto text-slate-400"/>}
                </Link>

                {/* Profile card */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/60 mt-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: getAvatarBg(user.name), color: '#1e5a8a' }}>
                        {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{user.name ?? 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate capitalize">{user.role ?? 'employee'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

/* ══ MOBILE BOTTOM NAV ════════════════════════════════════
 * Diexport named agar bisa diimport di Attendance.jsx dan
 * Employee.jsx:  import Sidebar, { MobileBottomNav } from '@/Components/Sidebar'
 * ══════════════════════════════════════════════════════════ */
export function MobileBottomNav() {
    const { url } = usePage();

    const isActive = (href) => {
        if (href === '/') return url === '/';
        return url === href || url.startsWith(href + '/') || url.startsWith(href + '?');
    };

    // Gabungkan navItems + settings untuk bottom nav mobile
    const mobileItems = [
        ...navItems,
        { label: 'Pengaturan', icon: Settings, href: '/settings', key: 'settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-blue-200/50"
            style={{ background: '#BFDDF0' }}>
            {mobileItems.map(item => (
                <Link
                    key={item.key}
                    href={item.href}
                    preserveScroll
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                        isActive(item.href)
                            ? 'text-blue-600'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <item.icon size={20} strokeWidth={isActive(item.href) ? 2.5 : 1.8}/>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}