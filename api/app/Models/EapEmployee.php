<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EapEmployee extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'eap_subscription_id',
        'user_id',
        'sessions_used',
        'sessions_allowed',
        'is_active',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'joined_at' => 'datetime',
        ];
    }

    public function eapSubscription()
    {
        return $this->belongsTo(EapSubscription::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
