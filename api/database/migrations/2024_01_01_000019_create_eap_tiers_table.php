<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eap_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->integer('min_employees');
            $table->integer('max_employees');
            $table->decimal('price_kes_annual', 12, 2);
            $table->integer('sessions_per_employee')->default(4);
            $table->json('features');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eap_tiers');
    }
};
