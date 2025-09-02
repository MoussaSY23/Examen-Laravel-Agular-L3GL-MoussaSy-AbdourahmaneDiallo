<?php
namespace App\Services;

use App\Repositories\CategorieRepository;
use App\Models\Categorie;

class CategorieService
{
    public function __construct(private CategorieRepository $repo) {}

    public function lister()
    {
        return $this->repo->all();
    }

    public function creer(array $data): Categorie
    {
        return $this->repo->create($data);
    }

    public function modifier(Categorie $categorie, array $data): Categorie
    {
        return $this->repo->update($categorie, $data);
    }

    public function supprimer(Categorie $categorie): void
    {
        $this->repo->delete($categorie);
    }
}
