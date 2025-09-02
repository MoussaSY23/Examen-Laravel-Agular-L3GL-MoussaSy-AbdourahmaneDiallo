<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // sécuriser plus tard selon rôle
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'mode_paiement' => 'required|in:en_ligne,a_la_livraison',
            'adresse_livraison' => 'required|string|max:500',
            'notes' => 'nullable|string',
            'produits' => 'required|array|min:1',
            'produits.*.produit_id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
        ];
    }
}
