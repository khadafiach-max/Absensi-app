import { useState, useRef, useEffect } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import {
    ChevronRight, Camera, Trash2, CheckCircle2, AlertCircle,
    KeyRound, Smartphone, Laptop, X, Sun, Moon, Globe,
    LayoutDashboard, CalendarCheck, Users, History,
    Settings as SettingsIcon, Shield, Bell, Lock, Eye, EyeOff,
    LogOut, Monitor, Wifi, MapPin, Clock, Download, AlertTriangle,
    ToggleLeft,
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════ */
const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard'  },
    { label: 'Absen',     icon: CalendarCheck,   href: '/attendance' },
    { label: 'Karyawan',  icon: Users,            href: '/employees'  },
    { label: 'History',   icon: History,          href: '/history'    },
];

const AVATAR_COLORS = ['#BFDDF0','#d1fae5','#fce7f3','#ede9fe','#ffedd5'];
function avatarBg(name = '') {
    return AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

/* ══════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════ */
function AppSidebar({ user }) {
    const { url } = usePage();
    const active  = (href) => url.startsWith(href);

    return (
        <aside className="w-64 sticky top-0 h-screen flex flex-col flex-shrink-0 border-r border-blue-200/50"
            style={{ background: '#BFDDF0' }}>
            <div className="px-5 py-5 border-b border-blue-200/40">
                <div className="font-bold text-slate-800 text-xl" style={{ fontFamily: "'Sora',sans-serif" }}>HumaneHR</div>
                <div className="text-xs text-slate-500 mt-0.5">Management Portal</div>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu Utama</p>
                {NAV_ITEMS.map(item => (
                    <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            active(item.href) ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                        }`}>
                        <item.icon size={17} className={active(item.href) ? 'text-blue-600' : ''} />
                        <span>{item.label}</span>
                        {active(item.href) && <ChevronRight size={13} className="ml-auto text-slate-400" />}
                    </Link>
                ))}
            </nav>

            <div className="px-3 pb-4 pt-2 border-t border-blue-200/40 space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Preferensi</p>
                <Link href="/settings"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active('/settings') ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                    }`}>
                    <SettingsIcon size={17} className={active('/settings') ? 'text-blue-600' : ''} />
                    <span>Pengaturan</span>
                    {active('/settings') && <ChevronRight size={13} className="ml-auto text-slate-400" />}
                </Link>

                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/60 mt-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: avatarBg(user?.name), color: '#1e5a8a' }}>
                        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{user?.name ?? 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role ?? 'employee'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

/* ══════════════════════════════════════════════════
   SETTINGS PAGE
══════════════════════════════════════════════════ */
export default function SettingsPage() {
    const { auth, flash } = usePage().props;
    const user = auth?.user ?? {};
    const [activeTab, setActiveTab] = useState('profile');

    const TABS = [
        { key: 'profile',       label: 'Profile',       icon: '👤' },
        { key: 'account',       label: 'Account',       icon: '🔐' },
        { key: 'notifications', label: 'Notifications', icon: '🔔' },
        { key: 'privacy',       label: 'Privacy',       icon: '🛡️' },
        { key: 'system',        label: 'System',        icon: '⚙️' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AppSidebar user={user} />
            <div className="flex-1 flex flex-col overflow-auto">
                <div className="px-8 pt-8 pb-0">
                    <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>

                    {/* Flash success global */}
                    {flash?.success && (
                        <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm">
                            <CheckCircle2 size={16} /> {flash.success}
                        </div>
                    )}

                    <div className="flex gap-0 mt-6 border-b border-gray-200">
                        {TABS.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`relative px-5 py-3 text-sm font-medium transition-colors mr-1 ${
                                    activeTab === tab.key
                                        ? 'text-slate-800 border-b-2 border-slate-800 -mb-px'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                                style={activeTab === tab.key ? {} : {
                                    border: '1px dashed #CBD5E1', borderBottom: 'none', borderRadius: '6px 6px 0 0',
                                }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 px-8 py-6">
                    {activeTab === 'profile'       && <ProfileTab       user={user} />}
                    {activeTab === 'account'       && <AccountTab       user={user} />}
                    {activeTab === 'notifications' && <NotificationsTab user={user} />}
                    {activeTab === 'privacy'       && <PrivacyTab       user={user} />}
                    {activeTab === 'system'        && <SystemTab />}
                </div>

                <div className="px-8 py-4 flex justify-between text-xs text-slate-400 border-t border-gray-100">
                    <span>© 2024 HumaneHR SaaS. Designed for people.</span>
                    <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   TAB: PROFILE
   - Edit nama, email, phone, job title
   - Upload / remove foto avatar
══════════════════════════════════════════════════ */
function ProfileTab({ user }) {
    const fileRef = useRef();
    const [preview, setPreview] = useState(user.avatar_url ?? null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [form, setForm] = useState({
        name:      user.name      ?? '',
        email:     user.email     ?? '',
        phone:     user.phone     ?? '',
        job_title: user.job_title ?? '',
    });
    const [errors,  setErrors]  = useState({});
    const [saving,  setSaving]  = useState(false);
    const [saved,   setSaved]   = useState(false);

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setPreview(URL.createObjectURL(file));
    }

    function handleRemovePhoto() {
        setPreview(null);
        setAvatarFile(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    function handleSave() {
        setSaving(true); setErrors({});
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v ?? ''));
        if (avatarFile) data.append('avatar', avatarFile);
        data.append('_method', 'PUT');

        router.post('/settings/profile', data, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => { setSaved(true); setSaving(false); setTimeout(() => setSaved(false), 3000); },
            onError:   (e) => { setErrors(e); setSaving(false); },
        });
    }

    function handleCancel() {
        setForm({ name: user.name??'', email: user.email??'', phone: user.phone??'', job_title: user.job_title??'' });
        setPreview(user.avatar_url ?? null);
        setAvatarFile(null);
        setErrors({});
    }

    return (
        <div className="max-w-3xl">
            <Card>
                <h2 className="text-base font-semibold text-slate-800 mb-5">Personal Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="relative flex-shrink-0">
                        {preview
                            ? <img src={preview} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
                            : (
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow"
                                    style={{ background: '#2d6a9f' }}>
                                    {form.name?.charAt(0)?.toUpperCase() ?? 'U'}
                                </div>
                            )
                        }
                        <button onClick={() => fileRef.current?.click()}
                            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-600 transition">
                            <Camera size={11} className="text-white" />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">{form.name || 'User'}</p>
                        <p className="text-sm text-slate-400 mt-0.5">Update your photo and personal details here.</p>
                        <div className="flex gap-3 mt-3">
                            <button onClick={() => fileRef.current?.click()}
                                className="px-4 py-1.5 text-xs font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-gray-100 transition">
                                Change Photo
                            </button>
                            {preview && (
                                <button onClick={handleRemovePhoto}
                                    className="px-4 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition flex items-center gap-1">
                                    <Trash2 size={12} /> Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-2 gap-5">
                    <FormField label="Full Name"    value={form.name}      error={errors.name}
                        onChange={v => setForm(p => ({ ...p, name: v }))} />
                    <FormField label="Job Title"    value={form.job_title} error={errors.job_title}
                        onChange={v => setForm(p => ({ ...p, job_title: v }))} />
                    <FormField label="Work Email"   value={form.email}     error={errors.email} type="email"
                        onChange={v => setForm(p => ({ ...p, email: v }))} />
                    <FormField label="Phone Number" value={form.phone}     error={errors.phone}
                        onChange={v => setForm(p => ({ ...p, phone: v }))} />
                </div>

                {saved && <SuccessBanner text="Profil berhasil disimpan!" />}

                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                    <button onClick={handleCancel}
                        className="px-5 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
                        Cancel
                    </button>
                    <PrimaryBtn onClick={handleSave} loading={saving} done={saved} label="Save Changes" />
                </div>
            </Card>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   TAB: ACCOUNT
   - Toggle 2FA
   - Lihat & hapus active sessions
   - Ganti password (show/hide)
   - Danger zone: delete account
══════════════════════════════════════════════════ */
function AccountTab({ user }) {
    const [twoFa, setTwoFa]       = useState(user.two_factor_enabled ?? false);
    const [twoFaSaving, setTwoFaSaving] = useState(false);

    const [pwForm, setPwForm]     = useState({ current_password:'', password:'', password_confirmation:'' });
    const [pwShow, setPwShow]     = useState({ current:false, new:false, confirm:false });
    const [pwErrors, setPwErrors] = useState({});
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSaved,  setPwSaved]  = useState(false);

    const [sessions, setSessions] = useState([
        { id: 1, device: 'MacBook Pro 16"', location: 'San Francisco, USA', app: 'Chrome Browser',    time: 'Active now',  DeviceIcon: Laptop,     current: true  },
        { id: 2, device: 'iPhone 15 Pro',   location: 'London, UK',         app: 'HumaneHR iOS App', time: '2 hours ago', DeviceIcon: Smartphone, current: false },
    ]);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteText, setDeleteText] = useState('');

    function toggleTwoFa(val) {
        setTwoFa(val); setTwoFaSaving(true);
        router.put('/settings/two-factor', { enabled: val }, {
            preserveScroll: true,
            onFinish: () => setTwoFaSaving(false),
        });
    }

    function revokeSession(id) {
        setSessions(s => s.filter(x => x.id !== id));
        router.delete(`/settings/sessions/${id}`, { preserveScroll: true });
    }

    function logoutAll() {
        router.post('/settings/sessions/logout-all', {}, {
            preserveScroll: true,
            onSuccess: () => setSessions(s => s.filter(x => x.current)),
        });
    }

    function handleChangePassword() {
        setPwSaving(true); setPwErrors({});
        router.put('/settings/password', pwForm, {
            preserveScroll: true,
            onSuccess: () => {
                setPwSaved(true); setPwSaving(false);
                setPwForm({ current_password:'', password:'', password_confirmation:'' });
                setTimeout(() => setPwSaved(false), 3000);
            },
            onError: (e) => { setPwErrors(e); setPwSaving(false); },
        });
    }

    function handleDeleteAccount() {
        if (deleteText !== 'DELETE') return;
        router.delete('/settings/account', { preserveScroll: true });
    }

    return (
        <div className="max-w-3xl space-y-5">
            {/* Security */}
            <Card>
                <SectionHeader icon={Shield} title="Security Settings" />

                {/* 2FA */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-5">
                    <div>
                        <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {twoFa ? '✅ Aktif — akun kamu lebih aman' : 'Tambahkan keamanan ekstra menggunakan TOTP apps.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {twoFaSaving && <span className="w-4 h-4 border-2 border-blue-400/40 border-t-blue-500 rounded-full animate-spin" />}
                        <ToggleSwitch checked={twoFa} onChange={toggleTwoFa} />
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-medium text-slate-700">Active Sessions</p>
                    <button onClick={logoutAll} className="text-xs text-red-500 hover:text-red-700 transition flex items-center gap-1">
                        <LogOut size={12} /> Logout from all devices
                    </button>
                </div>
                <div className="space-y-2">
                    {sessions.map(s => (
                        <div key={s.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                            <s.DeviceIcon size={20} className="text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700">{s.device} · {s.location}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{s.app} · {s.time}</p>
                            </div>
                            {s.current
                                ? <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">Current</span>
                                : <button onClick={() => revokeSession(s.id)}
                                    className="text-slate-400 hover:text-red-500 transition" title="Revoke session">
                                    <X size={16} />
                                  </button>
                            }
                        </div>
                    ))}
                    {sessions.length === 1 && (
                        <p className="text-xs text-slate-400 text-center py-2">Tidak ada sesi aktif lainnya.</p>
                    )}
                </div>
            </Card>

            {/* Password */}
            <Card>
                <SectionHeader icon={Lock} title="Password Management" />
                <div className="space-y-4">
                    <PwFieldVisible label="Current Password"     fieldKey="current_password"
                        form={pwForm} setForm={setPwForm} errors={pwErrors}
                        show={pwShow.current} onToggle={() => setPwShow(s => ({ ...s, current: !s.current }))} />
                    <div className="grid grid-cols-2 gap-4">
                        <PwFieldVisible label="New Password"         fieldKey="password"
                            form={pwForm} setForm={setPwForm} errors={pwErrors}
                            show={pwShow.new} onToggle={() => setPwShow(s => ({ ...s, new: !s.new }))} />
                        <PwFieldVisible label="Confirm New Password" fieldKey="password_confirmation"
                            form={pwForm} setForm={setPwForm} errors={pwErrors}
                            show={pwShow.confirm} onToggle={() => setPwShow(s => ({ ...s, confirm: !s.confirm }))} />
                    </div>
                </div>
                {pwSaved && <SuccessBanner text="Password berhasil diubah!" />}
                <div className="flex justify-end mt-5">
                    <PrimaryBtn onClick={handleChangePassword} loading={pwSaving} done={pwSaved} label="Change Password" />
                </div>
            </Card>

            {/* Danger Zone */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={17} className="text-red-500" />
                    <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
                </div>
                <div className="p-4 border border-red-100 bg-red-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-700">Delete Account</p>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                        Tindakan ini tidak dapat dibatalkan. Semua data kamu akan dihapus permanen.
                    </p>
                    {!showDeleteConfirm ? (
                        <button onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition">
                            Delete My Account
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-red-600 font-medium">Ketik <strong>DELETE</strong> untuk konfirmasi:</p>
                            <input value={deleteText} onChange={e => setDeleteText(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-red-300 text-sm focus:outline-none focus:border-red-500"
                                placeholder="DELETE" />
                            <div className="flex gap-2">
                                <button onClick={handleDeleteAccount}
                                    disabled={deleteText !== 'DELETE'}
                                    className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg disabled:opacity-40 hover:bg-red-700 transition">
                                    Konfirmasi Hapus
                                </button>
                                <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-gray-50 transition">
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   TAB: NOTIFICATIONS
   - Toggle per kategori notifikasi
   - Pilih channel (email, push, in-app)
══════════════════════════════════════════════════ */
function NotificationsTab({ user }) {
    const [prefs, setPrefs] = useState(
        user.notification_preferences ?? {
            checkin: true, late: true, absent: true, auto_checkout: true,
        }
    );
    const [channels, setChannels] = useState({
        email: true, push: true, in_app: true,
    });
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);

    function handleSave() {
        setSaving(true);
        router.put('/settings/notifications', { ...prefs, channels }, {
            preserveScroll: true,
            onSuccess: () => { setSaved(true); setSaving(false); setTimeout(() => setSaved(false), 3000); },
            onError:   () => setSaving(false),
        });
    }

    const notifItems = [
        { key: 'checkin',       label: 'Check-in Notifications', desc: 'Notified when employees check in'          },
        { key: 'late',          label: 'Late Arrival Alerts',    desc: 'Alert when employee arrives late'          },
        { key: 'absent',        label: 'Absence Alerts',         desc: 'Alert when employee is absent'             },
        { key: 'auto_checkout', label: 'Auto Checkout',          desc: 'Notify on automatic checkout at shift end' },
    ];

    const channelItems = [
        { key: 'email',  label: 'Email Notifications',    desc: 'Receive notifications via email'     },
        { key: 'push',   label: 'Push Notifications',     desc: 'Browser/device push notifications'   },
        { key: 'in_app', label: 'In-App Notifications',   desc: 'Show badge & alerts inside the app'  },
    ];

    return (
        <div className="max-w-3xl space-y-5">
            <Card>
                <SectionHeader icon={Bell} title="Notification Preferences" />
                <div className="space-y-3">
                    {notifItems.map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                            <div>
                                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                            </div>
                            <ToggleSwitch checked={prefs[item.key] ?? false}
                                onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <SectionHeader icon={ToggleLeft} title="Notification Channels" />
                <div className="space-y-3">
                    {channelItems.map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                            <div>
                                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                            </div>
                            <ToggleSwitch checked={channels[item.key] ?? false}
                                onChange={v => setChannels(p => ({ ...p, [item.key]: v }))} />
                        </div>
                    ))}
                </div>

                {saved && <SuccessBanner text="Preferensi notifikasi disimpan!" />}

                <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
                    <PrimaryBtn onClick={handleSave} loading={saving} done={saved} label="Save Preferences" />
                </div>
            </Card>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   TAB: PRIVACY
   - Visibility settings
   - Data export
   - Activity log
══════════════════════════════════════════════════ */
function PrivacyTab({ user }) {
    const [visibility, setVisibility] = useState({
        profile_visible:   user.privacy?.profile_visible   ?? true,
        show_email:        user.privacy?.show_email        ?? false,
        show_phone:        user.privacy?.show_phone        ?? false,
        show_last_active:  user.privacy?.show_last_active  ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);
    const [exporting, setExporting] = useState(false);

    function handleSave() {
        setSaving(true);
        router.put('/settings/privacy', visibility, {
            preserveScroll: true,
            onSuccess: () => { setSaved(true); setSaving(false); setTimeout(() => setSaved(false), 3000); },
            onError:   () => setSaving(false),
        });
    }

    function handleExport() {
        setExporting(true);
        setTimeout(() => {
            window.location.href = '/settings/export-data';
            setExporting(false);
        }, 800);
    }

    const visibilityItems = [
        { key: 'profile_visible',  label: 'Profile Visibility',      desc: 'Allow other users to view your profile'   },
        { key: 'show_email',       label: 'Show Email Address',       desc: 'Display your email to other team members' },
        { key: 'show_phone',       label: 'Show Phone Number',        desc: 'Display your phone to other team members' },
        { key: 'show_last_active', label: 'Show Last Active Status',  desc: 'Show when you were last active'           },
    ];

    return (
        <div className="max-w-3xl space-y-5">
            <Card>
                <SectionHeader icon={Shield} title="Privacy & Visibility" />
                <div className="space-y-3">
                    {visibilityItems.map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                            <div>
                                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                            </div>
                            <ToggleSwitch checked={visibility[item.key] ?? false}
                                onChange={v => setVisibility(p => ({ ...p, [item.key]: v }))} />
                        </div>
                    ))}
                </div>

                {saved && <SuccessBanner text="Pengaturan privasi disimpan!" />}

                <div className="flex justify-end mt-5 pt-5 border-t border-gray-100">
                    <PrimaryBtn onClick={handleSave} loading={saving} done={saved} label="Save Privacy Settings" />
                </div>
            </Card>

            {/* Data Export */}
            <Card>
                <SectionHeader icon={Download} title="Data & Export" />
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Download Your Data</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Export semua data akunmu dalam format JSON. Termasuk profil, riwayat absen, dan preferensi.
                        </p>
                    </div>
                    <button onClick={handleExport} disabled={exporting}
                        className="flex-shrink-0 px-4 py-2 text-xs font-medium text-white rounded-lg transition disabled:opacity-60 flex items-center gap-2"
                        style={{ background: '#2d6a9f' }}>
                        {exporting
                            ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : <Download size={13} />
                        }
                        {exporting ? 'Menyiapkan…' : 'Export Data'}
                    </button>
                </div>
            </Card>

            {/* Activity log */}
            <Card>
                <SectionHeader icon={Clock} title="Recent Activity Log" />
                <div className="space-y-2">
                    {[
                        { action: 'Login berhasil',         time: '2 minutes ago', icon: '✅', ip: '192.168.1.1',  loc: 'Jakarta, ID' },
                        { action: 'Password diubah',        time: '3 days ago',    icon: '🔑', ip: '192.168.1.1',  loc: 'Jakarta, ID' },
                        { action: 'Profil diperbarui',      time: '1 week ago',    icon: '✏️', ip: '103.12.55.1',  loc: 'Bandung, ID' },
                        { action: 'Login dari device baru', time: '2 weeks ago',   icon: '📱', ip: '8.8.8.8',      loc: 'London, UK'  },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                            <span className="text-base">{log.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700">{log.action}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1"><MapPin size={10}/>{log.loc}</span>
                                    <span className="flex items-center gap-1"><Wifi size={10}/>{log.ip}</span>
                                    <span className="flex items-center gap-1"><Clock size={10}/>{log.time}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   THEME ENGINE
   Inject <style> ke <head> dan simpan ke localStorage.
   Tidak perlu Tailwind darkMode config — pakai CSS vars.
══════════════════════════════════════════════════ */
const THEMES = {
    light: {
        '--bg-app':      '#f8fafc',
        '--bg-card':     '#ffffff',
        '--bg-sidebar':  '#BFDDF0',
        '--text-main':   '#1e293b',
        '--text-sub':    '#64748b',
        '--border':      '#e2e8f0',
        '--bg-hover':    '#f1f5f9',
        '--bg-input':    '#ffffff',
        '--bg-nav-active': '#ffffff',
    },
    dark: {
        '--bg-app':      '#0f172a',
        '--bg-card':     '#1e293b',
        '--bg-sidebar':  '#1e3a5f',
        '--text-main':   '#f1f5f9',
        '--text-sub':    '#94a3b8',
        '--border':      '#334155',
        '--bg-hover':    '#334155',
        '--bg-input':    '#1e293b',
        '--bg-nav-active': '#0f172a',
    },
};

function applyTheme(theme) {
    const vars = THEMES[theme] ?? THEMES.light;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', theme);
}

function loadSavedPrefs() {
    try { return JSON.parse(localStorage.getItem('humane_sys_prefs') ?? '{}'); }
    catch { return {}; }
}

/* Jalankan tema saat halaman pertama load */
if (typeof window !== 'undefined') {
    applyTheme(loadSavedPrefs().theme ?? 'light');
}

/* ══════════════════════════════════════════════════
   TAB: SYSTEM
══════════════════════════════════════════════════ */
function SystemTab() {
    const saved0     = loadSavedPrefs();
    const [theme,    setThemeState] = useState(saved0.theme    ?? 'light');
    const [lang,     setLang]       = useState(saved0.lang     ?? 'en-US');
    const [dateFmt,  setDateFmt]    = useState(saved0.dateFmt  ?? 'DD/MM/YYYY');
    const [timezone, setTimezone]   = useState(saved0.timezone ?? 'Asia/Jakarta');
    const [saved,    setSaved]      = useState(false);

    /* Terapkan tema langsung saat tombol diklik — tanpa tunggu Save */
    function handleThemeClick(t) {
        setThemeState(t);
        applyTheme(t);
    }

    function handleSave() {
        const prefs = { theme, lang, dateFmt, timezone };
        localStorage.setItem('humane_sys_prefs', JSON.stringify(prefs));
        applyTheme(theme);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    const isDark = theme === 'dark';

    return (
        <div className="max-w-3xl space-y-5">
            <Card>
                <SectionHeader icon={Monitor} title="System Preferences" />

                {/* ── Visual Theme ── */}
                <div className="mb-6">
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-main)' }}>Visual Theme</p>
                    <div className="flex gap-4">
                        {/* Light card */}
                        <button
                            onClick={() => handleThemeClick('light')}
                            style={{
                                flex: 1,
                                border: !isDark ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                                background: !isDark ? '#eff6ff' : '#ffffff',
                                borderRadius: '14px',
                                padding: '20px 12px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                            {/* Mini preview light */}
                            <div style={{ width: 80, height: 52, borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ height: 14, background: '#BFDDF0', display: 'flex', alignItems: 'center', padding: '0 6px', gap: 3 }}>
                                    {[1,2,3].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#93c5fd' }}/>)}
                                </div>
                                <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <div style={{ height: 5, borderRadius: 3, background: '#cbd5e1', width: '80%' }}/>
                                    <div style={{ height: 5, borderRadius: 3, background: '#e2e8f0', width: '60%' }}/>
                                    <div style={{ height: 5, borderRadius: 3, background: '#e2e8f0', width: '70%' }}/>
                                </div>
                            </div>
                            <Sun size={18} color={!isDark ? '#3b82f6' : '#94a3b8'} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: !isDark ? '#1d4ed8' : '#64748b' }}>Light Mode</span>
                            {!isDark && <span style={{ fontSize: 10, color: '#3b82f6', fontWeight: 600 }}>✓ Active</span>}
                        </button>

                        {/* Dark card */}
                        <button
                            onClick={() => handleThemeClick('dark')}
                            style={{
                                flex: 1,
                                border: isDark ? '2px solid #3b82f6' : '2px solid #334155',
                                background: '#0f172a',
                                borderRadius: '14px',
                                padding: '20px 12px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                            {/* Mini preview dark */}
                            <div style={{ width: 80, height: 52, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', overflow: 'hidden' }}>
                                <div style={{ height: 14, background: '#1e3a5f', display: 'flex', alignItems: 'center', padding: '0 6px', gap: 3 }}>
                                    {[1,2,3].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#3b82f6' }}/>)}
                                </div>
                                <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <div style={{ height: 5, borderRadius: 3, background: '#334155', width: '80%' }}/>
                                    <div style={{ height: 5, borderRadius: 3, background: '#1e293b', width: '60%' }}/>
                                    <div style={{ height: 5, borderRadius: 3, background: '#1e293b', width: '70%' }}/>
                                </div>
                            </div>
                            <Moon size={18} color={isDark ? '#60a5fa' : '#64748b'} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#60a5fa' : '#94a3b8' }}>Dark Mode</span>
                            {isDark && <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 600 }}>✓ Active</span>}
                        </button>
                    </div>

                    {/* Live preview label */}
                    <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 8, textAlign: 'center' }}>
                        Preview langsung — klik untuk mencoba, lalu Save untuk menyimpan.
                    </p>
                </div>

                {/* ── Language + Date + Timezone ── */}
                <div className="grid grid-cols-2 gap-5">
                    <SelectField label="Default Language" value={lang} onChange={setLang}
                        icon={Globe} options={[
                            { value: 'en-US', label: 'English (United States)' },
                            { value: 'id-ID', label: 'Bahasa Indonesia'        },
                            { value: 'en-GB', label: 'English (United Kingdom)'},
                        ]} hint="Changes interface language across platform." />

                    <SelectField label="Date Format" value={dateFmt} onChange={setDateFmt}
                        icon={Clock} options={[
                            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
                        ]} />

                    <SelectField label="Timezone" value={timezone} onChange={setTimezone}
                        icon={MapPin} options={[
                            { value: 'Asia/Jakarta',  label: 'WIB — Jakarta (UTC+7)'   },
                            { value: 'Asia/Makassar', label: 'WITA — Makassar (UTC+8)' },
                            { value: 'Asia/Jayapura', label: 'WIT — Jayapura (UTC+9)'  },
                            { value: 'UTC',           label: 'UTC+0'                    },
                        ]} />
                </div>

                {saved && <SuccessBanner text="Preferensi sistem berhasil disimpan!" />}

                <div className="flex justify-end mt-6 pt-5 border-t border-gray-100">
                    <PrimaryBtn onClick={handleSave} loading={false} done={saved} label="Save System Settings" />
                </div>
            </Card>

            {/* CSS Variables injector — apply ke seluruh app */}
            <style>{`
                * { transition: background-color 0.3s ease, color 0.2s ease, border-color 0.2s ease; }
                body  { background: var(--bg-app, #f8fafc) !important; }
                [data-theme="dark"] .bg-white    { background: var(--bg-card)   !important; }
                [data-theme="dark"] .bg-gray-50  { background: var(--bg-hover)  !important; }
                [data-theme="dark"] .bg-gray-100 { background: var(--bg-hover)  !important; }
                [data-theme="dark"] .text-slate-800, [data-theme="dark"] .text-slate-700 { color: var(--text-main) !important; }
                [data-theme="dark"] .text-slate-500, [data-theme="dark"] .text-slate-400 { color: var(--text-sub)  !important; }
                [data-theme="dark"] .border-gray-100, [data-theme="dark"] .border-gray-200 { border-color: var(--border) !important; }
                [data-theme="dark"] input, [data-theme="dark"] select { background: var(--bg-input) !important; color: var(--text-main) !important; border-color: var(--border) !important; }
                [data-theme="dark"] aside { background: var(--bg-sidebar) !important; }
            `}</style>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   SHARED UI COMPONENTS
══════════════════════════════════════════════════ */
function Card({ children }) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">{children}</div>;
}

function SectionHeader({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-5">
            <Icon size={17} className="text-slate-600" />
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        </div>
    );
}

function SuccessBanner({ text }) {
    return (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl mt-4">
            <CheckCircle2 size={15} /> {text}
        </div>
    );
}

function PrimaryBtn({ onClick, loading, done, label }) {
    return (
        <button onClick={onClick} disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-60 flex items-center gap-2"
            style={{ background: '#2d6a9f' }}>
            {loading
                ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : done ? <CheckCircle2 size={14} /> : null
            }
            {loading ? 'Saving…' : done ? 'Saved!' : label}
        </button>
    );
}

function FormField({ label, value, onChange, type = 'text', error }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
            <input type={type} value={value} placeholder={label} onChange={e => onChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none transition bg-white ${
                    error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                }`} />
            {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
        </div>
    );
}

function PwFieldVisible({ label, fieldKey, form, setForm, errors, show, onToggle }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
            <div className="relative">
                <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form[fieldKey]}
                    onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition bg-white ${
                        errors[fieldKey] ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                    }`} />
                <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
            {errors[fieldKey] && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} /> {errors[fieldKey]}</p>}
        </div>
    );
}

function SelectField({ label, value, onChange, icon: Icon, options, hint }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
            <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select value={value} onChange={e => onChange(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-400 appearance-none cursor-pointer">
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
            </div>
            {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
        </div>
    );
}

function ToggleSwitch({ checked, onChange }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className="w-11 h-6 rounded-full bg-gray-200 peer-checked:bg-blue-500 transition-colors
                after:content-[''] after:absolute after:top-0.5 after:left-0.5
                after:bg-white after:rounded-full after:h-5 after:w-5
                after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
        </label>
    );
}