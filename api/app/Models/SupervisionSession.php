<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupervisionSession extends Model
{
    protected $fillable = [
        'supervision_id', 'session_date', 'duration_minutes', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
            'notes'        => 'encrypted', // supervision notes are confidential PHI-adjacent
        ];
    }

    public function supervision()
    {
        return $this->belongsTo(Supervision::class);
    }
}
