<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('assessment_type', ['phq9', 'gad7', 'audit', 'pgsi', 'ftnd']);
            $table->integer('score');
            $table->string('severity', 30);
            $table->text('interpretation');
            $table->text('recommendations');
            $table->json('responses');
            $table->boolean('is_crisis_flag')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
