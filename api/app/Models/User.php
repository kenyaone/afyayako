<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'display_name',
        'email',
        'phone',
        'role',
        'is_anonymous_mode',
        'password',
        'avatar',
        'date_of_birth',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_anonymous_mode' => 'boolean',
            'date_of_birth' => 'date',
        ];
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role,
            'username' => $this->username,
        ];
    }

    public function professional()
    {
        return $this->hasOne(Professional::class, 'email', 'email');
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    public function moodLogs()
    {
        return $this->hasMany(MoodLog::class);
    }

    public function cravingLogs()
    {
        return $this->hasMany(CravingLog::class);
    }

    public function sobrietyTrackers()
    {
        return $this->hasMany(SobrietyTracker::class);
    }

    public function crisisEvents()
    {
        return $this->hasMany(CrisisEvent::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->latest();
    }

    public function parentalConsent()
    {
        return $this->hasOne(ParentalConsent::class);
    }
}
