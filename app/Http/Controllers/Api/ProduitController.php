<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProduitRequest;
use App\Http\Requests\UpdateProduitRequest;
use App\Models\Produit;
use App\Services\ProduitService;
use Illuminate\Http\JsonResponse;

class ProduitController extends Controller
{
    public function __construct(private ProduitService $service) {}

    public function index(): JsonResponse
    {
        $produits = $this->service->lister();
        return response()->json($produits);
    }

    /**
     * Afficher un produit par son id
     */
    public function show(int $id): JsonResponse
    {
        $produit = $this->service->trouverParId($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit introuvable'], 404);
        }

        return response()->json($produit);
    }

    public function store(StoreProduitRequest $request): JsonResponse
    {
        $produit = $this->service->creer($request->validated());
        return response()->json($produit, 201);
    }

    public function update(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        $produit = $this->service->modifier($produit, $request->validated());
        return response()->json($produit);
    }

    public function destroy(Produit $produit): JsonResponse
    {
        $produit->delete();
        return response()->json(['message' => 'Produit supprimé avec succès']);
    }

    public function appliquerPromotion(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        $promo = $request->only(['prix_promotion', 'date_debut_promotion', 'date_fin_promotion']);
        $produit = $this->service->appliquerPromotion($produit, $promo);
        return response()->json($produit);
    }

    public function decrementerStock(Produit $produit, int $quantite): JsonResponse
    {
        $success = $this->service->decrementerStock($produit, $quantite);
        return response()->json(['success' => $success]);
    }
}
