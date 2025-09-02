<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\CategorieController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes publiques (lecture)
Route::get('/produits', [ProduitController::class, 'index']);           // liste paginée
Route::get('/produits/{slug}', [ProduitController::class, 'show']);    // détail par slug
Route::get('/categories', [CategorieController::class, 'index']);      // liste catégories
Route::get('/categories/{categorie}', [CategorieController::class, 'show']); // détail catégorie

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });



// Produits
    Route::get('/produits', [ProduitController::class, 'index']);
    Route::get('/produits/{id}', [ProduitController::class, 'show']); // ID maintenant

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/produits', [ProduitController::class, 'store']);
        Route::put('/produits/{produit}', [ProduitController::class, 'update']);
        Route::delete('/produits/{produit}', [ProduitController::class, 'destroy']);

        Route::post('/produits/{produit}/promotion', [ProduitController::class, 'appliquerPromotion']);
        Route::post('/produits/{produit}/decrementer-stock/{quantite}', [ProduitController::class, 'decrementerStock']);

        // Catégories CRUD
        Route::post('/categories', [CategorieController::class, 'store']);
        Route::put('/categories/{categorie}', [CategorieController::class, 'update']);
        Route::delete('/categories/{categorie}', [CategorieController::class, 'destroy']);


        Route::get('/commandes', [CommandeController::class, 'index']);
        Route::get('/commandes/{id}', [CommandeController::class, 'show']);
        Route::post('/commandes', [CommandeController::class, 'store']);
        Route::patch('/commandes/{commande}/statut/{statut}', [CommandeController::class, 'updateStatut']);
    });

// Catégories publiques
    Route::get('/categories', [CategorieController::class, 'index']);
    Route::get('/categories/{categorie}', [CategorieController::class, 'show']);


    Route::get('/commandes/{commande}/facture', [CommandeController::class, 'genererFacture']);
    Route::post('/commandes/{commande}/facture/email', [CommandeController::class, 'envoyerFacture']);

});
