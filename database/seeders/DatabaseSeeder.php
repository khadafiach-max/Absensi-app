<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\AttendanceHistory;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@humanehr.com'],
            [
                'name' => 'Admin HumaneHR',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Sample employees
        $employeesData = [
            ['name' => 'Lucky Ubaidillah', 'email' => 'lucky.u@humanehr.com', 'position' => 'Fullstack Developer', 'department' => 'Web Developer', 'phone' => '+62 812-3456-7890'],
            ['name' => 'Hafy Faza Aqila', 'email' => 'hafy.f@humanehr.com', 'position' => 'UI/UX Designer', 'department' => 'Web Developer', 'phone' => '+62 811-9988-7766'],
            ['name' => 'Achmad Khadafi', 'email' => 'achmad.k@humanehr.com', 'position' => 'Frontend Developer', 'department' => 'Web Developer', 'phone' => '+62 856-2211-4433'],
            ['name' => 'Rafa Zaky Yunus', 'email' => 'rafa.z@humanehr.com', 'position' => 'Frontend Developer', 'department' => 'Web Developer', 'phone' => '+62 813-5566-0099'],
            ['name' => 'Rajwa Dhia Maajid', 'email' => 'rajwa.d@humanehr.com', 'position' => 'Data Analyst', 'department' => 'Web Developer', 'phone' => '+62 812-1122-3344'],
        ];

        foreach ($employeesData as $i => $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'role' => 'employee',
            ]);

            Employee::create([
                'user_id' => $user->id,
                'employee_id' => 'EMP-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'name' => $data['name'],
                'phone' => $data['phone'],
                'department' => $data['department'],
                'position' => $data['position'],
                'status' => $data['status'] ?? 'active',
                'work_location' => 'Depok, Indonesia',
                'shift_name' => 'General Morning',
                'shift_start' => '08:00:00',
                'shift_end' => '17:00:00',
            ]);
        }

        // Sample attendance for today
        $employees = Employee::where('status', 'active')->get();
        foreach ($employees->take(4) as $emp) {
            $checkin = now()->setHour(8)->setMinute(rand(40, 65));
            $att = Attendance::create([
                'employee_id' => $emp->id,
                'date' => today(),
                'check_in_at' => $checkin,
                'check_in_location' => 'Depok Office',
                'check_in_latitude' => -6.2088,
                'check_in_longitude' => 106.8456,
                'status' => $checkin->format('i') > 15 ? 'late' : 'present',
            ]);

            AttendanceHistory::create([
                'attendance_id' => $att->id,
                'employee_id' => $emp->id,
                'type' => 'check_in',
                'time_at' => $checkin,
                'location' => 'Depok Office',
                'status' => $att->status === 'late' ? 'late' : 'on_time',
            ]);
        }
    }
}
