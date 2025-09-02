<?php
namespace App\Services;

use App\Repositories\ProduitRepository;
use App\Models\Produit;

class ProduitService
{
    public function __construct(private ProduitRepository $repo) {}

    public function lister()
    {
        return $this->repo->paginate(20);
    }

    public function trouverParId(int $id): ?Produit
    {
        return $this->repo->findById($id);
    }

    public function creer(array $data): Produit
    {
        return $this->repo->create($data);
    }

    public function modifier(Produit $produit, array $data): Produit
    {
        return $this->repo->update($produit, $data);
    }

    public function decrementerStock(Produit $produit, int $qty): bool
    {
        return $this->repo->decrementStock($produit->id, $qty);
    }

    public function appliquerPromotion(Produit $produit, array $promo): Produit
    {
        $produit->update([
            'en_promotion' => true,
            'prix_promotion' => $promo['prix_promotion'],
            'date_debut_promotion' => $promo['date_debut'] ?? now(),
            'date_fin_promotion' => $promo['date_fin'] ?? null,
        ]);
        return $produit;
    }
}
