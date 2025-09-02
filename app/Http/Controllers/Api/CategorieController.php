<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategorieRequest;
use App\Models\Categorie;
use App\Services\CategorieService;

class CategorieController extends Controller
{
    public function __construct(private CategorieService $service) {}

    public function index()
    {
        return response()->json($this->service->lister());
    }

    public function store(CategorieRequest $request)
    {
        $cat = $this->service->creer($request->validated());
        return response()->json($cat, 201);
    }

    public function update(CategorieRequest $request, Categorie $categorie)
    {
        return response()->json($this->service->modifier($categorie, $request->validated()));
    }

    public function destroy(Categorie $categorie)
    {
        $this->service->supprimer($categorie);
        return response()->json(['message' => 'Catégorie supprimée']);
    }
}
