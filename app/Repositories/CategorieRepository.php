<?php
namespace App\Repositories;

use App\Models\Categorie;

class CategorieRepository
{
    public function all()
    {
        return Categorie::with('produits')->orderBy('position')->get();
    }

    public function paginate(int $perPage = 20)
    {
        return Categorie::orderBy('position')->paginate($perPage);
    }

    public function find(int $id): ?Categorie
    {
        return Categorie::find($id);
    }

    public function create(array $data): Categorie
    {
        return Categorie::create($data);
    }

    public function update(Categorie $categorie, array $data): Categorie
    {
        $categorie->update($data);
        return $categorie;
    }

    public function delete(Categorie $categorie): void
    {
        $categorie->delete();
    }
}
