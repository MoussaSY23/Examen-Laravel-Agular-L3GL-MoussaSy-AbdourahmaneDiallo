<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\ProduitRequest;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\StoreProduitRequest;
use App\Http\Requests\UpdateProduitRequest;
use App\Models\Produit;
use App\Services\ProduitService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


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
    public function show(Produit $produit): JsonResponse
    {
        try {
            // The $produit is automatically resolved by Laravel's route model binding

            // Convertir la chaîne JSON des images en tableau si nécessaire
            if ($produit->images && is_string($produit->images)) {
                $produit->images = json_decode($produit->images, true);
            }

            return response()->json([
                'success' => true,
                'data' => $produit
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération du produit: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreProduitRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            // Gérer le téléchargement de l'image principale
            if ($request->hasFile('image_principale')) {
                $data['image_principale'] = $request->file('image_principale');
            }

            // Gérer les images supplémentaires
            if ($request->hasFile('images')) {
                $data['images'] = $request->file('images');
            }

            $produit = $this->service->creer($data);

            return response()->json([
                'success' => true,
                'data' => $produit,
                'message' => 'Produit créé avec succès'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création du produit: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(UpdateProduitRequest $request, Produit $produit): JsonResponse
    {
        $validated = $request->validated();

        // si fichiers, les attacher aux données (le service s'en chargera)
        if ($request->hasFile('image_principale')) {
            $validated['image_principale'] = $request->file('image_principale');
        } elseif ($request->filled('image_principale_existing')) {
            $validated['image_principale_existing'] = $request->input('image_principale_existing');
        }

        if ($request->hasFile('images')) {
            $validated['images'] = $request->file('images');
        }

        if ($request->filled('images_existing')) {
            $validated['images_existing'] = $request->input('images_existing'); // prepareForValidation s'en occupe
        }

        try {
            $produit = $this->service->modifier($produit, $validated);
            return response()->json(['success' => true, 'data' => $produit, 'message' => 'Produit mis à jour avec succès']);
        } catch (\Exception $e) {
            \Log::error('Erreur update produit', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Erreur serveur'], 500);
        }
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
// Dans la classe ProduitController

    public function getById(int $id): JsonResponse
    {
        // Appelle la méthode `trouverParId` du service pour rechercher le produit
        $produit = $this->service->trouverParId($id);

        // Vérifie si le produit existe
        if (!$produit) {
            // Retourne une erreur 404 si le produit n'est pas trouvé
            return response()->json(['message' => 'Produit introuvable'], 404);
        }

        // Retourne le produit en tant que réponse JSON
        return response()->json($produit);
    }

    public function parCategorie($id)
    {
        $produits = Produit::where('categorie_id', $id)->get();

        return response()->json($produits);
    }
}
