<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommandeRequest;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\User;
use App\Services\CommandeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function __construct(private CommandeService $service) {}

    public function index(): JsonResponse
    {
        return response()->json($this->service->lister());
    }

    public function assignToEmployee(Request $request, Commande $commande): JsonResponse
    {
        // Vérifier que l'utilisateur est admin (sécurité côté serveur)
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Accès réservé aux administrateurs'], 403);
        }

        // Cette action doit être protégée par un middleware role:admin au niveau des routes
        $data = $request->validate([
            'employe_id' => 'required|integer|exists:users,id'
        ]);
        $employe = \App\Models\User::find($data['employe_id']);
        if (!$employe || $employe->role !== 'employee') {
            return response()->json(['success' => false, 'message' => "L'utilisateur sélectionné n'est pas un employé"], 422);
        }

        $commande->employe_id = $employe->id;
        $commande->save();

        return response()->json(['success' => true, 'message' => 'Commande attribuée à un employé', 'commande' => $commande->load('employe')]);
    }


    public function retirerDuPanier(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Utilisateur non authentifié'], 401);
            }

            $request->validate([
                'produit_id' => 'required|integer|exists:produits,id',
            ]);

            $produitId = (int) $request->produit_id;

            // Panier actif de l'utilisateur
            $panier = Commande::where('user_id', $user->id)
                ->where('statut', 'en_preparation')
                ->first();

            if (!$panier) {
                return response()->json(['success' => false, 'message' => 'Aucun panier actif'], 404);
            }

            $ligne = $panier->produits()->where('produits.id', $produitId)->first();
            if (!$ligne) {
                return response()->json(['success' => false, 'message' => 'Produit non présent dans le panier'], 404);
            }

            DB::beginTransaction();

            // Restaurer le stock avec la quantité présente dans le pivot
            $quantite = (int) $ligne->pivot->quantite;
            $produit = Produit::find($produitId);
            if ($produit && $quantite > 0) {
                $produit->increment('stock', $quantite);
            }

            // Détacher la ligne du panier
            $panier->produits()->detach($produitId);

            // Recalculer le total
            $totalPanier = $panier->produits()->sum(DB::raw('commande_produit.quantite * commande_produit.prix_unitaire'));
            $panier->total = $totalPanier;
            $panier->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Produit retiré du panier',
                'panier' => $panier->load('produits')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur retirerDuPanier: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du retrait du panier',
                'error' => $e->getMessage()
            ], 500);
        }
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
            $user = User::find($validated['user_id']);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Vérifier s'il existe déjà un panier actif pour cet utilisateur
            $commande = Commande::where('user_id', $user->id)
                ->where('statut', 'en_preparation')
                ->first();

            $total = 0;
            $produitsData = [];

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

                $produitsData[$produit->id] = [
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $produit->prix,
                    'prix_total' => $prixTotal
                ];

                // Mettre à jour le stock
                $produit->decrement('stock', $item['quantite']);
            }

            if ($commande) {
                // Ajouter les nouveaux produits au panier existant
                foreach ($produitsData as $prodId => $data) {
                    if ($commande->produits()->where('produit_id', $prodId)->exists()) {
                        // Si le produit existe déjà, incrémenter la quantité
                        $pivotData = $commande->produits()->where('produit_id', $prodId)->first()->pivot;
                        $commande->produits()->updateExistingPivot($prodId, [
                            'quantite' => $pivotData->quantite + $data['quantite'],
                            'prix_total' => $pivotData->prix_total + $data['prix_total']
                        ]);
                    } else {
                        $commande->produits()->attach($prodId, $data);
                    }
                }
                // Mettre à jour le total
                $commande->total += $total;
                $commande->save();
            } else {
                // Créer un nouveau panier
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
                $commande->produits()->attach($produitsData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $commande->load('produits')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la commande',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur'
            ], 500);
        }
    }


    public function commandesUtilisateur($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Récupère toutes les commandes de l'utilisateur
        $commandes = Commande::with('produits', 'client', 'employe')
            ->where('user_id', $id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $commandes
        ]);
    }


