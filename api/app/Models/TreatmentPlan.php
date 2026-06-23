<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TreatmentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'professional_id',
        'user_id',
        'description',
        'duration_weeks',
        'sessions_per_week',
        'cost_per_session',
        'total_cost',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'cost_per_session' => 'float',
            'total_cost' => 'float',
            'paid_at' => 'datetime',
        ];
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
