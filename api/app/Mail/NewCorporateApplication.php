<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\EapSubscription;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
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
        $subject = "🎯 New EAP application: {$this->company->name} ({$this->tierName})";

        // Only attach a Reply-To if the applicant's email is well-formed.
        // Otherwise the whole send fails on Symfony's RFC 2822 parser and
        // we lose the lead. Better to have no Reply-To than no email at all.
        $email = trim((string) $this->company->contact_email);
        if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new Envelope(
                subject: $subject,
                replyTo: [new Address($email, (string) $this->company->contact_name)],
            );
        }

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new_corporate_application');
    }
}
