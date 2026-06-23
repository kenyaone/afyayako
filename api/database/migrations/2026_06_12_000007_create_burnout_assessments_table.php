<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('burnout_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessor_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('assessor_type');
            $table->string('specialization')->nullable();
            $table->integer('years_experience')->nullable();
            $table->integer('age')->nullable();
            $table->string('gender')->nullable();
            $table->integer('caseload_size')->nullable();
            $table->json('responses');
            $table->integer('cs_score');
            $table->integer('bo_score');
            $table->integer('sts_score');
            $table->string('cs_zone');
            $table->string('bo_zone');
            $table->string('sts_zone');
            $table->enum('overall_zone', ['green', 'yellow', 'orange', 'red']);
            $table->longText('ai_report');
            $table->string('report_sent_to')->nullable();
            $table->timestamp('report_sent_at')->nullable();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('burnout_assessments');
    }
};
