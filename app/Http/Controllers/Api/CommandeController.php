<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommandeRequest;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\User;
use App\Services\CommandeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function __construct(private CommandeService $service) {}

    public function index(): JsonResponse
    {
        return response()->json($this->service->lister());
    }

    public function show(int $id): JsonResponse
    {
        $commande = $this->service->trouverParId($id);
        if (!$commande) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }
        return response()->json($commande);
    }

    public function store(StoreCommandeRequest $request): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $validated = $request->validated();
            
            // Vérifier l'utilisateur
            $user = User::find($validated['user_id']);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }
            
            // Vérifier les produits et préparer les données
            $produits = [];
            $total = 0;
            
            foreach ($validated['produits'] as $item) {
                $produit = Produit::find($item['produit_id']);
                
                if (!$produit) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Produit non trouvé: ' . $item['produit_id']
                    ], 404);
                }
                
                if ($produit->stock < $item['quantite']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stock insuffisant pour le produit: ' . $produit->nom,
                        'stock_disponible' => $produit->stock
                    ], 400);
                }
                
                $prixTotal = $produit->prix * $item['quantite'];
                $total += $prixTotal;
                
                $produits[$produit->id] = [
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $produit->prix,
                    'prix_total' => $prixTotal
                ];
                
                // Mettre à jour le stock
                $produit->decrement('stock', $item['quantite']);
            }
            
            // Créer la commande
            $commande = new Commande([
                'user_id' => $user->id,
                'mode_paiement' => $validated['mode_paiement'],
                'adresse_livraison' => $validated['adresse_livraison'],
                'notes' => $validated['notes'] ?? null,
                'total' => $total,
                'statut' => 'en_preparation',
                'date_commande' => now()
            ]);
            
            $commande->save();
            
            // Attacher les produits à la commande
            $commande->produits()->attach($produits);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'data' => $commande->load('produits')
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            logger()->error('Erreur création commande: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la commande',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur'
            ], 500);
        }
    }

    public function updateStatut(Commande $commande, string $statut): JsonResponse
    {
        $commande = $this->service->mettreAJourStatut($commande, $statut);
        return response()->json($commande);
    }

    public function genererFacture(Commande $commande)
    {
        $pdfPath = $this->service->genererFacture($commande);
        return response()->download($pdfPath);
    }

    public function envoyerFacture(Commande $commande)
    {
        $this->service->envoyerFacture($commande);
        return response()->json(['message' => 'Facture envoyée par email']);
    }
}
