<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ParentalConsent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guardian_name',
        'guardian_phone',
        'guardian_email',
        'relationship',
        'minor_assent',
        'consent_given_at',
        'minor_assented_at',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'consent_given_at'  => 'datetime',
            'minor_assented_at' => 'datetime',
            'minor_assent'      => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
