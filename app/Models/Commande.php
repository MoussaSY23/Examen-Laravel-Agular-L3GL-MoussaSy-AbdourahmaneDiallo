<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commande extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employe_id',
        'statut',
        'mode_paiement',
        'total',
        'date_commande',
        'date_livraison_estimee',
        'adresse_livraison',
        'notes',
        'actif',
    ];

    protected $casts = [
        'date_commande' => 'datetime',
        'date_livraison_estimee' => 'datetime',
        'total' => 'float',
        'actif' => 'boolean',
    ];

    /**
     * Relation avec le client (User)
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relation avec l'employé qui gère la commande
     */
    public function employe()
    {
        return $this->belongsTo(User::class, 'employe_id');
    }

    /**
     * Relation avec les produits commandés
     */
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'commande_produit')
            ->withPivot('quantite', 'prix_unitaire', 'prix_total')
            ->withTimestamps();
    }


    /**
     * Retourne un tableau avec les infos complètes pour le JSON
     */
    public function toArray()
    {
        $array = parent::toArray();
        $array['client'] = $this->client ? [
            'id' => $this->client->id,
            'name' => $this->client->name,
            'email' => $this->client->email,
        ] : null;

        $array['employe'] = $this->employe ? [
            'id' => $this->employe->id,
            'name' => $this->employe->name,
            'email' => $this->employe->email,
        ] : null;

        // Ajouter les produits avec leurs détails complets
        if ($this->relationLoaded('produits')) {
            $array['produits'] = $this->produits->map(function($produit) {
                return [
                    'produit_id' => $produit->id,
                    'nom' => $produit->nom,
                    'quantite' => $produit->pivot->quantite,
                    'prix_unitaire' => $produit->pivot->prix_unitaire,
                    'prix_total' => $produit->pivot->prix_total,
                    'prod' => [
                        'id' => $produit->id,
                        'nom' => $produit->nom,
                        'description' => $produit->description,
                        'prix' => $produit->prix,
                        'image_principale' => $produit->image_principale,
                        'categorie_id' => $produit->categorie_id,
                        'en_promotion' => $produit->en_promotion,
                        'prix_promotion' => $produit->prix_promotion,
                        'stock' => $produit->stock,
                        'unite' => $produit->unite,
                        'actif' => $produit->actif,
                        'images' => $produit->images
                    ]
                ];
            });
        }

        return $array;
    }
}
