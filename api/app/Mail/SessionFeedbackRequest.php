<?php

namespace App\Mail;

use App\Models\SessionFeedback;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent ~24h after a session was marked complete.
 * Recipient is the employee who attended. Contains a per-session token
 * that unlocks a 3-question anonymous survey.
 */
class SessionFeedbackRequest extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;


    public function __construct(
        public SessionFeedback $feedback,
        public string          $recipientName,
        public string          $therapistName,
        public string          $sessionDateLabel,
        public string          $feedbackUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '30-second feedback on your session — Afya Yako',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.session_feedback_request');
    }
}
