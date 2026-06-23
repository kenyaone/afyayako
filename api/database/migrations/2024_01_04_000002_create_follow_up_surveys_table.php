<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('follow_up_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('survey_type', ['3day', '1week', '1month'])->default('3day');
            $table->timestamp('due_at');
            $table->timestamp('completed_at')->nullable();
            $table->json('responses')->nullable();          // {q1: 2, q2: 1, ...}
            $table->unsignedTinyInteger('wellbeing_score')->nullable(); // 0–10
            $table->timestamps();
            $table->index(['user_id', 'completed_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('follow_up_surveys'); }
};
