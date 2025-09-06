<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProduitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // à sécuriser plus tard avec roles
    }

    public function rules(): array
    {
        return [
            'categorie_id' => 'required|exists:categories,id',
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'en_promotion' => 'boolean',
            'prix_promotion' => 'nullable|numeric|min:0',
            'date_debut_promotion' => 'nullable|date',
            'date_fin_promotion' => 'nullable|date|after_or_equal:date_debut_promotion',
            'stock' => 'required|integer|min:0',
            'unite' => 'nullable|string|max:50',
            'image_principale' => 'nullable|string|max:255',
            'images' =>  'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10000',
            'actif' => 'boolean',
        ];
    }
}
