<?php

namespace App\Mail;

use App\Models\CorporateEmployee;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Sent to an employee immediately after they sign up via the invite link.
 * Delivers their EMP-XXXXX code (their anonymous identity within the EAP)
 * and next-step instructions. HR is NEVER copied on this.
 */
class EapEmployeeJoined extends Mailable
{
    public function __construct(
        public CorporateEmployee $employee,
        public string            $companyName,
        public string            $recipientName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're in — anonymous EAP access · Afya Yako",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.eap_employee_joined');
    }
}
