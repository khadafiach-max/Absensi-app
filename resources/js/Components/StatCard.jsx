export default function StatCard({ label, value, icon, color = '#BFDDF0' }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: color }}>
                {icon}
            </div>
        </div>
    );
}
