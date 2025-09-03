<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MessageEnvoye implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    // Canal sur lequel l’événement sera diffusé
    public function broadcastOn(): Channel
    {
        // Canal général pour tous les utilisateurs (optionnel: user spécifique)
        return new Channel('chat');
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'expediteur_id' => $this->message->expediteur_id,
            'destinataire_id' => $this->message->destinataire_id,
            'contenu' => $this->message->contenu,
            'lu' => $this->message->lu,
            'created_at' => $this->message->created_at->toDateTimeString(),
        ];
    }
}
