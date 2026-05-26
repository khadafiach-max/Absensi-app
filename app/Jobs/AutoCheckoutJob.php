<?php

namespace App\Jobs;

use App\Models\Attendance;
use App\Models\AttendanceHistory;
use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AutoCheckoutJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $now = now();

        // Find all employees who haven't checked out but shift has ended
        $employees = Employee::where('status', 'active')->get();

        foreach ($employees as $employee) {
            $shiftEnd = \Carbon\Carbon::parse($employee->shift_end);

            if ($now->lt($shiftEnd)) continue;

            $attendance = $employee->attendances()
                ->whereDate('date', today())
                ->whereNotNull('check_in_at')
                ->whereNull('check_out_at')
                ->first();

            if (!$attendance) continue;

            $attendance->update([
                'check_out_at' => $shiftEnd,
                'check_out_location' => 'Auto Checkout',
                'status' => 'auto_checkout',
            ]);

            AttendanceHistory::create([
                'attendance_id' => $attendance->id,
                'employee_id' => $employee->id,
                'type' => 'auto_checkout',
                'time_at' => $shiftEnd,
                'location' => 'System Auto Checkout',
                'status' => 'complete',
                'notes' => 'Automatically checked out at shift end time.',
            ]);
        }
    }
}
