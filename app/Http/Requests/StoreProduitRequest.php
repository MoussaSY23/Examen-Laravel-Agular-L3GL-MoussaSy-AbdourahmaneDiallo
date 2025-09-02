<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ⚠️ Plus tard, on pourra mettre une logique d’autorisation
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'categorie_id' => 'required|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'string', // URL ou nom du fichier
            'en_promotion' => 'boolean',
            'prix_promotion' => 'nullable|numeric|min:0',
            'date_debut_promotion' => 'nullable|date',
            'date_fin_promotion' => 'nullable|date|after_or_equal:date_debut_promotion',
        ];
    }
}
