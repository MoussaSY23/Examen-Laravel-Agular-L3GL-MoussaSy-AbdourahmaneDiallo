<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'expediteur_id',
        'destinataire_id',
        'contenu',
        'lu',
    ];

    protected $casts = [
        'lu' => 'boolean',
    ];

    public function expediteur()
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }
}
