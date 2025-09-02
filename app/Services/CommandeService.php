<?php


namespace App\Services;

use App\Models\Commande;
use App\Models\Produit;
use Illuminate\Support\Facades\DB;

class CommandeService
{
    public function lister()
    {
        return Commande::with('produits')->paginate(20);
    }

    public function trouverParId(int $id): ?Commande
    {
        return Commande::with('produits')->find($id);
    }

    public function creer(array $data): Commande
    {
        return DB::transaction(function () use ($data) {
            $commande = Commande::create([
                'user_id' => $data['user_id'],
                'mode_paiement' => $data['mode_paiement'],
                'adresse_livraison' => $data['adresse_livraison'],
                'notes' => $data['notes'] ?? null,
                'total' => 0

            ]);

            $total = 0;

            foreach ($data['produits'] as $p) {
                $produit = Produit::findOrFail($p['produit_id']);
                $prix_total = $produit->prixFinal() * $p['quantite'];
                $total += $prix_total;

                $commande->produits()->attach($produit->id, [
                    'quantite' => $p['quantite'],
                    'prix_unitaire' => $produit->prixFinal(),
                    'prix_total' => $prix_total,
                ]);
            }

            $commande->update([
                'total' => $total,
             // TVA à gérer plus tard
            ]);

            return $commande;
        });
    }

    public function mettreAJourStatut(Commande $commande, string $statut): Commande
    {
        $commande->update(['statut' => $statut]);

        // Déclenchement d'un événement pour le front en temps réel
        event(new CommandeStatutChange($commande));

        return $commande;
    }

    public function genererFacture(Commande $commande): string
    {
        $factureService = new FactureService();
        return $factureService->genererPDF($commande);
    }

    public function envoyerFacture(Commande $commande)
    {
        $factureService = new FactureService();
        $pdfPath = $factureService->genererPDF($commande);
        $factureService->envoyerEmail($commande, $pdfPath);
    }


}
