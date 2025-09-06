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
            'categorie_id' => 'sometimes|exists:categories,id',
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'unite' => 'nullable|string|max:50',
            'image_principale' => 'nullable|file|image|max:5120', // unifier taille
            'image_principale_existing' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'nullable|file|image|max:5120',
            'images_existing' => 'nullable|array',
            'images_existing.*' => 'nullable|string',
            'actif' => 'sometimes|boolean',
            'en_promotion' => 'sometimes|boolean',
            'prix_promotion' => 'nullable|numeric|min:0',
            'date_debut_promotion' => 'nullable|date',
            'date_fin_promotion' => 'nullable|date|after_or_equal:date_debut_promotion',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('images_existing') && is_string($this->images_existing)) {
            $decoded = json_decode($this->images_existing, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['images_existing' => $decoded]);
            }
        }
    }

}
