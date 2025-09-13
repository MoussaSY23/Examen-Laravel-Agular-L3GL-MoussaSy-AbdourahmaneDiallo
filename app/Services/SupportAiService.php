<?php

namespace App\Services;

use App\Models\SupportConversation;

class SupportAiService
{
    private string $provider;
    private string $ollamaBaseUrl;
    private string $ollamaModel;

    public function __construct()
    {
        $this->provider = env('LLM_PROVIDER', 'ollama');
        $this->ollamaBaseUrl = rtrim(env('OLLAMA_BASE_URL', 'http://127.0.0.1:11434'), '/');
        $this->ollamaModel = env('OLLAMA_MODEL', 'llama3.1:8b-instruct');
    }

    /**
     * Generate an AI reply from a conversation and a new user message.
     */
    public function generateReply(SupportConversation $conversation, string $userMessage, array $history = []): array
    {
        // Build a simple prompt with lightweight system guidance
        $system = "Tu es un assistant de support client pour une boulangerie. Réponds en français, de façon concise et utile. Si la question concerne une commande, propose de récupérer l'ID de commande. Ne devine pas: si tu ne sais pas, propose de transférer à un agent humain.";

        $messages = [];
        $messages[] = [ 'role' => 'system', 'content' => $system ];

        // Include limited recent history (last 6 messages)
        $recent = array_slice($history, max(0, count($history) - 6));
        foreach ($recent as $msg) {
            $messages[] = [
                'role' => $msg['sender_type'] === 'user' ? 'user' : 'assistant',
                'content' => (string) ($msg['content'] ?? '')
            ];
        }
        $messages[] = [ 'role' => 'user', 'content' => $userMessage ];

        if ($this->provider === 'ollama') {
            return $this->callOllama($messages);
        }

        // Fallback static response if no provider configured
        return [
            'content' => "Je suis indisponible pour le moment. Merci de réessayer plus tard ou contactez le support humain.",
            'meta' => ['provider' => 'none', 'ok' => false]
        ];
    }

    private function callOllama(array $messages): array
    {
        // Convert chat messages to a single prompt for /api/generate
        $prompt = '';
        foreach ($messages as $m) {
            $role = strtoupper($m['role']);
            $prompt .= "{$role}: " . ($m['content'] ?? '') . "\n";
        }
        $prompt .= "ASSISTANT: ";

        $payload = [
            'model' => $this->ollamaModel,
            'prompt' => $prompt,
            'stream' => false,
            'options' => [
                'temperature' => 0.3
            ],
        ];

        $url = $this->ollamaBaseUrl . '/api/generate';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($errno) {
            \Log::error('Ollama error: ' . $error);
            return [
                'content' => "Je n'arrive pas à répondre pour le moment (service IA indisponible).",
                'meta' => ['provider' => 'ollama', 'ok' => false, 'error' => $error]
            ];
        }

        $data = json_decode($response, true);
        $answer = $data['response'] ?? null;
        if (!$answer) {
            return [
                'content' => "Désolé, je n'ai pas de réponse pour le moment.",
                'meta' => ['provider' => 'ollama', 'ok' => false]
            ];
        }

        return [
            'content' => trim($answer),
            'meta' => [
                'provider' => 'ollama',
                'ok' => true,
                'model' => $this->ollamaModel,
            ]
        ];
    }
}
