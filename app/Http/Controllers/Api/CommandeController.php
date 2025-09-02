<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommandeRequest;
use App\Models\Commande;
use App\Services\CommandeService;
use Illuminate\Http\JsonResponse;

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
        $commande = $this->service->creer($request->validated());
        return response()->json($commande, 201);
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
