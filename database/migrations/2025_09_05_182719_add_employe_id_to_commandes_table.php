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
        Schema::table('commandes', function (Blueprint $table) {
            $table->foreignId('employe_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->after('user_id'); // après le client qui a passé la commande
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['employe_id']);
            $table->dropColumn('employe_id');
        });
    }
};
