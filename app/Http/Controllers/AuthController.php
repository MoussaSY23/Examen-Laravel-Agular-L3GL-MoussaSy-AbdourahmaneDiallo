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

            return response()->json([
                'status' => 'success',
                'message' => 'Connexion réussie',
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
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
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    // =========================
    // Gestion du profil
    // =========================

    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json($this->userService->getProfile($user));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:6|confirmed',
            'telephone' => 'sometimes|string|max:20',
            'adresse' => 'sometimes|string|max:255',
            'ville' => 'sometimes|string|max:100',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $updatedUser = $this->userService->updateProfile($user, $request->all());

        return response()->json($updatedUser);
    }



    public function me(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            return response()->json([
                'status' => 'success',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération du profil : ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de récupérer le profil',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

}
