<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('treatment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('professional_id')->constrained('professionals')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('description');
            $table->integer('duration_weeks');
            $table->integer('sessions_per_week');
            $table->decimal('cost_per_session', 10, 2);
            $table->decimal('total_cost', 10, 2);
            $table->enum('status', ['draft', 'pending_payment', 'active', 'completed'])->default('draft');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('treatment_plans');
    }
};
