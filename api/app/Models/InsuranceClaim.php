<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InsuranceClaim extends Model
{
    protected $fillable = [
        'consultation_id',
        'user_id',
        'claim_reference',
        'provider',
        'member_number',
        'id_number',
        'scheme_name',
        'amount',
        'status',
        'notes',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
