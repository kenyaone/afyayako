<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supervision extends Model
{
    protected $fillable = [
        'supervisor_id', 'supervisee_id', 'assigned_by', 'status', 'ended_at',
    ];

    protected function casts(): array
    {
        return ['ended_at' => 'datetime'];
    }

    public function supervisor()
    {
        return $this->belongsTo(Professional::class, 'supervisor_id');
    }

    public function supervisee()
    {
        return $this->belongsTo(Professional::class, 'supervisee_id');
    }

    public function sessions()
    {
        return $this->hasMany(SupervisionSession::class);
    }
}
