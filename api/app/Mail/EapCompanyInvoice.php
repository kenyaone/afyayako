<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\EapSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to the Company.contact_email when a subscription is created or renewed.
 * Contains billing details for finance: tier, period, employee count, total.
 * Never contains employee identities.
 */
class EapCompanyInvoice extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;


    public function __construct(
        public Company         $company,
        public EapSubscription $subscription,
        public string          $tierName,
        public int             $employeesCovered,
        public float           $totalKes,
        public string          $periodStart,
        public string          $periodEnd,
        public ?string         $invoiceNumber = null,
    ) {
        $this->invoiceNumber = $invoiceNumber ?: 'AY-'.now()->format('Ymd').'-'.$subscription->id;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "EAP invoice · {$this->company->name} · {$this->invoiceNumber}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.eap_company_invoice');
    }
}
