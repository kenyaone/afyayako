<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class EapInviteLink extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'token',
        'email',
        'max_uses',
        'current_uses',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function employees()
    {
        return $this->hasMany(CorporateEmployee::class, 'invite_link_id');
    }

    public static function generateToken()
    {
        return Str::random(32);
    }

    public function isValid()
    {
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses && $this->current_uses >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function incrementUses()
    {
        $this->increment('current_uses');
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        })->where(function ($q) {
            $q->whereNull('max_uses')
              ->orWhereRaw('current_uses < max_uses');
        });
    }
}
