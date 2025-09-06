<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    // =========================
    // Inscription
    // =========================
    public function register(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['role'] = $data['role'] ?? 'client';

        // Upload avatar si présent
        if (isset($data['avatar']) && $data['avatar'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['avatar']->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        return $this->userRepository->create($data);
    }

    // =========================
    // Connexion
    // =========================
    public function login(string $email, string $password): ?array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    // =========================
    // Déconnexion
    // =========================
    public function logout(User $user): void
    {
        $this->userRepository->deleteTokens($user);
    }

    // =========================
    // Profil
    // =========================
    public function getProfile(User $user): User
    {
        return $user;
    }

    public function updateProfile(User $user, array $data): User
    {
        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['telephone'])) $user->telephone = $data['telephone'];
        if (isset($data['adresse'])) $user->adresse = $data['adresse'];
        if (isset($data['ville'])) $user->ville = $data['ville'];

        if (isset($data['password']) && !empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        // Upload avatar si présent
        if (isset($data['avatar']) && $data['avatar'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['avatar']->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return $user;
    }
}
