import { Link } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import StatCard from '@/Components/StatCard';
import { CheckCircle2, Clock, AlertCircle, LogIn, LogOut, UserPlus, FileText } from 'lucide-react';

export default function Dashboard({ auth, stats, weeklyTrend, recentActivity }) {
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h >= 4  && h < 11) return 'Selamat Pagi';
        if (h >= 11 && h < 15) return 'Selamat Siang';
        if (h >= 15 && h < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };
    const userName = auth?.user?.name ?? 'Admin';
    const maxPresent = Math.max(...(weeklyTrend?.map(d => d.present) ?? [1]));

    const statusColor = (s) => ({ on_time:'#22C55E', late:'#F59E0B', complete:'#64748B' }[s] ?? '#94A3B8');
    const statusIcon  = (s) => {
        if (s === 'on_time')  return <CheckCircle2 size={13}/>;
        if (s === 'late')     return <Clock size={13}/>;
        if (s === 'complete') return <CheckCircle2 size={13}/>;
        return <AlertCircle size={13}/>;
    };
    const statusLabel = (s) => ({ on_time:'On Time', late:'Late', complete:'Complete' }[s] ?? 'Unknown');

    const quickActions = [
        { label: 'Check In',        icon: <LogIn size={20}/>,    href: '/attendance' },
        { label: 'Check Out',       icon: <LogOut size={20}/>,   href: '/attendance' },
        { label: 'Tambah Karyawan', icon: <UserPlus size={20}/>, href: '/employees'  },
        { label: 'Riwayat',         icon: <FileText size={20}/>, href: '/history'    },
    ];

    /* StatCard tanpa icon — hanya warna background */
    const statCards = [
        { label: 'Total Karyawan', value: stats?.totalEmployees ?? 0, color: '#BFDDF0', textColor: '#4F5D6B'  },
        { label: 'Hadir Hari Ini', value: stats?.presentToday   ?? 0, color: '#DCFCE7', textColor: '#4F5D6B'  },
        { label: 'Terlambat',      value: stats?.lateToday      ?? 0, color: '#FEE2E2', textColor: '#4F5D6B'  },
        { label: 'Tidak Hadir',    value: stats?.absentToday    ?? 0, color: '#FFEBCC', textColor: '#4F5D6B'  },
    ];

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#FFF9D2', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700&display=swap');`}</style>
            <Sidebar/>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <TopBar title={`${getGreeting()}, ${userName}`}/>
                <main className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* STAT CARDS — hanya warna, tanpa icon */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map(card => (
                            <div key={card.label}
                                className="rounded-2xl p-5 flex flex-col gap-3"
                                style={{ background: card.color }}>
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{card.label}</p>
                                <p className="text-4xl font-bold" style={{ fontFamily: "'Sora',sans-serif", color: card.textColor }}>
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-slate-800">Weekly Attendance Trend</h3>
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#2d6a9f]"/> Hadir
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFEBCC', border: '1px solid #f59e0b' }}/> Terlambat
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end gap-3 h-40">
                                {(weeklyTrend ?? []).map(day => (
                                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col gap-[2px] h-[120px]">
                                            <div className="rounded-t-lg" style={{
                                                height: `${(day.late / (maxPresent || 1)) * 100}%`,
                                                background: '#f59e0b', minHeight: day.late ? 4 : 0,
                                            }}/>
                                            <div className="rounded-b-lg" style={{
                                                height: `${((day.present - day.late) / (maxPresent || 1)) * 100}%`,
                                                background: '#2d6a9f', minHeight: day.present ? 8 : 0,
                                            }}/>
                                        </div>
                                        <span className="text-xs text-slate-400">{day.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {quickActions.map(action => (
                                    <Link key={action.label} href={action.href}
                                        className="p-3 rounded-xl flex flex-col items-center gap-2 transition hover:shadow-md"
                                        style={{ background: '#f8fafc' }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#BFDDF0' }}>
                                            {action.icon}
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 text-center">{action.label}</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="rounded-xl p-3 text-xs bg-[#FFEBCC]">
                                <div className="font-semibold text-orange-700 mb-1">Update</div>
                                <div className="text-orange-600">Payroll system sync scheduled for 10 PM.</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between mb-5">
                            <h3 className="font-semibold">Recent Activity</h3>
                            <Link href="/history" className="text-sm text-blue-500 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {(recentActivity ?? []).map(activity => (
                                <div key={activity.id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                                        style={{ background: '#BFDDF0', color: '#1e5a8a' }}>
                                        {activity.name?.charAt(0)}
                                    </div>
                                    <div classtotalName="flex-1">
                                        <div className="font-medium text-slate-800 text-sm">{activity.name}</div>
                                        <div className="text-xs text-slate-400">{activity.action} • {activity.department}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-700">{activity.time}</div>
                                        <div className="flex items-center justify-end gap-1 text-xs font-medium" style={{ color: statusColor(activity.status) }}>
                                            {statusIcon(activity.status)} {statusLabel(activity.status)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!recentActivity || recentActivity.length === 0) && (
                                <p className="text-center text-slate-400 text-sm py-6">Belum ada aktivitas.</p>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="bg-white border-t py-4 text-center text-xs text-slate-400">
                    © 2024 HumaneHR SaaS
                </footer>
            </div>
        </div>
    );
}