<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrisisEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'trigger_source',
        'content',
        'severity',
        'keywords_detected',
        'response_action',
        'resolved',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
        'escalated',
    ];

    protected function casts(): array
    {
        return [
            'content'           => 'encrypted', // PHI encrypted at rest (Guideline 4)
            'keywords_detected' => 'array',
            'resolved'          => 'boolean',
            'escalated'         => 'boolean',
            'resolved_at'       => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
