<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SaleStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $sale;
    public $statusLabel;
    public $changedAt;

    /**
     * Create a new message instance.
     */
    public function __construct($sale, string $statusLabel, $changedAt)
    {
        $this->sale = $sale;
        $this->statusLabel = $statusLabel;
        $this->changedAt = $changedAt;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Actualizacion del estado de tu pedido #'.$this->sale->id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.sale_status_changed',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
