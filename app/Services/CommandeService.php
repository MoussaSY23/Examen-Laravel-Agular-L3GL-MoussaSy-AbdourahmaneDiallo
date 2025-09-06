<?php


namespace App\Services;

use App\Models\Commande;
use App\Models\Produit;
use Illuminate\Support\Facades\DB;
use App\Events\CommandeStatutChange;

class CommandeService
{
    public function lister()
    {
        return Commande::with(['produits', 'client', 'employe'])->paginate(20);
    }


    public function trouverParId(int $id): ?Commande
    {
        return Commande::with(['produits', 'client', 'employe'])->find($id);
    }


    public function creer(array $validatedData): Commande
    {
        return DB::transaction(function () use ($validatedData) {
            // Création de la commande avec les données validées
            $commande = Commande::create([
                'user_id' => $validatedData['user_id'],
                'mode_paiement' => $validatedData['mode_paiement'],
                'adresse_livraison' => $validatedData['adresse_livraison'],
                'notes' => $validatedData['notes'] ?? null,
                'total' => 0,
                'statut' => 'en_preparation' // Statut par défaut
            ]);

            $total = 0;

            // Traitement des produits de la commande
            foreach ($validatedData['produits'] as $produitData) {
                $produit = Produit::findOrFail($produitData['produit_id']);
                $prix_total = $produit->prixFinal() * $produitData['quantite'];
                $total += $prix_total;

                // Ajout du produit à la commande avec les détails de prix
                $commande->produits()->attach($produit->id, [
                    'quantite' => $produitData['quantite'],
                    'prix_unitaire' => $produit->prixFinal(),
                    'prix_total' => $prix_total,
                ]);

                // Mise à jour du stock du produit
                $produit->decrement('stock', $produitData['quantite']);
            }

            // Mise à jour du total de la commande
            $commande->update([
                'total' => $total,
                'date_commande' => now(),
                'date_livraison_estimee' => now()->addDays(3) // Exemple: livraison dans 3 jours
            ]);

            // TODO: Ajouter la gestion de la TVA si nécessaire

            return $commande->load('produits'); // Retourne la commande avec les produits chargés
        });
    }

    public function mettreAJourStatut(Commande $commande, string $statut): Commande
    {
        $commande->update([
            'employe_id' => auth()->id(),  // employé connecté
            'statut' => $statut
        ]);

        // Déclenchement d'un événement pour le front en temps réel
        event(new CommandeStatutChange($commande));

        return $commande;
    }

    public function genererFacture(Commande $commande): string
    {
        $factureService = new FactureService();
        // Charger les relations nécessaires pour la vue de facture
        $commande->load(['produits', 'client']);
        return $factureService->genererPDF($commande);
    }

    public function envoyerFacture(Commande $commande)
    {
        $factureService = new FactureService();
        $commande->load(['produits', 'client']);
        $pdfPath = $factureService->genererPDF($commande);
        $factureService->envoyerEmail($commande, $pdfPath);
    }


}
