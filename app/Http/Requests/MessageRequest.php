<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // on sécurisera plus tard selon roles
    }

    public function rules(): array
    {
        return [
            'expediteur_id' => 'required|exists:users,id',
            'destinataire_id' => 'nullable|exists:users,id',
            'commande_id' => 'nullable|exists:commandes,id',
            'contenu' => 'required|string|max:2000',
            'lu' => 'boolean',
        ];
    }
}
