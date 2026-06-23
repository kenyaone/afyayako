<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sobriety_trackers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('substance', ['alcohol', 'gambling', 'tobacco', 'cannabis', 'miraa', 'other']);
            $table->date('start_date');
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->integer('total_relapses')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unique(['user_id', 'substance']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sobriety_trackers');
    }
};
