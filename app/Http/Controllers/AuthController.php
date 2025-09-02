<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Services\UserService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function register(RegisterRequest $request)
    {
        $user = $this->userService->register($request->validated());
        return response()->json(['message' => 'Utilisateur créé avec succès', 'user' => $user], 201);
    }

    public function login(LoginRequest $request)
    {
        $result = $this->userService->login($request->email, $request->password);

        if (!$result) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $result['token'],
            'user' => $result['user']
        ]);
    }

    public function logout(Request $request)
    {
        $this->userService->logout($request->user());
        return response()->json(['message' => 'Déconnexion réussie']);
    }
}
