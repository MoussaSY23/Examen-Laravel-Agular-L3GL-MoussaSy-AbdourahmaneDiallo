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
        Schema::table('users', function (Blueprint $table) {
            $table->string('telephone')->nullable()->after('email');
            $table->string('adresse')->nullable()->after('telephone');
            $table->string('ville')->nullable()->after('adresse');
            $table->string('avatar')->nullable()->after('ville');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telephone', 'adresse', 'ville', 'avatar']);
        });
    }
};
