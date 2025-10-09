<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // 👇 Si la columna actual se llama type_campaign, la renombramos
            if (Schema::hasColumn('carts', 'type_campaign')) {
                $table->renameColumn('type_campaign', 'type_campaing');
            } else {
                // Si no existe, la creamos directamente
                $table->string('type_campaing')->nullable()->after('discount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // 👇 revertimos el cambio
            if (Schema::hasColumn('carts', 'type_campaing')) {
                $table->renameColumn('type_campaing', 'type_campaign');
            }
        });
    }
};
