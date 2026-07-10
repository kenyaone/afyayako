<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Anonymised HR notification: an employee has booked an EAP session.
 * NEVER includes patient name, therapist name, or triage/clinical details.
 * Only the anonymous employee_code, session shape (duration/mode/date),
 * and running usage totals so HR can reconcile the invoice.
 */
class EapSessionBooked extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Company      $company,
        public Consultation $consultation,
        public string       $employeeCode,
        public int          $sessionsUsedThisMonth,
        public int          $sessionsAllowedPerEmployee,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New EAP session booked — {$this->company->name}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.eap_session_booked');
    }
}
