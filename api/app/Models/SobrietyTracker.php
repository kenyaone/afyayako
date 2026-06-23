<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SobrietyTracker extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'substance',
        'start_date',
        'current_streak',
        'longest_streak',
        'total_relapses',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
