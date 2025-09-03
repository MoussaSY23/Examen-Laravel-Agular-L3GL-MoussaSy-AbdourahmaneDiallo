<?php

namespace App\Services;

use App\Models\Message;

class MessageService
{
    public function lister(): mixed
    {
        return Message::with(['expediteur', 'destinataire'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    public function creer(array $data): Message
    {
        $message = Message::create($data);

        // Diffuser l’événement pour le front
        event(new \App\Events\MessageEnvoye($message));

        return $message;
    }


    public function marquerCommeLu(Message $message): Message
    {
        $message->update(['lu' => true]);
        return $message;
    }

    public function supprimer(Message $message): void
    {
        $message->delete();
    }
}
