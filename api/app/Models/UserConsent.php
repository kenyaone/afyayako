<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserConsent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'version',
        'content_hash',
        'accepted_at',
        'ip_address',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
