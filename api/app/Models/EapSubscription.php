<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EapSubscription extends Model
{
    protected $fillable = [
        'company_id',
        'eap_tier_id',
        'admin_user_id',
        'status',
        'employee_limit',
        'sessions_used',
        'sessions_total',
        'amount_paid',
        'started_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'amount_paid' => 'float',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function eapTier()
    {
        return $this->belongsTo(EapTier::class);
    }

    public function adminUser()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    public function employees()
    {
        return $this->hasMany(EapEmployee::class);
    }

    /**
     * Auto-send the monthly invoice when a subscription is created OR
     * transitions to 'active'. Wrapped in try/catch so mail failures
     * never break the subscription/checkout flow.
     */
    protected static function booted(): void
    {
        static::created(function (EapSubscription $sub) {
            if ($sub->status === 'active') {
                self::dispatchInvoice($sub);
            }
        });

        static::updated(function (EapSubscription $sub) {
            if ($sub->wasChanged('status') && $sub->status === 'active') {
                self::dispatchInvoice($sub);
            }
        });
    }

    protected static function dispatchInvoice(EapSubscription $sub): void
    {
        try {
            $sub->loadMissing(['company', 'eapTier']);
            if (!$sub->company || !$sub->company->contact_email || !$sub->eapTier) {
                return;
            }
            $employees   = (int) ($sub->employee_limit ?? $sub->company->employee_count ?? 0);
            $perEmpAnn   = (float) $sub->eapTier->price_kes_annual;
            $perEmpMo    = $perEmpAnn > 0 ? $perEmpAnn / 12 : 0;
            $monthlyBill = $perEmpMo * $employees;                // monthly total
            $start       = optional($sub->started_at ?? now())->startOfMonth()->format('d M Y');
            $end         = optional($sub->started_at ?? now())->endOfMonth()->format('d M Y');

            \Illuminate\Support\Facades\Mail::to($sub->company->contact_email)->send(
                new \App\Mail\EapCompanyInvoice(
                    company:          $sub->company,
                    subscription:     $sub,
                    tierName:         $sub->eapTier->name,
                    employeesCovered: $employees,
                    totalKes:         $monthlyBill,
                    periodStart:      $start,
                    periodEnd:        $end,
                )
            );
        } catch (\Throwable $e) {
            \Log::warning('EAP invoice email dispatch failed', [
                'subscription_id' => $sub->id,
                'error'           => $e->getMessage(),
            ]);
        }
    }
}
