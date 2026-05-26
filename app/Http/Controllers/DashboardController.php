<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = today();

        $totalEmployees = Employee::where('status', 'active')->count();

        $presentToday = Attendance::whereDate('date', $today)
            ->whereIn('status', ['present', 'late'])
            ->count();

        $lateToday = Attendance::whereDate('date', $today)
            ->where('status', 'late')
            ->count();

        $absentToday = $totalEmployees - $presentToday;

        // Weekly attendance trend
        $weeklyTrend = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);

            $weeklyTrend[] = [
                'day' => $date->format('D'),
                'date' => $date->format('Y-m-d'),
                'present' => Attendance::whereDate('date', $date)
                    ->whereIn('status', ['present', 'late'])
                    ->count(),

                'late' => Attendance::whereDate('date', $date)
                    ->where('status', 'late')
                    ->count(),
            ];
        }

        // Recent activity
        $recentActivity = Attendance::with('employee')
            ->whereDate('date', $today)
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'name' => $a->employee->name,
                'department' => $a->employee->department,
                'photo' => $a->employee->photo,
                'action' => $a->check_out_at ? 'Checked Out' : 'Checked In',
                'time' => $a->check_out_at
                    ? $a->check_out_at->format('h:i A')
                    : ($a->check_in_at
                        ? $a->check_in_at->format('h:i A')
                        : null),

                'status' => $a->check_out_at
                    ? 'complete'
                    : ($a->status === 'late'
                        ? 'late'
                        : 'on_time'),
            ]);

        return Inertia::render('Dashboard/Dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'presentToday' => $presentToday,
                'lateToday' => $lateToday,
                'absentToday' => $absentToday,
            ],

            'weeklyTrend' => $weeklyTrend,
            'recentActivity' => $recentActivity,
        ]);
    }
}