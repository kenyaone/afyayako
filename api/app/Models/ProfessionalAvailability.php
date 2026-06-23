<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalAvailability extends Model
{
    protected $table = 'professional_availability';

    protected $fillable = [
        'professional_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }
}
