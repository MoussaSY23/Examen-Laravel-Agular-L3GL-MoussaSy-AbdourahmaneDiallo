<?php

namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;

use App\Models\Message;
use App\Services\MessageService;
use App\Http\Requests\MessageRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(private MessageService $service) {}

    public function index(): JsonResponse
    {
        $messages = $this->service->lister();
        return response()->json($messages);
    }

    public function store(MessageRequest $request): JsonResponse
    {
        $message = $this->service->creer($request->validated());
        return response()->json($message, 201);
    }

    public function conversation(int $expediteur_id, int $destinataire_id): JsonResponse
    {
        $messages = $this->service->conversation($expediteur_id, $destinataire_id);
        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * Conversation liée à une commande donnée
     */
    public function conversationByCommande(int $commandeId): JsonResponse
    {
        $messages = $this->service->conversationByCommande($commandeId);
        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * Récupère toute la conversation pour un client donné (quel que soit l'interlocuteur)
     */
    public function conversationByClient(int $clientId): JsonResponse
    {
        $messages = $this->service->conversationByClient($clientId);
        return response()->json(['success' => true, 'data' => $messages]);
    }

    public function marquerCommeLu(Message $message): JsonResponse
    {
        $message = $this->service->marquerCommeLu($message);
        return response()->json($message);
    }

    public function destroy(Message $message): JsonResponse
    {
        $this->service->supprimer($message);
        return response()->json(['message' => 'Message supprimé']);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        $count = $this->service->countNonLus($user->id);
        return response()->json(['success' => true, 'count' => $count]);
    }

    /**
     * Tous les messages où l'utilisateur (id) est impliqué (expediteur ou destinataire)
     */
    public function messagesUtilisateur(int $id): JsonResponse
    {
        $messages = Message::with(['expediteur', 'destinataire'])
            ->where(function($q) use ($id) {
                $q->where('expediteur_id', $id)->orWhere('destinataire_id', $id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'data' => $messages]);
    }
}
