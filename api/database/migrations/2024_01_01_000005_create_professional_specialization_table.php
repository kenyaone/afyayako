<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professional_specialization', function (Blueprint $table) {
            $table->foreignId('professional_id')->constrained('professionals')->onDelete('cascade');
            $table->foreignId('specialization_id')->constrained('specializations')->onDelete('cascade');
            $table->primary(['professional_id', 'specialization_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_specialization');
    }
};
