<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('title_sw', 200)->nullable();
            $table->string('slug')->unique();
            $table->enum('category', ['depression', 'anxiety', 'alcohol', 'gambling', 'tobacco', 'relationships', 'wellness']);
            $table->enum('language', ['en', 'sw'])->default('en');
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->text('summary');
            $table->text('summary_sw')->nullable();
            $table->longText('content');
            $table->longText('content_sw')->nullable();
            $table->json('key_takeaways');
            $table->json('key_takeaways_sw')->nullable();
            $table->integer('duration_minutes')->default(10);
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_published')->default(true);
            $table->integer('order')->default(0);
            $table->string('thumbnail_emoji', 10)->default('📚');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
