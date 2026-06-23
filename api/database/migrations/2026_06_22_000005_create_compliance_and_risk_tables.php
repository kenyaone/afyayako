<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('compliance_reports')) {
            Schema::create('compliance_reports', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->index();
                $table->string('type')->default('complaint'); // complaint | incident
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('severity')->default('normal');
                $table->unsignedBigInteger('professional_id')->nullable();
                $table->string('status')->default('filed');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('client_risk_assessments')) {
            Schema::create('client_risk_assessments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('assessor_id')->index(); // professional (user id)
                $table->string('client_name')->nullable();
                $table->integer('client_age')->nullable();
                $table->integer('suicidal_ideation')->default(0);
                $table->integer('self_harm')->default(0);
                $table->integer('substance_abuse')->default(0);
                $table->integer('violence_risk')->default(0);
                $table->integer('crisis_indicators')->default(0);
                $table->string('overall_risk')->default('low');
                $table->json('payload')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_reports');
        Schema::dropIfExists('client_risk_assessments');
    }
};
