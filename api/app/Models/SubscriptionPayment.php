<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPayment extends Model
{
    protected $fillable = [
        'subscription_id',
        'amount',
        'phone',
        'mpesa_checkout_id',
        'mpesa_transaction_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
        ];
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}
