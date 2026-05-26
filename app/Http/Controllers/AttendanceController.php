<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceHistory;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $employee = $user->employee;

        $todayAttendance = null;
        $todayHistory = [];

        if ($employee) {
            $todayAttendance = $employee->attendances()->whereDate('date', today())->first();
            $todayHistory = AttendanceHistory::where('employee_id', $employee->id)
                ->whereDate('created_at', today())
                ->orderBy('time_at')
                ->get()
                ->map(fn($h) => [
                    'id' => $h->id,
                    'type' => $h->type,
                    'time' => $h->time_at->format('h:i A'),
                    'location' => $h->location,
                    'status' => $h->status,
                ]);
        }

        return Inertia::render('Dashboard/Attendance', [
            'employee' => $employee ? [
                'id' => $employee->id,
                'name' => $employee->name,
                'position' => $employee->position,
                'work_location' => $employee->work_location,
                'shift_name' => $employee->shift_name,
                'shift_start' => $employee->shift_start,
                'shift_end' => $employee->shift_end,
                'grace_period' => $employee->grace_period,
            ] : null,
            'todayAttendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'check_in_at' => $todayAttendance->check_in_at?->format('h:i A'),
                'check_out_at' => $todayAttendance->check_out_at?->format('h:i A'),
                'status' => $todayAttendance->status,
            ] : null,
            'todayHistory' => $todayHistory,
        ]);
    }

    public function checkIn(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location' => 'nullable|string',
            'qr_token' => 'nullable|string',
        ]);

        $employee = auth()->user()->employee;

        if (!$employee) {
            return back()->withErrors(['error' => 'Employee profile not found.']);
        }

        $existing = $employee->attendances()->whereDate('date', today())->first();
        if ($existing && $existing->check_in_at) {
            return back()->withErrors(['error' => 'You have already checked in today.']);
        }

        $now = now();
        $shiftStart = \Carbon\Carbon::parse($employee->shift_start);
        $gracePeriod = $employee->grace_period ?? 15;
        $isLate = $now->gt($shiftStart->addMinutes($gracePeriod));

        $attendance = Attendance::updateOrCreate(
            ['employee_id' => $employee->id, 'date' => today()],
            [
                'check_in_at' => $now,
                'check_in_location' => $request->location ?? 'Unknown Location',
                'check_in_latitude' => $request->latitude,
                'check_in_longitude' => $request->longitude,
                'status' => $isLate ? 'late' : 'present',
            ]
        );

        AttendanceHistory::create([
            'attendance_id' => $attendance->id,
            'employee_id' => $employee->id,
            'type' => 'check_in',
            'time_at' => $now,
            'location' => $request->location ?? 'Unknown Location',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => $isLate ? 'late' : 'on_time',
        ]);

        return back()->with('success', 'Check In successful!');
    }

    public function checkOut(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location' => 'nullable|string',
        ]);

        $employee = auth()->user()->employee;

        if (!$employee) {
            return back()->withErrors(['error' => 'Employee profile not found.']);
        }

        $attendance = $employee->attendances()->whereDate('date', today())->first();

        if (!$attendance || !$attendance->check_in_at) {
            return back()->withErrors(['error' => 'You have not checked in yet.']);
        }

        if ($attendance->check_out_at) {
            return back()->withErrors(['error' => 'You have already checked out today.']);
        }

        $now = now();
        $attendance->update([
            'check_out_at' => $now,
            'check_out_location' => $request->location ?? 'Unknown Location',
            'check_out_latitude' => $request->latitude,
            'check_out_longitude' => $request->longitude,
        ]);

        AttendanceHistory::create([
            'attendance_id' => $attendance->id,
            'employee_id' => $employee->id,
            'type' => 'check_out',
            'time_at' => $now,
            'location' => $request->location ?? 'Unknown Location',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'complete',
        ]);

        return back()->with('success', 'Check Out successful!');
    }
}
