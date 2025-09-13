<?php

use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:api');
});

// Routes publiques (lecture)
Route::get('/produits', [ProduitController::class, 'index']);
Route::get('/produits/{produit}', [ProduitController::class, 'show'])->where('produit', '[0-9]+');
Route::get('/categories', [CategorieController::class, 'index']);
Route::get('/categories/{id}', [CategorieController::class, 'show'])->where('id', '[0-9]+');

// Routes protégées
Route::middleware('auth:api')->group(function () {
    // Produits
    Route::post('/produits', [ProduitController::class, 'store']);
    Route::put('/produits/{produit}', [ProduitController::class, 'update'])->where('produit', '[0-9]+');
    Route::delete('/produits/{produit}', [ProduitController::class, 'destroy'])->where('produit', '[0-9]+');
    Route::post('/produits/{produit}/promotion', [ProduitController::class, 'appliquerPromotion'])->where('produit', '[0-9]+');
    Route::post('/produits/{produit}/decrementer-stock/{quantite}', [ProduitController::class, 'decrementerStock'])->where('produit', '[0-9]+');
    Route::get('/produits/categorie/{id}', [ProduitController::class, 'parCategorie'])->where('id', '[0-9]+');

    // Catégories CRUD
    Route::post('/categories', [CategorieController::class, 'store']);
    Route::get('/categories/get/{id}', [CategorieController::class, 'show']);
    Route::put('/categories/{id}', [CategorieController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/categories/{id}', [CategorieController::class, 'destroy'])->where('id', '[0-9]+');
    Route::get('/categories/{id}/produits', [CategorieController::class, 'produits'])->where('id', '[0-9]+');

    // Commandes
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show'])->where('id', '[0-9]+');
    Route::patch('/commandes/{commande}/statut', [CommandeController::class, 'updateStatut'])->where('commande', '[0-9]+');
    // Attribution par un administrateur uniquement
    Route::patch('/commandes/{commande}/assign', [CommandeController::class, 'assignToEmployee'])->where('commande', '[0-9]+');
    Route::get('/commandes/{commande}/facture', [CommandeController::class, 'genererFacture'])->where('commande', '[0-9]+');
    Route::post('/commandes/{commande}/facture/email', [CommandeController::class, 'envoyerFacture'])->where('commande', '[0-9]+');
    Route::get('/utilisateurs/{id}/commandes', [CommandeController::class, 'commandesUtilisateur'])->where('id', '[0-9]+');

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{id}', [MessageController::class, 'show'])->where('id', '[0-9]+');
    Route::delete('/messages/{id}', [MessageController::class, 'destroy'])->where('id', '[0-9]+');
    Route::put('/messages/{id}/lu', [MessageController::class, 'marquerCommeLu'])->where('id', '[0-9]+');
    Route::get('/conversations/{expediteur_id}/{destinataire_id}', [MessageController::class, 'conversation'])->where(['expediteur_id' => '[0-9]+', 'destinataire_id' => '[0-9]+']);
    Route::get('/conversations/commande/{commandeId}', [MessageController::class, 'conversationByCommande'])->where(['commandeId' => '[0-9]+']);
    Route::get('/conversations/client/{clientId}', [MessageController::class, 'conversationByClient'])->where(['clientId' => '[0-9]+']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/utilisateurs/{id}/messages', [MessageController::class, 'messagesUtilisateur'])->where('id', '[0-9]+');

    // Users management (admin only)
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->where('user', '[0-9]+');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->where('user', '[0-9]+');

    // Liste des employés (pour attribution des commandes) - réservé aux admins
    Route::get('/users/employees', function (Request $request) {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Accès réservé aux administrateurs'], 403);
        }
        $employees = \App\Models\User::where('role', 'employee')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        return response()->json(['success' => true, 'data' => $employees]);
    });

    Route::post('/panier/ajouter', [CommandeController::class, 'ajouterAuPanier']);
    Route::delete('/panier/retirer', [CommandeController::class, 'retirerDuPanier']);

});

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::post('/auth/profile', [AuthController::class, 'updateProfile']); // POST pour multipart/form-data
    Route::get('/auth/me', [AuthController::class, 'me']);
});



// Configuration de diffusion (Broadcasting)
Broadcast::channel('chat', function ($user) {
    return $user != null;
});


// ==========================
// Support (IA) - endpoints
// ==========================
// NB: Pour une première version, on laisse ces routes publiques. Pour un environnement prod,
// il est recommandé d'ajouter une forme d'authentification ou un jeton anonyme par conversation.
Route::prefix('support')->group(function () {
    Route::post('/conversations', [SupportController::class, 'create']);
    Route::get('/conversations/{conversation}', [SupportController::class, 'show']);
    Route::post('/messages', [SupportController::class, 'sendMessage']);
});


