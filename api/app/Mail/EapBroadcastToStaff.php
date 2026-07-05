<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Sent to every employee email supplied by HR — BCC'd, never CC'd.
 * The message contains ONE reusable invite link so employees can join
 * anonymously. HR never learns who opened, clicked, or joined via it.
 */
class EapBroadcastToStaff extends Mailable
{
    public function __construct(
        public Company $company,
        public string  $inviteUrl,
        public ?string $customMessage = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Free confidential therapy — from {$this->company->name}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.eap_broadcast_to_staff');
    }
}
