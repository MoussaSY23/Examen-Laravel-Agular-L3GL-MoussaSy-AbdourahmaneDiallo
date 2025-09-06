<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facture extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'factures';

    protected $fillable = [
        'commande_id',
        'numero',
        'total',
        'date_emission',
        'pdf_path',
        'envoye_email',
    ];

    protected $casts = [
        'date_emission' => 'datetime',
        'envoye_email' => 'boolean',
        'total' => 'decimal:2',
    ];

    // Relation vers la commande
    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }

    public function getUrlAttribute()
    {
        return asset('storage/factures/' . basename($this->pdf_path));
    }

}
