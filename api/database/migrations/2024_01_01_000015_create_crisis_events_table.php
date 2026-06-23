<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crisis_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('trigger_source', ['assessment', 'mood_log', 'craving_log']);
            $table->text('content');
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->json('keywords_detected');
            $table->string('response_action', 100)->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crisis_events');
    }
};
