import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Zap, BarChart2, MapPin, FileText,
    Menu, X, ChevronRight, Users, Clock,
    Shield, ArrowRight
} from 'lucide-react';

export default function Home() {
    const [activeSection, setActiveSection] = useState('home');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'features', 'about'];
            let current = 'home';
            sections.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const top = el.offsetTop - 200;
                    if (window.scrollY >= top && window.scrollY < top + el.offsetHeight) {
                        current = id;
                    }
                }
            });
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Home',     id: 'home'     },
        { name: 'Features', id: 'features' },
        { name: 'About',    id: 'about'    },
    ];

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen" style={{ background: '#FFF9D2', fontFamily: 'DM Sans, sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
                .hero-title { font-family: 'Sora', sans-serif; }
                html { scroll-behavior: smooth; }
                .feature-card { transition: transform 0.2s, box-shadow 0.2s; }
                .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
                .nav-link-active { color: #2d6a9f; }
                .nav-link-active::after { width: 100% !important; opacity: 1 !important; }
            `}</style>

            {/* ── NAVBAR ─────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

                    {/* Logo */}
                    <div className="hero-title font-bold text-xl text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#BFDDF0' }}>
                            <Users size={16} className="text-blue-700" />
                        </div>
                        HumaneHR
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => scrollTo(item.id)}
                                className={`relative pb-1.5 text-sm font-medium transition-all ${
                                    activeSection === item.id ? 'text-[#2d6a9f]' : 'text-slate-600 hover:text-[#2d6a9f]'
                                }`}>
                                {item.name}
                                <div className={`absolute left-0 bottom-0 h-0.5 bg-[#2d6a9f] rounded-full transition-all duration-300 ${
                                    activeSection === item.id ? 'w-full opacity-100' : 'w-0 opacity-0'
                                }`} />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/login"
                            className="hidden sm:inline-flex items-center gap-1.5 bg-[#2d6a9f] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245a8a] transition-all">
                            Login
                        </Link>
                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileMenuOpen(v => !v)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition">
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => scrollTo(item.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                                    activeSection === item.id
                                        ? 'bg-blue-50 text-[#2d6a9f]'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}>
                                {item.name}
                            </button>
                        ))}
                        <Link href="/login"
                            className="flex items-center justify-center gap-1.5 bg-[#2d6a9f] text-white px-4 py-2.5 rounded-xl text-sm font-medium mt-2">
                            Login ke Dashboard
                        </Link>
                    </div>
                )}
            </nav>

            {/* ── HERO ───────────────────────────────────────────── */}
            <section id="home" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

                {/* Left text */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                        style={{ background: '#BFDDF0', color: '#1e5a8a' }}>
                        <Zap size={12} />
                        TRUSTED BY 500+ COMPANIES
                    </div>

                    <h1 className="hero-title text-4xl sm:text-5xl font-bold leading-tight mb-5">
                        Sistem Absensi<br />
                        <span style={{ color: '#2d6a9f' }}>Digital Modern</span>
                    </h1>

                    <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                        Kelola absensi karyawan secara mudah, cepat, dan real-time dengan teknologi cloud modern yang dirancang untuk kenyamanan tim Anda.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                        <Link href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-[#2d6a9f] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#245a8a] transition-all hover:shadow-lg">
                            Mulai Sekarang
                            <ArrowRight size={15} />
                        </Link>
                        <button onClick={() => scrollTo('features')}
                            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all">
                            Pelajari lebih lanjut
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
                        {[
                            { label: 'Perusahaan', value: '500+' },
                            { label: 'Karyawan Aktif', value: '50K+' },
                            { label: 'Uptime', value: '99.9%' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="hero-title text-2xl font-bold text-slate-800">{s.value}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Dashboard preview card */}
                <div className="flex-1 w-full max-w-sm sm:max-w-md lg:max-w-none">
                    <div className="rounded-3xl p-4 sm:p-5 shadow-2xl" style={{ background: '#BFDDF0' }}>
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            {/* Mini topbar */}
                            <div className="flex justify-between items-center mb-4">
                                <span className="hero-title font-bold text-slate-700 text-sm">HumaneHR Dashboard</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                    <span className="text-xs text-slate-400">Live</span>
                                </div>
                            </div>

                            {/* Stat grid */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[['120', 'Total', '#BFDDF0'], ['95', 'Hadir', '#86efac'], ['5', 'Late', '#fca5a5'], ['20', 'Absen', '#fdba74']].map(([n, l, c]) => (
                                    <div key={l} className="rounded-xl p-2 text-center" style={{ background: c + '40' }}>
                                        <div className="hero-title font-bold text-slate-800">{n}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{l}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Mini chart */}
                            <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
                                <div className="text-xs text-slate-400 mb-2 font-medium">Weekly Trend</div>
                                <div className="flex items-end gap-1.5 h-14">
                                    {[70, 85, 65, 90, 80, 45, 35].map((h, i) => (
                                        <div key={i} className="flex-1 rounded-t" style={{
                                            height: `${h}%`,
                                            background: i < 5 ? '#2d6a9f' : '#BFDDF0'
                                        }} />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                        <span key={i} className="flex-1 text-center text-[9px] text-slate-400">{d}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Recent items */}
                            <div className="mt-3 space-y-1.5">
                                {[
                                    { name: 'Ahmad Rizky', dept: 'Marketing', time: '08:02', status: 'On Time', ok: true },
                                    { name: 'Sarah Amelia', dept: 'Design', time: '08:45', status: 'Late', ok: false },
                                ].map(a => (
                                    <div key={a.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: '#f8fafc' }}>
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                            style={{ background: '#BFDDF0', color: '#1e5a8a' }}>
                                            {a.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-slate-700 truncate">{a.name}</div>
                                            <div className="text-[9px] text-slate-400">{a.dept}</div>
                                        </div>
                                        <span className="text-[10px] font-semibold" style={{ color: a.ok ? '#22C55E' : '#EF4444' }}>
                                            {a.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ───────────────────────────────────────── */}
            <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                <div className="text-center mb-12">
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">Kenapa HumaneHR?</p>
                    <h2 className="hero-title text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Fitur Unggulan Untuk Efisiensi</h2>
                    <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#2d6a9f' }} />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                        {
                            icon: <BarChart2 size={24} className="text-blue-700" />,
                            bg: '#BFDDF0',
                            title: 'Real-time Monitoring',
                            desc: 'Pantau kehadiran karyawan secara instan langsung dari dashboard tanpa perlu refresh halaman.',
                        },
                        {
                            icon: <MapPin size={24} className="text-orange-500" />,
                            bg: '#FFEBCC',
                            title: 'Geotagging Precisely',
                            desc: 'Pastikan tim melakukan absensi di lokasi yang benar dengan verifikasi koordinat GPS yang akurat.',
                        },
                        {
                            icon: <FileText size={24} className="text-green-600" />,
                            bg: '#dcfce7',
                            title: 'Exportable Reports',
                            desc: 'Unduh laporan kehadiran bulanan dalam PDF atau Excel dengan sekali klik untuk kebutuhan payroll.',
                        },
                        {
                            icon: <Shield size={24} className="text-purple-500" />,
                            bg: '#ede9fe',
                            title: 'Secure Authentication',
                            desc: 'Login aman dengan proteksi berlapis dan QR Code untuk verifikasi kehadiran real-time.',
                        },
                        {
                            icon: <Clock size={24} className="text-red-500" />,
                            bg: '#fee2e2',
                            title: 'Auto Check-out',
                            desc: 'Sistem otomatis melakukan check-out ketika jam kerja berakhir, tanpa tindakan manual.',
                        },
                        {
                            icon: <Users size={24} className="text-blue-600" />,
                            bg: '#BFDDF0',
                            title: 'Employee Management',
                            desc: 'Kelola data karyawan lengkap dengan filter, pencarian, dan manajemen status yang mudah.',
                        },
                    ].map(f => (
                        <div key={f.title} className="feature-card bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TRUSTED BY ─────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <p className="text-center text-xs font-semibold tracking-widest text-slate-400 uppercase mb-6">
                    DIGUNAKAN OLEH INDUSTRI TERKEMUKA
                </p>
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                    {['COMPANY A', 'BRAND B', 'STARTUP C', 'ENTERPRISE D'].map(c => (
                        <span key={c} className="text-slate-300 font-bold text-sm sm:text-base tracking-wider">{c}</span>
                    ))}
                </div>
            </section>

            {/* ── ABOUT / CTA ────────────────────────────────────── */}
            <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 mb-12 sm:mb-16">
                <div className="rounded-3xl p-8 sm:p-12 text-center" style={{ background: '#BFDDF0' }}>
                    <h2 className="hero-title text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                        Siap Transformasi Cara Kerja Anda?
                    </h2>
                    <p className="text-slate-600 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                        Bergabunglah dengan ribuan HR Manager yang telah beralih ke HumaneHR untuk sistem absensi yang lebih manusiawi dan efisien.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/login"
                            className="inline-flex items-center justify-center gap-2 bg-[#2d6a9f] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#245a8a] transition-all hover:shadow-lg">
                            Daftar Gratis Sekarang
                            <ArrowRight size={15} />
                        </Link>
                        <a href="mailto:support@humanehr.com"
                            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-8 py-3 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all">
                            Hubungi Tim Kami
                        </a>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ─────────────────────────────────────────── */}
            <footer className="bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#BFDDF0' }}>
                            <Users size={13} className="text-blue-700" />
                        </div>
                        <span className="hero-title font-bold text-slate-700">HumaneHR</span>
                    </div>
                    <p className="text-xs text-slate-400">© 2024 HumaneHR SaaS. Designed for people.</p>
                    <div className="flex gap-4 text-xs text-slate-400">
                        <a href="#" className="hover:text-slate-700 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-700 transition">Terms of Service</a>
                        <a href="#" className="hover:text-slate-700 transition">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
