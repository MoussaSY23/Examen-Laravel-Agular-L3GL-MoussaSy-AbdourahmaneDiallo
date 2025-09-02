<?php

namespace App\Events;

use App\Models\Commande;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommandeStatutChange implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $commande;

    public function __construct(Commande $commande)
    {
        $this->commande = $commande->load('produits', 'client');
    }

    public function broadcastOn()
    {
        // Canal privé par commande pour que seul le client reçoive
        return new PrivateChannel('commande.' . $this->commande->id);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->commande->id,
            'statut' => $this->commande->statut,
            'total' => $this->commande->total,
        ];
    }
}
