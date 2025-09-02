<?php
namespace App\Repositories;

use App\Models\Produit;
use Illuminate\Support\Facades\DB;

class ProduitRepository
{
    public function all()
    {
        return Produit::with('categorie')->get();
    }

    public function paginate(int $perPage = 20)
    {
        return Produit::with('categorie')->paginate($perPage);
    }

    public function find(int $id): ?Produit
    {
        return Produit::with('categorie')->find($id);
    }

    public function findBySlug(string $slug): ?Produit
    {
        return Produit::where('slug', $slug)->with('categorie')->first();
    }

    public function create(array $data): Produit
    {
        return Produit::create($data);
    }

    public function update(Produit $produit, array $data): Produit
    {
        $produit->update($data);
        return $produit;
    }

    public function delete(Produit $produit): void
    {
        $produit->delete();
    }

    // Décrémenter le stock en transaction
    public function decrementStock(int $produitId, int $quantity): bool
    {
        return DB::transaction(function () use ($produitId, $quantity) {
            $produit = Produit::lockForUpdate()->find($produitId);
            if (!$produit) return false;
            if ($produit->stock < $quantity) return false;
            $produit->stock -= $quantity;
            $produit->save();
            return true;
        });
    }
}
