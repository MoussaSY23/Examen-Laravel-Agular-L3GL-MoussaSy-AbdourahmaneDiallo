<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commande_produit', function (Blueprint $table) {
            $table->id();

            $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');

            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2)->default(0);
            $table->decimal('prix_total', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande_produit');
    }
};
