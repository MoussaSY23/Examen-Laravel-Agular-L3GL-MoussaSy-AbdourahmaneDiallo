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
            'unite' => 'required|string|max:50',
            'actif' => 'sometimes|boolean',
            'image_principale' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'en_promotion' => 'sometimes|boolean',
            'prix_promotion' => 'nullable|required_if:en_promotion,1|numeric|min:0',
            'date_debut_promotion' => 'nullable|required_if:en_promotion,1|date',
            'date_fin_promotion' => 'nullable|required_if:en_promotion,1|date|after_or_equal:date_debut_promotion',
        ];
    }
}
