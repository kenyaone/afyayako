<?php

namespace App\Mail;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SessionReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Consultation $consultation,
        public string $recipientName,
        public string $hoursUntil,   // '24 hours' or '1 hour'
        public bool $isProfessional = false,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Reminder: Your session is in {$this->hoursUntil} — Afya Yako Siri Yako",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.session_reminder',
        );
    }
}
