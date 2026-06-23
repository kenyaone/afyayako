<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EapSubscription extends Model
{
    protected $fillable = [
        'company_id',
        'eap_tier_id',
        'admin_user_id',
        'status',
        'employee_limit',
        'sessions_used',
        'sessions_total',
        'amount_paid',
        'started_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'amount_paid' => 'float',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function eapTier()
    {
        return $this->belongsTo(EapTier::class);
    }

    public function adminUser()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    public function employees()
    {
        return $this->hasMany(EapEmployee::class);
    }
}
