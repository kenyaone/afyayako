<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('craving_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('substance', ['alcohol', 'gambling', 'tobacco', 'cannabis', 'miraa', 'other']);
            $table->integer('intensity');
            $table->integer('duration_minutes')->nullable();
            $table->text('trigger')->nullable();
            $table->text('coping_strategy')->nullable();
            $table->boolean('resisted')->default(true);
            $table->text('notes')->nullable();
            $table->dateTime('logged_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('craving_logs');
    }
};
