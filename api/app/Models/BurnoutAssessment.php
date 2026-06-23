<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BurnoutAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessor_id',
        'assessor_type',
        'specialization',
        'years_experience',
        'age',
        'gender',
        'caseload_size',
        'responses',
        'cs_score',
        'bo_score',
        'sts_score',
        'cs_zone',
        'bo_zone',
        'sts_zone',
        'overall_zone',
        'ai_report',
        'report_sent_to',
        'report_sent_at',
        'payment_id',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'responses' => 'array',
            'report_sent_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function assessor()
    {
        return $this->belongsTo(User::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
