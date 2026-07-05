<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EapSession extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'corporate_employee_id',
        'consultation_id',
        'therapist_name',
        'therapist_license',
        'session_date',
        'session_duration_minutes',
        'session_status', // scheduled, completed, cancelled
        'cost_charged',
        'payment_status', // pending, paid, refunded
    ];

    protected $casts = [
        'session_date' => 'datetime',
        'cost_charged' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function corporateEmployee()
    {
        return $this->belongsTo(CorporateEmployee::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    // HR-visible view: no employee details
    public function getHrViewAttribute()
    {
        return [
            'session_id' => $this->id,
            'employee_code' => $this->corporateEmployee?->employee_code ?? 'UNKNOWN',
            'therapist_name' => $this->therapist_name,
            'therapist_license' => $this->therapist_license,
            'session_date' => $this->session_date->format('Y-m-d H:i'),
            'duration_minutes' => $this->session_duration_minutes,
            'status' => $this->session_status,
            'cost' => $this->cost_charged,
            'payment_status' => $this->payment_status,
        ];
    }
}
