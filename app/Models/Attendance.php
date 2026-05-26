<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id', 'date', 'check_in_at', 'check_out_at',
        'check_in_location', 'check_out_location',
        'check_in_latitude', 'check_in_longitude',
        'check_out_latitude', 'check_out_longitude',
        'status', 'is_verified', 'qr_token', 'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
        'is_verified' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(AttendanceHistory::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'present' => 'Present',
            'late' => 'Late',
            'absent' => 'Absent',
            'auto_checkout' => 'Auto Checkout',
            default => 'Unknown',
        };
    }
}
