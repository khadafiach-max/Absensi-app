<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Attendance History Report</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        h1 { font-size: 18px; color: #2d6a9f; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 11px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #BFDDF0; color: #1e5a8a; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
        tr:nth-child(even) td { background: #fafafa; }
        .badge { padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
        .present { background: #f0fdf4; color: #22C55E; }
        .late { background: #fffbeb; color: #f59e0b; }
        .absent { background: #fef2f2; color: #EF4444; }
        .footer { margin-top: 20px; font-size: 10px; color: #999; text-align: center; }
    </style>
</head>
<body>
    <h1>HumaneHR – Attendance History Report</h1>
    <p class="subtitle">Generated on {{ now()->format('d M Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Status</th>
                <th>Lokasi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($attendances as $i => $a)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $a->employee->name }}</td>
                <td>{{ $a->date->format('d M Y') }}</td>
                <td>{{ $a->check_in_at?->format('h:i A') ?? '—' }}</td>
                <td>{{ $a->check_out_at?->format('h:i A') ?? '—' }}</td>
                <td><span class="badge {{ $a->status }}">{{ ucfirst($a->status) }}</span></td>
                <td>{{ $a->check_in_location ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <p class="footer">© 2024 HumaneHR SaaS. Designed for people.</p>
</body>
</html>