//    public function store(StoreCommandeRequest $request): JsonResponse
//    {
//        DB::beginTransaction();
//
//        try {
//            $validated = $request->validated();
//
//            // Vérifier l'utilisateur
//            $user = User::find($validated['user_id']);
//            if (!$user) {
//                return response()->json([
//                    'success' => false,
//                    'message' => 'Utilisateur non trouvé'
//                ], 404);
//            }
//
//            // Vérifier les produits et préparer les données
//            $produits = [];
//            $total = 0;
//
//            foreach ($validated['produits'] as $item) {
//                $produit = Produit::find($item['produit_id']);
//
//                if (!$produit) {
//                    return response()->json([
//                        'success' => false,
//                        'message' => 'Produit non trouvé: ' . $item['produit_id']
//                    ], 404);
//                }
//
//                if ($produit->stock < $item['quantite']) {
//                    return response()->json([
//                        'success' => false,
//                        'message' => 'Stock insuffisant pour le produit: ' . $produit->nom,
//                        'stock_disponible' => $produit->stock
//                    ], 400);
//                }
//
//                $prixTotal = $produit->prix * $item['quantite'];
//                $total += $prixTotal;
//
//                $produits[$produit->id] = [
//                    'quantite' => $item['quantite'],
//                    'prix_unitaire' => $produit->prix,
//                    'prix_total' => $prixTotal
//                ];
//
//                // Mettre à jour le stock
//                $produit->decrement('stock', $item['quantite']);
//            }
//
//            // Créer la commande
//            $commande = new Commande([
//                'user_id' => $user->id,
//                'mode_paiement' => $validated['mode_paiement'],
//                'adresse_livraison' => $validated['adresse_livraison'],
//                'notes' => $validated['notes'] ?? null,
//                'total' => $total,
//                'statut' => 'en_preparation',
//                'date_commande' => now()
//            ]);
//
//            $commande->save();
//
//            // Attacher les produits à la commande
//            $commande->produits()->attach($produits);
//
//            DB::commit();
//
//            return response()->json([
//                'success' => true,
//                'data' => $commande->load('produits')
//            ], 201);
//
//        } catch (\Exception $e) {
//            DB::rollBack();
//            logger()->error('Erreur création commande: ' . $e->getMessage());
//            logger()->error($e->getTraceAsString());
//
//            return response()->json([
//                'success' => false,
//                'message' => 'Erreur lors de la création de la commande',
//                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur'
//            ], 500);
//        }
//    }

    public function updateStatut(Request $request, Commande $commande): JsonResponse
    {
        $request->validate([
            'statut' => 'required|string|in:en_preparation,en_livraison,livree,annulee'
        ]);
        $statut = $request->input('statut');
        $commande = $this->service->mettreAJourStatut($commande, $statut);
        return response()->json($commande);
    }

    public function genererFacture(Commande $commande)
    {
        try {
            $pdfPath = $this->service->genererFacture($commande);
            return response()->download($pdfPath);
        } catch (\Throwable $e) {
            \Log::error('Erreur génération facture: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => "Erreur lors de la génération de la facture",
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function envoyerFacture(Commande $commande)
    {
        try {
            $this->service->envoyerFacture($commande);
            return response()->json(['success' => true, 'message' => 'Facture envoyée par email']);
        } catch (\Throwable $e) {
            \Log::error('Erreur envoi facture email: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => "Impossible d'envoyer la facture par email",
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }


    public function ajouterAuPanier(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Utilisateur non authentifié'], 401);
            }

            $request->validate([
                'produit_id' => 'required|integer|exists:produits,id',
                'quantite' => 'required|integer|min:1',
            ]);

            $produitId = $request->produit_id;
            $quantite = $request->quantite;

            $produit = Produit::find($produitId);
            if (!$produit) {
                return response()->json(['success' => false, 'message' => 'Produit introuvable'], 404);
            }

            if ($produit->stock < $quantite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock insuffisant pour ' . $produit->nom,
                    'stock_disponible' => $produit->stock
                ], 400);
            }

            DB::beginTransaction();

            // Panier actif
            $panier = Commande::firstOrCreate(
                ['user_id' => $user->id, 'statut' => 'en_preparation'],
                [
                    'mode_paiement' => 'en_ligne',
                    'adresse_livraison' => $user->adresse,
                    'total' => 0,
                    'notes' => null,
                    'date_commande' => now()
                ]
            );

            // Vérifier si le produit est déjà dans le panier
            $pivotData = $panier->produits()->where('produits.id', $produitId)->first();

            if ($pivotData) {
                $nouvelleQuantite = $pivotData->pivot->quantite + $quantite;
                $panier->produits()->updateExistingPivot($produitId, [
                    'quantite' => $nouvelleQuantite,
                    'prix_total' => $nouvelleQuantite * $produit->prix
                ]);
            } else {
                $panier->produits()->attach($produitId, [
                    'quantite' => $quantite,
                    'prix_unitaire' => $produit->prix,
                    'prix_total' => $quantite * $produit->prix
                ]);
            }

            // Décrémenter le stock
            $produit->decrement('stock', $quantite);

            // Recalculer le total
            $totalPanier = $panier->produits()->sum(DB::raw('commande_produit.quantite * commande_produit.prix_unitaire'));
            $panier->total = $totalPanier;
            $panier->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Produit ajouté au panier',
                'panier' => $panier->load('produits')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur ajouterAuPanier: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout au panier',
                'error' => $e->getMessage() // pour debug
            ], 500);
        }
    }


}
