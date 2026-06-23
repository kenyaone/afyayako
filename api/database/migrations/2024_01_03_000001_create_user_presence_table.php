<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_presence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('last_seen_at');
            $table->boolean('is_online')->default(false);
            $table->enum('status', ['online', 'away', 'offline'])->default('offline');
            $table->string('current_page', 255)->nullable();
            $table->unsignedBigInteger('typing_in_consultation_id')->nullable();
            $table->timestamp('typing_updated_at')->nullable();
            $table->timestamps();
            $table->unique('user_id');
            $table->index('last_seen_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_presence');
    }
};
