<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'consultation_id',
        'amount',
        'phone',
        'mpesa_checkout_id',
        'mpesa_transaction_id',
        'mpesa_result_code',
        'mpesa_result_desc',
        'status',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
            'amount' => 'float',
        ];
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
