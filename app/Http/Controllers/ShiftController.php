<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    /**
     * Display shift management page
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $status = $request->status;

        $shifts = Shift::query()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($status === 'active', function ($query) {
                $query->where('is_active', true);
            })
            ->when($status === 'inactive', function ($query) {
                $query->where('is_active', false);
            })
            ->withCount('employees')
            ->latest()
            ->get();

        $employees = Employee::query()
            ->select(
                'id',
                'name',
                'position',
                'department'
            )
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'position' => $employee->position,
                    'department' => $employee->department,
                    'current_shift' => optional(
                        $employee->shifts()->latest()->first()
                    )->name,
                ];
            });

        return Inertia::render('ShiftManagement', [
            'shifts' => $shifts,
            'employees' => $employees,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store new shift
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'grace_period' => 'required|integer|min:0|max:60',
            'work_days' => 'nullable|array',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        Shift::create($validated);

        return redirect()->back()->with(
            'success',
            'Shift berhasil dibuat.'
        );
    }

    /**
     * Update shift
     */
    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'grace_period' => 'required|integer|min:0|max:60',
            'work_days' => 'nullable|array',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $shift->update($validated);

        return redirect()->back()->with(
            'success',
            'Shift berhasil diperbarui.'
        );
    }

    /**
     * Delete shift
     */
    public function destroy(Shift $shift)
    {
        $shift->employees()->detach();

        $shift->delete();

        return redirect()->back()->with(
            'success',
            'Shift berhasil dihapus.'
        );
    }

    /**
     * Assign employees to shift
     */
    public function assign(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'exists:employees,id',
        ]);

        $shift->employees()->sync($validated['employee_ids']);

        return redirect()->back()->with(
            'success',
            'Karyawan berhasil diassign ke shift.'
        );
    }
}