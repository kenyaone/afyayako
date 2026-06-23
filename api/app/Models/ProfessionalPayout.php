<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalPayout extends Model
{
    protected $fillable = [
        'professional_id',
        'consultation_id',
        'amount',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'amount' => 'float',
        ];
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
