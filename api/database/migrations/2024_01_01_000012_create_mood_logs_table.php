<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mood_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('mood', ['excellent', 'good', 'neutral', 'sad', 'terrible']);
            $table->integer('mood_score');
            $table->integer('energy_level');
            $table->integer('sleep_quality');
            $table->text('triggers')->nullable();
            $table->text('coping_strategy')->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('logged_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mood_logs');
    }
};
