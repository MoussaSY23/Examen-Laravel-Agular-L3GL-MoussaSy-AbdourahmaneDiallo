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
        Schema::create('factures', function (Blueprint $table) {
            $table->id();

            // FK vers commande
            $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');

            $table->string('numero')->unique();          // numéro unique de facture
            $table->decimal('total', 10, 2);            // total de la facture
            $table->timestamp('date_emission')->useCurrent();
            $table->string('pdf_path')->nullable();     // chemin du fichier PDF
            $table->boolean('envoye_email')->default(false); // si la facture a été envoyée par mail

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
