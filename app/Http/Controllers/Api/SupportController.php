<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Services\SupportAiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupportController extends Controller
{
    public function __construct(private SupportAiService $ai) {}

    public function create(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => 'nullable|string|max:255',
            'metadata' => 'array'
        ]);

        $conversation = SupportConversation::create([
            'user_id' => optional($request->user())->id,
            'status' => 'open',
            'subject' => $data['subject'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        return response()->json(['success' => true, 'data' => $conversation], 201);
    }

    public function show(Request $request, SupportConversation $conversation): JsonResponse
    {
        $this->authorizeAccess($request, $conversation);

        $messages = $conversation->messages()->orderBy('created_at')->get();
        return response()->json(['success' => true, 'data' => [
            'conversation' => $conversation,
            'messages' => $messages,
        ]]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'conversation_id' => 'required|exists:support_conversations,id',
            'content' => 'required|string|max:5000',
        ]);

        $conversation = SupportConversation::findOrFail($data['conversation_id']);
        $this->authorizeAccess($request, $conversation);

        // Store user message
        $userMessage = new SupportMessage([
            'sender_type' => 'user',
            'content' => $data['content'],
        ]);
        $conversation->messages()->save($userMessage);

        // Build recent history
        $history = $conversation->messages()
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->reverse()
            ->map(fn($m) => [
                'sender_type' => $m->sender_type,
                'content' => $m->content,
            ])->values()->all();

        // Call AI service
        $ai = $this->ai->generateReply($conversation, $data['content'], $history);

        $aiMessage = new SupportMessage([
            'sender_type' => 'ai',
            'content' => (string) ($ai['content'] ?? ''),
            'meta' => $ai['meta'] ?? null,
        ]);
        $conversation->messages()->save($aiMessage);

        return response()->json([
            'success' => true,
            'data' => [
                'user_message' => $userMessage,
                'ai_message' => $aiMessage,
                'conversation' => $conversation->fresh(),
            ]
        ]);
    }

    private function authorizeAccess(Request $request, SupportConversation $conversation): void
    {
        $user = $request->user();
        // If conversation is owned by a user, only that user (or admin/employee) can access
        if ($conversation->user_id) {
            if (!$user) abort(403, 'Non autorisé');
            if ($user->id === $conversation->user_id) return;
            if (in_array($user->role, ['admin','employee'])) return;
            abort(403, 'Accès refusé');
        }
        // Anonymous conversations: allow read if no user bound, or if admin/employee
        if ($user && in_array($user->role, ['admin','employee'])) return;
    }
}
