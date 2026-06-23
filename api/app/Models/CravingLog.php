<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CravingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'substance',
        'intensity',
        'duration_minutes',
        'trigger',
        'coping_strategy',
        'resisted',
        'notes',
        'logged_at',
    ];

    protected function casts(): array
    {
        return [
            'logged_at' => 'datetime',
            'resisted' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
