import { useEffect, useState, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import Sidebar, { MobileBottomNav } from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import QRCode from 'qrcode';
import {
    LogIn, LogOut, MapPin, Clock, Calendar, CheckCircle2,
    AlertCircle, XCircle, Camera, RefreshCw, ChevronRight,
    MoreVertical, Wifi, ShieldCheck, User, Fingerprint,
    Timer, Building2, CameraOff, Navigation, Radio,
    BellRing, Zap, Signal
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');

const statusBadge = (s) => {
    const map = {
        on_time:  { label: 'On Time',  color: '#22C55E', bg: '#f0fdf4' },
        late:     { label: 'Late',     color: '#f59e0b', bg: '#fffbeb' },
        pending:  { label: 'Pending',  color: '#94a3b8', bg: '#f8fafc' },
        complete: { label: 'Complete', color: '#22C55E', bg: '#f0fdf4' },
    };
    return map[s] ?? { label: 'Unknown', color: '#94a3b8', bg: '#f8fafc' };
};

const typeLabel = (t) => {
    if (t === 'check_in')      return 'Check In';
    if (t === 'check_out')     return 'Check Out';
    if (t === 'auto_checkout') return 'Auto Checkout';
    return t;
};

/**
 * Hitung jarak antara dua koordinat (meter) menggunakan formula Haversine
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Parse jam shift "HH:MM" → { hours, minutes }
 */
const parseShiftTime = (str) => {
    const [h, m] = (str ?? '00:00').split(':').map(Number);
    return { hours: h || 0, minutes: m || 0 };
};

/* ─── main component ──────────────────────────────────────── */
export default function Attendance({ employee, todayAttendance, todayHistory }) {
    const [time, setTime]               = useState(new Date());
    const [location, setLocation]       = useState(null);
    const [locLoading, setLocLoading]   = useState(false);
    const [locAccuracy, setLocAccuracy] = useState(null);
    const [trackingActive, setTrackingActive] = useState(false);
    const [processing, setProcessing]   = useState(false);
    const [flash, setFlash]             = useState(null);
    const [qrDataUrl, setQrDataUrl]     = useState('');
    const [camActive, setCamActive]     = useState(false);
    const [camError, setCamError]       = useState(false);
    const [mapLoaded, setMapLoaded]     = useState(false);
    const [autoMode, setAutoMode]       = useState(true);       // auto check-in/out aktif?
    const [autoLog, setAutoLog]         = useState([]);         // log event auto
    const [inOfficeZone, setInOfficeZone] = useState(null);     // null=belum tahu, true/false

    const videoRef      = useRef(null);
    const streamRef     = useRef(null);
    const mapRef        = useRef(null);
    const mapInstance   = useRef(null);
    const markerRef     = useRef(null);
    const watchIdRef    = useRef(null);       // ID dari watchPosition
    const autoCheckedIn = useRef(false);      // sudah auto check-in hari ini?
    const autoCheckedOut= useRef(false);      // sudah auto check-out hari ini?

    // Koordinat kantor (bisa diambil dari props employee jika tersedia)
    const OFFICE_LAT    = employee?.office_latitude  ?? -6.2088;
    const OFFICE_LNG    = employee?.office_longitude ?? 106.8456;
    const OFFICE_RADIUS = employee?.geofence_radius  ?? 100;     // meter

    /* ── clock ── */
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    /* ── QR code (rotate per menit) ── */
    useEffect(() => {
        const generate = async () => {
            const token  = employee?.attendance_token ?? employee?.id ?? 'EMP001';
            const minute = `${time.getFullYear()}${pad(time.getMonth()+1)}${pad(time.getDate())}${pad(time.getHours())}${pad(time.getMinutes())}`;
            const payload = JSON.stringify({ token, ts: minute });
            try {
                const url = await QRCode.toDataURL(payload, {
                    width: 220, margin: 2,
                    color: { dark: '#1e293b', light: '#ffffff' },
                });
                setQrDataUrl(url);
            } catch (_) {}
        };
        generate();
    }, [employee, time.getMinutes()]);

    /* ── Auto check-in / check-out watcher (setiap detik) ── */
    useEffect(() => {
        if (!autoMode) return;

        const shiftStart  = parseShiftTime(employee?.shift_start ?? '08:00');
        const shiftEnd    = parseShiftTime(employee?.shift_end   ?? '17:00');
        const gracePeriod = employee?.grace_period ?? 15;        // menit toleransi

        const checkAutoAttendance = () => {
            const now   = new Date();
            const h     = now.getHours();
            const m     = now.getMinutes();
            const totalMin = h * 60 + m;

            const startMin  = shiftStart.hours * 60 + shiftStart.minutes;
            const endMin    = shiftEnd.hours   * 60 + shiftEnd.minutes;
            const lateLimit = startMin + gracePeriod;

            // AUTO CHECK-IN: saat jam shift tiba, belum check-in, belum auto check-in hari ini
            if (
                autoMode &&
                !autoCheckedIn.current &&
                !checkedIn &&
                totalMin >= startMin &&
                totalMin <= lateLimit + 60   // masih masuk akal (max 1 jam setelah batas terlambat)
            ) {
                autoCheckedIn.current = true;
                addAutoLog('check_in', `Auto Check-In pada ${now.toLocaleTimeString('id-ID')}`);
                postAttendance('/attendance/check-in', 'Auto Check-In berhasil! ⚡');
            }

            // AUTO CHECK-OUT: saat jam akhir shift, sudah check-in, belum check-out
            if (
                autoMode &&
                !autoCheckedOut.current &&
                checkedIn &&
                !checkedOut &&
                totalMin >= endMin
            ) {
                autoCheckedOut.current = true;
                addAutoLog('check_out', `Auto Check-Out pada ${now.toLocaleTimeString('id-ID')}`);
                postAttendance('/attendance/check-out', 'Auto Check-Out berhasil! ⚡');
            }
        };

        const interval = setInterval(checkAutoAttendance, 1000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoMode, location]);

    const addAutoLog = (type, msg) => {
        setAutoLog(prev => [{ type, msg, ts: new Date().toLocaleTimeString('id-ID') }, ...prev].slice(0, 5));
    };

    /* ── GPS tracking realtime (watchPosition) ── */
    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setFlash({ type: 'error', msg: 'Geolocation tidak didukung browser ini.' });
            return;
        }
        setLocLoading(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                setLocAccuracy(Math.round(accuracy));
                setLocLoading(false);
                setTrackingActive(true);

                const newLoc = { latitude, longitude, name: employee?.work_location ?? 'HQ Office, Jakarta' };
                setLocation(newLoc);

                // Cek apakah di dalam zona kantor
                const dist = haversineDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
                setInOfficeZone(dist <= OFFICE_RADIUS);

                // Update marker di map jika sudah loaded
                if (mapInstance.current && markerRef.current) {
                    const pos2 = { lat: latitude, lng: longitude };
                    markerRef.current.setPosition(pos2);
                    mapInstance.current.panTo(pos2);
                }
            },
            (err) => {
                setLocLoading(false);
                // Fallback ke koordinat kantor jika GPS gagal
                setLocation({ latitude: OFFICE_LAT, longitude: OFFICE_LNG, name: 'HQ Office (Fallback)' });
                setFlash({ type: 'error', msg: `GPS error: ${err.message}` });
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,     // cache 10 detik
                timeout: 15000,
            }
        );
    }, [OFFICE_LAT, OFFICE_LNG, OFFICE_RADIUS, employee]);

    const stopTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTrackingActive(false);
    }, []);

    // Mulai tracking otomatis saat mount, stop saat unmount
    useEffect(() => {
        startTracking();
        return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Google Maps embed ── */
    useEffect(() => {
        if (!location || mapLoaded) return;
        const loadMap = () => {
            if (!window.google || !mapRef.current) return;
            const center = { lat: location.latitude, lng: location.longitude };
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center, zoom: 17,
                styles: [
                    { elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
                    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
                    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d1fae5' }] },
                ],
                disableDefaultUI: true, zoomControl: true,
            });

            // Marker posisi karyawan (bergerak)
            markerRef.current = new window.google.maps.Marker({
                position: center,
                map: mapInstance.current,
                title: 'Posisi Anda',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                },
            });

            // Lingkaran geofence kantor
            new window.google.maps.Circle({
                map: mapInstance.current,
                center: { lat: OFFICE_LAT, lng: OFFICE_LNG },
                radius: OFFICE_RADIUS,
                fillColor: '#22C55E',
                fillOpacity: 0.12,
                strokeColor: '#22C55E',
                strokeOpacity: 0.5,
                strokeWeight: 2,
            });

            // Marker kantor
            new window.google.maps.Marker({
                position: { lat: OFFICE_LAT, lng: OFFICE_LNG },
                map: mapInstance.current,
                title: 'Kantor',
                icon: {
                    path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 6,
                    fillColor: '#22C55E',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                },
            });

            setMapLoaded(true);
        };

        if (window.google) {
            loadMap();
        } else if (!document.getElementById('gmaps-sdk')) {
            const s = document.createElement('script');
            s.id = 'gmaps-sdk';
            const apiKey = window.__GMAPS_KEY__ ?? 'YOUR_GOOGLE_MAPS_API_KEY';
            s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapsReady`;
            s.async = true; s.defer = true;
            window.__gmapsReady = loadMap;
            document.head.appendChild(s);
        } else {
            window.__gmapsReady = loadMap;
        }
    }, [location, OFFICE_LAT, OFFICE_LNG, OFFICE_RADIUS]);

    /* ── Camera ── */
    const startCamera = useCallback(async () => {
        setCamError(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setCamActive(true);
        } catch (_) { setCamError(true); }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setCamActive(false);
    }, []);

    useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

    /* ── Post ke server ── */
    const postAttendance = useCallback((url, msg) => {
        setProcessing(true);
        router.post(url, {
            latitude:  location?.latitude,
            longitude: location?.longitude,
            location:  location?.name,
        }, {
            onSuccess: () => { setFlash({ type: 'success', msg }); setProcessing(false); },
            onError:   (e) => { setFlash({ type: 'error', msg: Object.values(e)[0] }); setProcessing(false); },
        });
    }, [location]);

    const checkedIn  = !!todayAttendance?.check_in_at;
    const checkedOut = !!todayAttendance?.check_out_at;

    const currentStatus = () => {
        if (!checkedIn) return { text: 'Belum Check In', color: '#EF4444', bg: '#fef2f2', Icon: AlertCircle };
        if (checkedIn && !checkedOut) {
            const late = todayAttendance?.status === 'late';
            return { text: late ? 'Terlambat' : 'Sudah Check In', color: late ? '#f59e0b' : '#22C55E', bg: late ? '#fffbeb' : '#f0fdf4', Icon: late ? AlertCircle : CheckCircle2 };
        }
        return { text: 'Sudah Check Out', color: '#64748b', bg: '#f8fafc', Icon: XCircle };
    };
    const status = currentStatus();

    /* ─── Render ──────────────────────────────────────────── */
    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF9D2', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Sora:wght@600;700&display=swap');
                .btn-ci   { background: #BFDDF0; }
                .btn-co   { background: #FFEBCC; }
                .btn-dis  { background: #e2e8f0; opacity: 0.55; }
                .cam-ring { box-shadow: 0 0 0 3px #3b82f640; }
                @keyframes pulseRing {
                    0%   { transform: scale(1);   opacity: 0.8; }
                    100% { transform: scale(1.6); opacity: 0;   }
                }
                .pulse-ring::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: currentColor;
                    animation: pulseRing 1.4s ease-out infinite;
                }
            `}</style>

            <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <TopBar title="Attendance Management" />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-16 lg:pb-0">

                    {/* ── Flash ── */}
                    {flash && (
                        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${flash.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {flash.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                            {flash.msg}
                            <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setFlash(null)}><XCircle size={14}/></button>
                        </div>
                    )}

                    {/* ── Auto Mode Banner ── */}
                    <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 text-sm transition-all ${autoMode ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-200'}`}>
                        <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-white flex-shrink-0 ${autoMode ? 'text-blue-500' : 'text-slate-400'}`}>
                            <Zap size={16} className={autoMode ? 'text-blue-500' : 'text-slate-400'}/>
                        </div>
                        <div className="flex-1">
                            <span className={`font-semibold ${autoMode ? 'text-blue-700' : 'text-slate-600'}`}>
                                Auto Attendance {autoMode ? 'Aktif' : 'Nonaktif'}
                            </span>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {autoMode
                                    ? `Akan otomatis Check-In pukul ${employee?.shift_start ?? '08:00'} dan Check-Out pukul ${employee?.shift_end ?? '17:00'}`
                                    : 'Aktifkan untuk check-in & check-out otomatis sesuai jadwal shift'}
                            </p>
                        </div>
                        <button
                            onClick={() => setAutoMode(p => !p)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${autoMode ? 'bg-blue-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoMode ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">

                        {/* ── LEFT / MAIN ── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Clock + buttons */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                                <div className="text-5xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-1px' }}>
                                    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                                <div className="text-slate-500 mb-6 flex items-center justify-center gap-1.5">
                                    <Calendar size={14}/>
                                    {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>

                                <div className="flex gap-3 justify-center mb-6">
                                    <button
                                        onClick={() => postAttendance('/attendance/check-in', 'Check In berhasil!')}
                                        disabled={checkedIn || processing}
                                        className={`flex-1 max-w-xs py-3.5 rounded-xl font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 ${checkedIn ? 'btn-dis' : 'btn-ci hover:brightness-95'}`}
                                    >
                                        <LogIn size={18}/> Check In
                                    </button>
                                    <button
                                        onClick={() => postAttendance('/attendance/check-out', 'Check Out berhasil!')}
                                        disabled={!checkedIn || checkedOut || processing}
                                        className={`flex-1 max-w-xs py-3.5 rounded-xl font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 ${(!checkedIn || checkedOut) ? 'btn-dis' : 'btn-co hover:brightness-95'}`}
                                    >
                                        <LogOut size={18}/> Check Out
                                    </button>
                                </div>

                                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: status.bg, color: status.color, border: `1px solid ${status.color}20` }}>
                                    <status.Icon size={15}/>
                                    <span className="text-xs font-semibold tracking-widest opacity-60">CURRENT STATUS</span>
                                    <span className="font-bold">{status.text}</span>
                                </div>
                            </div>

                            {/* ── Live Location Tracker Card ── */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <Navigation size={16} className="text-slate-400"/> Work Location
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {/* Indikator tracking live */}
                                        {trackingActive && (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"/>
                                                </span>
                                                Live Tracking
                                            </span>
                                        )}
                                        {locLoading && <RefreshCw size={14} className="animate-spin text-slate-400"/>}
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin size={12}/> {employee?.work_location ?? 'HQ Office, Jakarta'}
                                        </span>
                                    </div>
                                </div>

                                {/* Map */}
                                <div ref={mapRef} className="h-56 w-full relative" style={{ background: '#e2e8f0' }}>
                                    {locLoading && !mapLoaded && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50">
                                            <RefreshCw size={22} className="animate-spin"/>
                                            <span className="text-xs">Mendapatkan lokasi GPS…</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status bar bawah map */}
                                <div className="p-3 flex flex-wrap items-center gap-3 text-xs border-t border-slate-50">
                                    {/* Zone status */}
                                    {inOfficeZone !== null && (
                                        <span className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full ${inOfficeZone ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                            <ShieldCheck size={12}/>
                                            {inOfficeZone ? 'Di dalam area kantor' : 'Di luar area kantor'}
                                        </span>
                                    )}
                                    {/* Koordinat */}
                                    {location && (
                                        <span className="text-slate-400 font-mono">
                                            {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
                                        </span>
                                    )}
                                    {/* Akurasi GPS */}
                                    {locAccuracy !== null && (
                                        <span className="flex items-center gap-1 text-slate-400">
                                            <Signal size={11}/> ±{locAccuracy}m
                                        </span>
                                    )}
                                    {/* Toggle tracking */}
                                    <button
                                        onClick={trackingActive ? stopTracking : startTracking}
                                        className={`ml-auto flex items-center gap-1 px-2 py-1 rounded-full font-medium transition ${trackingActive ? 'text-red-500 hover:bg-red-50' : 'text-blue-500 hover:bg-blue-50'}`}
                                    >
                                        <Radio size={11}/>
                                        {trackingActive ? 'Stop Tracking' : 'Mulai Tracking'}
                                    </button>
                                </div>
                            </div>

                            {/* ── Auto Attendance Log ── */}
                            {autoLog.length > 0 && (
                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <BellRing size={15} className="text-blue-400"/> Log Auto Attendance
                                    </h3>
                                    <div className="space-y-2">
                                        {autoLog.map((log, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-blue-50 text-blue-700">
                                                {log.type === 'check_in' ? <LogIn size={12}/> : <LogOut size={12}/>}
                                                <span>{log.msg}</span>
                                                <span className="ml-auto text-blue-400 font-mono">{log.ts}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Today's Log ── */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Clock size={16} className="text-slate-400"/> Today's Log</h3>
                                    <a href="/history" className="text-sm text-blue-500 hover:underline flex items-center gap-1">View Full History <ChevronRight size={14}/></a>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-slate-400 uppercase">
                                            {['Type','Time','Location','Status','Action'].map(h => (
                                                <th key={h} className="text-left pb-3 font-medium">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(todayHistory ?? []).map(h => {
                                            const badge = statusBadge(h.status);
                                            return (
                                                <tr key={h.id}>
                                                    <td className="py-3 text-slate-700">
                                                        <span className="flex items-center gap-2">
                                                            {h.type === 'check_in' ? <LogIn size={14} className="text-blue-400"/> : <LogOut size={14} className="text-orange-400"/>}
                                                            {typeLabel(h.type)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-slate-600">{h.time}</td>
                                                    <td className="py-3 text-slate-600">
                                                        <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-300"/>{h.location ?? '—'}</span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                                                    </td>
                                                    <td className="py-3 text-slate-300"><MoreVertical size={16}/></td>
                                                </tr>
                                            );
                                        })}
                                        {(!todayHistory || todayHistory.length === 0) && (
                                            <tr><td colSpan={5} className="py-6 text-center text-slate-400">No attendance logged today.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL ── */}
                        <div className="space-y-4">

                            {/* QR Code */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                                    <Fingerprint size={16} className="text-slate-400"/> QR Code Saya
                                </h3>
                                <p className="text-xs text-slate-400 mb-4">Scan QR code ini di perangkat pemindai kantor</p>
                                <div className="rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 p-3">
                                    {qrDataUrl
                                        ? <img src={qrDataUrl} alt="QR Code Absensi" className="w-full max-w-[220px] aspect-square rounded-lg"/>
                                        : <div className="w-[220px] h-[220px] flex items-center justify-center text-slate-300 animate-pulse"><Fingerprint size={48}/></div>
                                    }
                                </div>
                                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                    <Wifi size={12}/> Auto-refresh setiap menit
                                </div>
                            </div>

                            {/* Camera */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                                    <Camera size={16} className="text-slate-400"/> Verifikasi Wajah
                                </h3>
                                <p className="text-xs text-slate-400 mb-3">Aktifkan kamera untuk verifikasi identitas</p>
                                <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center relative">
                                    <video ref={videoRef} autoPlay playsInline muted
                                        className="w-full h-full object-cover"
                                        style={{ display: camActive ? 'block' : 'none' }}
                                    />
                                    {!camActive && !camError && (
                                        <div className="text-center text-slate-500">
                                            <User size={36} className="mx-auto mb-2 opacity-30"/>
                                            <span className="text-xs">Kamera tidak aktif</span>
                                        </div>
                                    )}
                                    {camError && (
                                        <div className="text-center text-red-400 px-4">
                                            <CameraOff size={32} className="mx-auto mb-2 opacity-60"/>
                                            <span className="text-xs">Akses kamera ditolak</span>
                                        </div>
                                    )}
                                    {camActive && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="cam-ring rounded-full border-2 border-blue-400/60" style={{ width: 90, height: 110 }}/>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    {!camActive
                                        ? <button onClick={startCamera} className="flex-1 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2" style={{ border: '1px solid #e2e8f0' }}>
                                            <Camera size={14}/> Aktifkan Kamera
                                          </button>
                                        : <button onClick={stopCamera} className="flex-1 py-2 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2" style={{ border: '1px solid #fecaca' }}>
                                            <CameraOff size={14}/> Matikan Kamera
                                          </button>
                                    }
                                </div>
                            </div>

                            {/* Shift schedule */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <div className="text-xs font-semibold tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Timer size={13}/> SHIFT SCHEDULE</div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Shift Name</span>
                                        <span className="font-semibold text-slate-800">{employee?.shift_name ?? 'General Morning'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Hours</span>
                                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                                            <Clock size={12} className="text-slate-400"/>
                                            {employee?.shift_start ?? '08:00'} – {employee?.shift_end ?? '17:00'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Grace Period</span>
                                        <span className="font-semibold flex items-center gap-1" style={{ color: '#f59e0b' }}>
                                            <Timer size={12}/> {employee?.grace_period ?? 15} menit
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Geofence Radius</span>
                                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                                            <MapPin size={12} className="text-slate-400"/>
                                            {OFFICE_RADIUS}m
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100 bg-white flex items-center justify-center gap-1">
                    <ShieldCheck size={12}/> 2024 HumaneHR SaaS · Designed for people
                </footer>
                <MobileBottomNav />
            </div>
        </div>
    );
}