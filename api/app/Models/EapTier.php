<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EapTier extends Model
{
    protected $fillable = [
        'name',
        'min_employees',
        'max_employees',
        'price_kes_annual',
        'sessions_per_employee',
        'features',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'is_active' => 'boolean',
            'price_kes_annual' => 'float',
        ];
    }

    public function eapSubscriptions()
    {
        return $this->hasMany(EapSubscription::class);
    }
}
