<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\EapSubscription;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Sent to sales@ (and CC'd to admin@) when a prospect submits the
 * /corporate/apply form. Ensures no lead ever gets lost in the DB.
 */
class NewCorporateApplication extends Mailable
{
    public function __construct(
        public Company         $company,
        public EapSubscription $subscription,
        public string          $tierName,
        public ?string         $paymentMethod,
        public ?string         $billingNotes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🎯 New EAP application: {$this->company->name} ({$this->tierName})",
            replyTo: [$this->company->contact_email => $this->company->contact_name],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new_corporate_application');
    }
}
