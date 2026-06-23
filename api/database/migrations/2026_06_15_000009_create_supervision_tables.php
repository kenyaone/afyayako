<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Supervision of practitioners (MoH Guideline 9): practitioners must have
 * ongoing formal support supervision. This adds supervisor↔supervisee
 * assignments and a log of supervision sessions.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('supervisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supervisor_id')->constrained('professionals')->cascadeOnDelete();
            $table->foreignId('supervisee_id')->constrained('professionals')->cascadeOnDelete();
            $table->unsignedBigInteger('assigned_by')->nullable(); // admin user id
            $table->enum('status', ['active', 'ended'])->default('active');
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['supervisor_id', 'status']);
            $table->index(['supervisee_id', 'status']);
        });

        Schema::create('supervision_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supervision_id')->constrained('supervisions')->cascadeOnDelete();
            $table->date('session_date');
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->text('notes')->nullable();      // encrypted at rest
            $table->unsignedBigInteger('created_by'); // professional user id
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervision_sessions');
        Schema::dropIfExists('supervisions');
    }
};
