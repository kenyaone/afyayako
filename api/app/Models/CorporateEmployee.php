<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CorporateEmployee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'user_id',
        'invite_link_id',
        'employee_code',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function inviteLink()
    {
        return $this->belongsTo(EapInviteLink::class, 'invite_link_id');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'corporate_employee_id');
    }

    public static function generateEmployeeCode()
    {
        return 'EMP-' . strtoupper(Str::random(12));
    }

    public function scopeForCompany($query, $company)
    {
        return $query->where('company_id', $company->id ?? $company);
    }
}
