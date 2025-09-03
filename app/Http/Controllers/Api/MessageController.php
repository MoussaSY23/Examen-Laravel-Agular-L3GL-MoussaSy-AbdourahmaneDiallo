<?php

namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;

use App\Models\Message;
use App\Services\MessageService;
use App\Http\Requests\MessageRequest;
use Illuminate\Http\JsonResponse;

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
}
