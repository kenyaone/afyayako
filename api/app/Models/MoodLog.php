<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MoodLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'mood',
        'mood_score',
        'energy_level',
        'sleep_quality',
        'triggers',
        'coping_strategy',
        'notes',
        'logged_at',
    ];

    protected function casts(): array
    {
        return [
            'logged_at' => 'datetime',
            'notes'     => 'encrypted', // PHI encrypted at rest (Guideline 4)
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
