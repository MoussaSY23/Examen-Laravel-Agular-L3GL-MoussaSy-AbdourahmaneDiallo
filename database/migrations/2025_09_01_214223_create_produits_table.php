<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();

            // FK vers categories
            $table->foreignId('categorie_id')->constrained('categories')->onDelete('cascade');

            // Informations produit
            $table->string('nom');
            $table->text('description')->nullable();

            // Prix et taxes
            $table->decimal('prix', 10, 2)->default(0.00);

            // Promotion
            $table->boolean('en_promotion')->default(false);
            $table->decimal('prix_promotion', 10, 2)->nullable();
            $table->timestamp('date_debut_promotion')->nullable();
            $table->timestamp('date_fin_promotion')->nullable();

            // Stock & logistique
            $table->integer('stock')->default(0);

            // Unités & dimensions
            $table->string('unite')->nullable();

            $table->string('image_principale')->nullable();
            $table->json('images')->nullable();

            $table->boolean('actif')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->fullText(['nom', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
