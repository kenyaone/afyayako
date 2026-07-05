<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('eap_sessions')) return;
        Schema::create('eap_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('corporate_employee_id')->constrained('corporate_employees')->onDelete('cascade');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations')->onDelete('set null');

            // Therapist info (denormalized for HR reporting)
            $table->string('therapist_name');
            $table->string('therapist_license')->nullable(); // KMPDC/CPB license

            // Session details
            $table->dateTime('session_date');
            $table->integer('session_duration_minutes')->default(60);
            $table->enum('session_status', ['scheduled', 'completed', 'cancelled', 'no-show'])->default('scheduled');

            // Billing
            $table->decimal('cost_charged', 10, 2);
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');

            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->softDeletes();

            $table->index('company_id');
            $table->index('corporate_employee_id');
            $table->index('session_date');
            $table->index('session_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eap_sessions');
    }
};
