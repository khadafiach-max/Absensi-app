<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
        'name',
        'description',
        'start_time',
        'end_time',
        'grace_period',
        'work_days',
        'color',
        'is_active',
    ];

    protected $casts = [
        'work_days' => 'array',
        'is_active' => 'boolean',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class);
    }
}