<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // On gérera les autorisations ailleurs
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'in:admin,employee,client|default:client',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:100',
            'avatar' => 'nullable|string|max:255'
        ];
    }
}
