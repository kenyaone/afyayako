<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Sent monthly (1st of each month) to Company.contact_email.
 * Only aggregate stats — utilization %, session count, spend.
 * Numbers rounded for small teams to prevent identity inference.
 */
class EapMonthlyHrSummary extends Mailable
{
    public function __construct(
        public Company $company,
        public string  $monthLabel,       // "July 2026"
        public int     $totalEmployees,   // covered
        public int     $activeEmployees,  // rounded
        public int     $sessionsDelivered,
        public float   $totalSpendKes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Monthly EAP summary · {$this->monthLabel} · {$this->company->name}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.eap_monthly_hr_summary');
    }
}
