<?php

namespace App\Services;

use App\Models\Commande;
use App\Models\Facture;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class FactureService
{
    /**
     * Générer le PDF d'une commande et créer une entrée en base
     */
    public function genererPDF(Commande $commande): string
    {
        // Générer le numéro unique de facture
        $numero = 'FAC-' . now()->format('Ymd') . '-' . Str::padLeft($commande->id, 4, '0');

        // Générer le PDF avec la vue Blade
        $pdf = Pdf::loadView('factures.facture', compact('commande', 'numero'));

        // Chemin de stockage
        $filename = $numero . '.pdf';
        $dir = storage_path('app/public/factures');
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $path = $dir . DIRECTORY_SEPARATOR . $filename;
        $pdf->save($path);

        // Créer ou mettre à jour la facture en base
        $facture = Facture::updateOrCreate(
            ['commande_id' => $commande->id],
            [
                'numero' => $numero,
                'total' => $commande->total,
                'date_emission' => now(),
                'pdf_path' => $path,
                'envoye_email' => false,
            ]
        );

        return $path;
    }

    /**
     * Envoyer la facture par email au client
     */
    public function envoyerEmail(Commande $commande, string $pdfPath)
    {
        // Récupérer l'email du client via la relation client()
        $client = $commande->client; // lazy load OK
        $clientEmail = $client?->email;

        if (!$clientEmail) {
            throw new \Exception('Client sans email');
        }

        try {
            Mail::send([], [], function($message) use ($clientEmail, $pdfPath, $commande) {
                $message->to($clientEmail)
                    ->subject('Votre facture de commande #' . $commande->id)
                    ->attach($pdfPath)
                    ->setBody('Bonjour, veuillez trouver ci-joint votre facture.');
            });

            // Mettre à jour la facture pour indiquer qu’elle a été envoyée
            $facture = Facture::where('commande_id', $commande->id)->first();
            if ($facture) {
                $facture->update(['envoye_email' => true]);
            }
        } catch (\Throwable $e) {
            // Log mais ne pas bloquer
            \Log::error('Erreur envoi email facture: '.$e->getMessage());
            throw $e;
        }
    }
}
