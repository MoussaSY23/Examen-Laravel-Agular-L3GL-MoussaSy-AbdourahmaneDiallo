<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'categorie_id' => 'sometimes|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'en_promotion' => 'boolean',
            'prix_promotion' => 'nullable|numeric|min:0',
            'date_debut_promotion' => 'nullable|date',
            'date_fin_promotion' => 'nullable|date|after_or_equal:date_debut_promotion',
        ];
    }
}
