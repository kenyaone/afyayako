<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Delivered when a subscription is activated. Gives the HR contact
 * their username + one-time password + login URL. On first login,
 * they should change the password (out of scope for this pass).
 */
class HrCredentials extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;


    public function __construct(
        public Company $company,
        public User    $user,
        public string  $tempPassword,
        public string  $loginUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Afya Yako HR account is ready — {$this->company->name}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.hr_credentials');
    }
}
