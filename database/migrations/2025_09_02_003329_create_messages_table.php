<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            // FK vers l'utilisateur qui envoie le message
            $table->foreignId('expediteur_id')->constrained('users')->onDelete('cascade');

            // FK vers l'utilisateur qui reçoit le message (peut être null pour messages non assignés)
            $table->foreignId('destinataire_id')->nullable()->constrained('users')->onDelete('cascade');

            $table->text('contenu');
            $table->boolean('lu')->default(false); // si le message a été lu

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
