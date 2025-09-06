<?php
namespace App\Services;

use App\Repositories\ProduitRepository;
use App\Models\Produit;
use Illuminate\Support\Facades\Storage;

class ProduitService
{
    public function __construct(private ProduitRepository $repo) {}

    public function lister()
    {
        return $this->repo->paginate(20);
    }

    public function trouverParId(int $id): ?Produit
    {
        return $this->repo->find($id);
    }

    public function creer(array $data): Produit
    {
        // image principale
        if (isset($data['image_principale']) && $data['image_principale'] instanceof \Illuminate\Http\UploadedFile) {
            $data['image_principale'] = $data['image_principale']->store('produits/principales', 'public');
        }

        // images multiples
        if (isset($data['images']) && is_array($data['images'])) {
            $uploadedImages = [];
            foreach ($data['images'] as $image) {
                if ($image instanceof \Illuminate\Http\UploadedFile) {
                    $uploadedImages[] = $image->store('produits/images', 'public');
                }
            }
            $data['images'] = !empty($uploadedImages) ? $uploadedImages : null; // **array**, pas JSON string
        }

        return $this->repo->create($data);
    }


    public function modifier(Produit $produit, array $data): Produit
    {
        // image principale
        if (isset($data['image_principale']) && $data['image_principale'] instanceof \Illuminate\Http\UploadedFile) {
            if ($produit->image_principale && Storage::disk('public')->exists($produit->image_principale)) {
                Storage::disk('public')->delete($produit->image_principale);
            }
            $data['image_principale'] = $data['image_principale']->store('produits/principales', 'public');
        } elseif (isset($data['image_principale_existing'])) {
            $data['image_principale'] = $data['image_principale_existing'];
        }

        // images existantes & nouvelles
        $existing = $produit->images ?? [];
        $keep = $data['images_existing'] ?? [];

        // supprimer fichiers retirés
        $removed = array_diff($existing, $keep);
        foreach ($removed as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $finalImages = array_values($keep);
        if (isset($data['images']) && is_array($data['images'])) {
            foreach ($data['images'] as $image) {
                if ($image instanceof \Illuminate\Http\UploadedFile) {
                    $finalImages[] = $image->store('produits/images', 'public');
                }
            }
        }

        $data['images'] = !empty($finalImages) ? $finalImages : null;
        unset($data['image_principale_existing'], $data['images_existing']);

        $produit->update($data);
        $produit->refresh();
        return $produit;
    }


    public function decrementerStock(Produit $produit, int $qty): bool
    {
        return $this->repo->decrementStock($produit->id, $qty);
    }

    public function appliquerPromotion(Produit $produit, array $promo): Produit
    {
        $updateData = [
            'en_promotion' => true,
            'prix_promotion' => $promo['prix_promotion'] ?? $produit->prix,
        ];

        if (isset($promo['date_debut_promotion'])) {
            $updateData['date_debut_promotion'] = $promo['date_debut_promotion'];
        }

        if (isset($promo['date_fin_promotion'])) {
            $updateData['date_fin_promotion'] = $promo['date_fin_promotion'];
        }

        return $this->repo->update($produit, $updateData);
    }

    public function supprimerImage(Produit $produit, string $imagePath): bool
    {
        // Supprimer le fichier physique
        if (Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        // Mettre à jour la liste des images
        $images = $produit->images ? json_decode($produit->images, true) : [];
        $images = array_filter($images, fn($img) => $img !== $imagePath);

        $produit->update(['images' => !empty($images) ? json_encode($images) : null]);

        return true;
    }
}
