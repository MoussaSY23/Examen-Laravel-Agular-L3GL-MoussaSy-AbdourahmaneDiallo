<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();

            // FK vers client
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Statut
            $table->enum('statut', ['en_preparation','prete','en_livraison','livree'])->default('en_preparation');

            // Paiement
            $table->enum('mode_paiement', ['en_ligne','a_la_livraison'])->default('a_la_livraison');

            // Totaux
            $table->decimal('total', 10, 2)->default(0);


            // Dates et livraison
            $table->timestamp('date_commande')->useCurrent();
            $table->timestamp('date_livraison_estimee')->nullable();
            $table->string('adresse_livraison')->nullable();
            $table->text('notes')->nullable();

            $table->boolean('actif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
