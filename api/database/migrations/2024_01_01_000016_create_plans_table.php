<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->enum('tier', ['free', 'premium', 'pro']);
            $table->decimal('price_kes', 10, 2);
            $table->enum('interval', ['monthly', 'annual'])->default('monthly');
            $table->json('features');
            $table->integer('assessment_limit')->default(3);
            $table->integer('lesson_limit')->default(8);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
