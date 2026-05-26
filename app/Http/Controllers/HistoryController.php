<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\AttendanceExport;

class HistoryController extends Controller
{
    /**
     * Tampilkan halaman riwayat absensi dengan filter & pagination.
     */
    public function index(Request $request): Response
    {
        $query = Attendance::with('employee')
            ->when($request->date_from, fn($q) => $q->whereDate('date', '>=', $request->date_from))
            ->when($request->date_to,   fn($q) => $q->whereDate('date', '<=', $request->date_to))
            ->when($request->status,    fn($q) => $q->where('status', $request->status))
            ->when($request->search,    fn($q) => $q->whereHas('employee', fn($eq) =>
                $eq->where('name', 'like', "%{$request->search}%")))
            ->orderByDesc('date');

        // Jika bukan admin, hanya tampilkan data milik sendiri
        if (!auth()->user()->isAdmin()) {
            $employeeId = auth()->user()->employee?->id;
            $query->where('employee_id', $employeeId);
        }

        $histories = $query->paginate(10)->withQueryString();

        return Inertia::render('Dashboard/History', [
            'histories' => $histories->through(fn($a) => [
                'id'            => $a->id,
                'employee_name' => $a->employee->name,
                'employee_photo'=> $a->employee->photo,
                'date'          => $a->date->format('d M Y'),
                'check_in'      => $a->check_in_at?->format('h:i A'),
                'check_out'     => $a->check_out_at?->format('h:i A'),
                'status'        => $a->status,
                'location'      => $a->check_in_location,
            ]),
            'filters' => $request->only(['date_from', 'date_to', 'status', 'search']),
        ]);
    }

    /**
     * Export PDF — merespons dengan file download langsung.
     * Frontend cukup redirect ke URL ini (anchor click atau window.location).
     */
    public function exportPdf(Request $request)
    {
        $query = Attendance::with('employee')
            ->when($request->date_from, fn($q) => $q->whereDate('date', '>=', $request->date_from))
            ->when($request->date_to,   fn($q) => $q->whereDate('date', '<=', $request->date_to))
            ->when($request->status,    fn($q) => $q->where('status', $request->status))
            ->orderByDesc('date');

        // Non-admin hanya export datanya sendiri
        if (!auth()->user()->isAdmin()) {
            $employeeId = auth()->user()->employee?->id;
            $query->where('employee_id', $employeeId);
        }

        $attendances = $query->get();

        $pdf = Pdf::loadView('exports.attendance', [
            'attendances' => $attendances,
            'date_from'   => $request->date_from,
            'date_to'     => $request->date_to,
            'generated_at'=> now()->format('d M Y H:i'),
        ])->setPaper('a4', 'landscape');

        $filename = 'attendance-history-' . ($request->date_from ?? 'all') . '-' . ($request->date_to ?? 'all') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Export Excel — menggunakan Maatwebsite Excel.
     * Buat class App\Exports\AttendanceExport terlebih dahulu.
     */
    public function exportExcel(Request $request)
    {
        $dateFrom = $request->date_from;
        $dateTo   = $request->date_to;
        $status   = $request->status;
        $userId   = auth()->user()->isAdmin() ? null : auth()->user()->employee?->id;

        $filename = 'attendance-history-' . ($dateFrom ?? 'all') . '-' . ($dateTo ?? 'all') . '.xlsx';

        return Excel::download(
            new AttendanceExport($dateFrom, $dateTo, $status, $userId),
            $filename
        );
    }
}