<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('recovery_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('professional_id')->nullable()->constrained('professionals')->onDelete('set null');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->enum('category', ['sobriety','mental_health','relationships','work','physical','other'])->default('mental_health');
            $table->date('target_date')->nullable();
            $table->enum('status', ['active','completed','paused','abandoned'])->default('active');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->json('milestones')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('recovery_goals'); }
};
