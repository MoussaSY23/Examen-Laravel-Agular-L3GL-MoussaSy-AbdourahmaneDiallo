<?php

namespace App\Services;

use App\Models\Message;
use App\Models\Commande;

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
        // Si une commande est spécifiée, et qu'aucun destinataire explicite n'est fourni,
        // tenter de déduire le destinataire selon le rôle implicite (client vs employé)
        if (!isset($data['destinataire_id']) && !empty($data['commande_id'])) {
            $commande = Commande::find($data['commande_id']);
            if ($commande) {
                // Si l'expéditeur est le client de la commande, le destinataire est l'employé assigné
                if ($commande->user_id == ($data['expediteur_id'] ?? null)) {
                    if (!empty($commande->employe_id)) {
                        $data['destinataire_id'] = $commande->employe_id;
                    }
                } else {
                    // Sinon, si l'expéditeur est l'employé assigné, le destinataire devient le client
                    if (!empty($commande->employe_id) && $commande->employe_id == ($data['expediteur_id'] ?? null)) {
                        $data['destinataire_id'] = $commande->user_id;
                    }
                }
            }
        }

        $message = Message::create($data);

        // Diffuser l’événement pour le front
        event(new \App\Events\MessageEnvoye($message));

        return $message;
    }

    /**
     * Récupère la conversation entre deux utilisateurs (les deux sens)
     */
    public function conversation(int $userA, int $userB)
    {
        return Message::with(['expediteur', 'destinataire'])
            ->where(function($q) use ($userA, $userB) {
                $q->where('expediteur_id', $userA)->where('destinataire_id', $userB);
            })
            ->orWhere(function($q) use ($userA, $userB) {
                $q->where('expediteur_id', $userB)->where('destinataire_id', $userA);
            })
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Récupère toute la conversation liée à un client donné,
     * quel que soit l'interlocuteur (employé, admin...).
     */
    public function conversationByClient(int $clientId)
    {
        return Message::with(['expediteur', 'destinataire'])
            ->where(function($q) use ($clientId) {
                $q->where('expediteur_id', $clientId)
                  ->orWhere('destinataire_id', $clientId);
            })
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Compte les messages non lus pour un destinataire donné
     */
    public function countNonLus(int $userId): int
    {
        return Message::where('destinataire_id', $userId)
            ->where('lu', false)
            ->count();
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
