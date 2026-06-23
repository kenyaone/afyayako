<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('session_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('overall_rating');          // 1–5
            $table->unsignedTinyInteger('communication_rating');    // 1–5
            $table->boolean('felt_heard')->default(false);
            $table->boolean('would_recommend')->default(false);
            $table->boolean('felt_safe')->default(false);
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique('consultation_id');                      // one feedback per session
        });
    }
    public function down(): void { Schema::dropIfExists('session_feedback'); }
};
