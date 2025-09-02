<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Categorie extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'categories';

    protected $fillable = [
        'nom',
        'description',
        'position',
        'actif',
    ];

    public function produits()
    {
        return $this->hasMany(Produit::class, 'categorie_id');
    }
}
