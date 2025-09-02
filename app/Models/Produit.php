<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produit extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'produits';

    protected $fillable = [
        'categorie_id',
        'nom',
        'description',
        'prix',
        'en_promotion',
        'prix_promotion',
        'date_debut_promotion',
        'date_fin_promotion',
        'stock',
        'unite',
        'image_principale',
        'images',
        'actif',
    ];

    protected $casts = [
        'images' => 'array',
        'en_promotion' => 'boolean',
        'date_debut_promotion' => 'datetime',
        'date_fin_promotion' => 'datetime',
    ];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    public function scopeActifs($query)
    {
        return $query->where('actif', true);
    }
}
