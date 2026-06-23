<?php

namespace App\Mail;

use App\Models\Consultation;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class BookingConfirmation extends Mailable
{
    public function __construct(
        public Consultation $consultation,
        public string       $recipientName,
        public bool         $isProfessional = false,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Session booked — Afya Yako Siri Yako');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.booking_confirmation');
    }
}
