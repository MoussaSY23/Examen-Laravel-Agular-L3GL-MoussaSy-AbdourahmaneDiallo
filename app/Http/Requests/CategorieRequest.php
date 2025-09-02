<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategorieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // à sécuriser plus tard avec roles
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'actif' => 'nullable|boolean',
        ];
    }
}
