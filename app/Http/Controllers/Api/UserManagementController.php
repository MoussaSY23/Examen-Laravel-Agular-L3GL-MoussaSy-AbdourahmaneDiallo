<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    // GET /api/users
    public function index(Request $request)
    {
        $auth = $request->user();
        if (!$auth || $auth->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Accès réservé aux administrateurs'], 403);
        }

        $users = User::select('id', 'name', 'email', 'role', 'telephone', 'adresse', 'ville', 'avatar', 'created_at', 'updated_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($u) {
                // Normalize avatar as absolute URL if present
                if (!empty($u->avatar)) {
                    if (!preg_match('/^https?:\/\//i', $u->avatar)) {
                        // assume stored path, try storage path first, fallback to asset
                        try {
                            $u->avatar = url( trim($u->avatar, '/') );
                        } catch (\Throwable $e) {
                            $u->avatar = url( trim($u->avatar, '/') );
                        }
                    }
                }
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'telephone' => $u->telephone,
                    'adresse' => $u->adresse,
                    'ville' => $u->ville,
                    'avatar' => $u->avatar,
                    'created_at' => $u->created_at,
                    'updated_at' => $u->updated_at,
                ];
            });

        return response()->json(['success' => true, 'data' => $users]);
    }

    // PATCH /api/users/{user}/role
    public function updateRole(Request $request, User $user)
    {
        $auth = $request->user();
        if (!$auth || $auth->role !== 'admin') {
            return response()->json(['success' => false, 'message' => "Accès réservé aux administrateurs"], 403);
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'employee', 'client'])],
        ]);

        // Optionally prevent self-demotion/deletion issues
        if ($auth->id === $user->id && $validated['role'] !== 'admin') {
            return response()->json(['success' => false, 'message' => "Vous ne pouvez pas changer votre propre rôle"], 422);
        }

        $user->role = $validated['role'];
        $user->save();

        return response()->json(['success' => true, 'data' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ]]);
    }

    // DELETE /api/users/{user}
    public function destroy(Request $request, User $user)
    {
        $auth = $request->user();
        if (!$auth || $auth->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Accès réservé aux administrateurs'], 403);
        }

        if ($auth->id === $user->id) {
            return response()->json(['success' => false, 'message' => "Vous ne pouvez pas supprimer votre propre compte"], 422);
        }

        $user->delete();

        return response()->json(['success' => true]);
    }
}
