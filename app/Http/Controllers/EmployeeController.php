<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Employee::with('user')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('position', 'like', "%{$request->search}%"))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->department, fn($q) => $q->where('department', $request->department));

        $employees = $query->orderBy('name')->paginate(10)->withQueryString();

        // Ambil hanya departemen yang benar-benar ada di tabel employees
        $departments = Employee::select('department')
            ->distinct()
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->orderBy('department')
            ->pluck('department');

        return Inertia::render('Dashboard/Employee', [
            'employees' => $employees->through(fn($e) => [
                'id'          => $e->id,
                'employee_id' => $e->employee_id,
                'name'        => $e->name,
                'email'       => $e->user->email,
                'position'    => $e->position,
                'department'  => $e->department,
                'phone'       => $e->phone,
                'status'      => $e->status,
                'photo'       => $e->photo,
            ]),
            'filters'     => $request->only(['search', 'status', 'department']),
            'departments' => $departments, // <-- dikirim ke frontend
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|min:8',
            'position'     => 'required|string',
            'department'   => 'nullable|string',
            'phone'        => 'nullable|string',
            'work_location'=> 'nullable|string',
            'shift_start'  => 'nullable',
            'shift_end'    => 'nullable',
            'photo'        => 'nullable|image|max:2048',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'employee',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('employees', 'public');
        }

        $employeeId = 'EMP-' . str_pad(Employee::max('id') + 1, 4, '0', STR_PAD_LEFT);

        Employee::create([
            'user_id'       => $user->id,
            'employee_id'   => $employeeId,
            'name'          => $request->name,
            'phone'         => $request->phone,
            'department'    => $request->department,
            'position'      => $request->position,
            'photo'         => $photoPath,
            'work_location' => $request->work_location,
            'shift_start'   => $request->shift_start ?? '08:00:00',
            'shift_end'     => $request->shift_end ?? '17:00:00',
        ]);

        return back()->with('success', 'Employee created successfully.');
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email,' . $employee->user_id,
            'position'      => 'nullable|string',
            'department'    => 'nullable|string',
            'phone'         => 'nullable|string',
            'work_location' => 'nullable|string',
            'status'        => 'nullable|in:active,inactive,on_leave',
        ]);

        $employee->update($request->only([
            'name', 'position', 'department', 'phone', 'work_location', 'status'
        ]));

        if ($request->email !== $employee->user->email) {
            $employee->user->update(['email' => $request->email]);
        }

        return back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->user->delete(); // cascades to employee
        return back()->with('success', 'Employee deleted successfully.');
    }
}