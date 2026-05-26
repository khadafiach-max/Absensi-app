<?php

namespace App\Exports;

use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttendanceExport implements
    FromQuery,
    WithHeadings,
    WithMapping,
    WithStyles,
    ShouldAutoSize,
    WithTitle
{
    public function __construct(
        protected ?string $dateFrom,
        protected ?string $dateTo,
        protected ?string $status,
        protected ?int    $employeeId   // null = semua (admin)
    ) {}

    /* ── Query ── */
    public function query()
    {
        return Attendance::with('employee')
            ->when($this->dateFrom,    fn($q) => $q->whereDate('date', '>=', $this->dateFrom))
            ->when($this->dateTo,      fn($q) => $q->whereDate('date', '<=', $this->dateTo))
            ->when($this->status,      fn($q) => $q->where('status', $this->status))
            ->when($this->employeeId,  fn($q) => $q->where('employee_id', $this->employeeId))
            ->orderByDesc('date');
    }

    /* ── Header kolom ── */
    public function headings(): array
    {
        return [
            'No',
            'Nama Karyawan',
            'Departemen',
            'Tanggal',
            'Jam Masuk',
            'Jam Keluar',
            'Status',
            'Lokasi Check-In',
        ];
    }

    /* ── Mapping setiap baris ── */
    public function map($attendance): array
    {
        static $row = 0;
        $row++;

        return [
            $row,
            $attendance->employee->name     ?? '-',
            $attendance->employee->department ?? '-',
            $attendance->date->format('d M Y'),
            $attendance->check_in_at?->format('H:i') ?? '-',
            $attendance->check_out_at?->format('H:i') ?? '-',
            ucfirst($attendance->status),
            $attendance->check_in_location ?? '-',
        ];
    }

    /* ── Style header ── */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill'      => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF2D6A9F']],
                'alignment' => ['horizontal' => 'center'],
            ],
        ];
    }

    public function title(): string
    {
        return 'Attendance History';
    }
}