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

    public function client()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'commande_produit')
            ->withPivot('quantite','prix_unitaire','prix_total')
            ->withTimestamps();
    }
}
