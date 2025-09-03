<?php

use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\CategorieController;
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
Route::get('/produits/{id}', [ProduitController::class, 'show'])->where('id', '[0-9]+');
Route::get('/categories', [CategorieController::class, 'index']);
Route::get('/categories/{id}', [CategorieController::class, 'show'])->where('id', '[0-9]+');

// Routes protégées
Route::middleware('auth:api')->group(function () {
    // Produits
    Route::post('/produits', [ProduitController::class, 'store']);
    Route::put('/produits/{id}', [ProduitController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/produits/{id}', [ProduitController::class, 'destroy'])->where('id', '[0-9]+');
    Route::post('/produits/{id}/promotion', [ProduitController::class, 'appliquerPromotion'])->where('id', '[0-9]+');
    Route::post('/produits/{id}/decrementer-stock/{quantite}', [ProduitController::class, 'decrementerStock'])->where('id', '[0-9]+');
    Route::get('/produits/categorie/{id}', [ProduitController::class, 'parCategorie'])->where('id', '[0-9]+');

    // Catégories CRUD
    Route::post('/categories', [CategorieController::class, 'store']);
    Route::put('/categories/{id}', [CategorieController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/categories/{id}', [CategorieController::class, 'destroy'])->where('id', '[0-9]+');
    Route::get('/categories/{id}/produits', [CategorieController::class, 'produits'])->where('id', '[0-9]+');

    // Commandes
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show'])->where('id', '[0-9]+');
    Route::patch('/commandes/{id}/statut', [CommandeController::class, 'updateStatut'])->where('id', '[0-9]+');
    Route::get('/commandes/{id}/facture', [CommandeController::class, 'genererFacture'])->where('id', '[0-9]+');
    Route::post('/commandes/{id}/facture/email', [CommandeController::class, 'envoyerFacture'])->where('id', '[0-9]+');
    Route::get('/utilisateurs/{id}/commandes', [CommandeController::class, 'commandesUtilisateur'])->where('id', '[0-9]+');

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{id}', [MessageController::class, 'show'])->where('id', '[0-9]+');
    Route::delete('/messages/{id}', [MessageController::class, 'destroy'])->where('id', '[0-9]+');
    Route::put('/messages/{id}/lu', [MessageController::class, 'marquerCommeLu'])->where('id', '[0-9]+');
    Route::get('/utilisateurs/{id}/messages', [MessageController::class, 'messagesUtilisateur'])->where('id', '[0-9]+');
    Route::get('/conversations/{expediteur_id}/{destinataire_id}', [MessageController::class, 'conversation'])->where(['expediteur_id' => '[0-9]+', 'destinataire_id' => '[0-9]+']);
});

// Configuration de diffusion (Broadcasting)
Broadcast::channel('chat', function ($user) {
    return $user != null;
});
