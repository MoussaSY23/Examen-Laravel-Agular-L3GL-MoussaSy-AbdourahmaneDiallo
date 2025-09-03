<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Services\UserService;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

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
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Identifiants invalides',
                ], 401);
            }

            $user = auth()->user();
            
            // Vérifier si l'utilisateur est actif (ajoutez cette logique si nécessaire)
            // if (!$user->is_active) {
            //     return response()->json([
            //         'status' => 'error',
            //         'message' => 'Votre compte est désactivé',
            //     ], 401);
            // }

            return response()->json([
                'status' => 'success',
                'message' => 'Connexion réussie',
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60, // en secondes
                'user' => $user
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la connexion: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la connexion',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        JWTAuth::invalidate(JWTAuth::getToken()); // Invalider le token JWT
        return response()->json(['message' => 'Déconnexion réussie']);
    }


}
