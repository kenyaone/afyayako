<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professionals', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('full_name');
            $table->string('phone')->nullable();

            // Professional Information
            $table->enum('professional_type', ['counselor', 'doctor', 'peer_mentor', 'corporate'])->default('counselor');
            $table->string('kmpdc_license')->nullable();
            $table->string('cpb_license')->nullable();

            // Photo Upload
            $table->string('professional_photo_path')->nullable();
            $table->string('professional_photo_original_name')->nullable();

            // License Document Upload
            $table->string('license_document_path')->nullable();
            $table->string('license_document_original_name')->nullable();

            // Specializations & Languages (JSON)
            $table->json('specializations')->nullable();
            $table->json('languages')->nullable();

            // SOP Consent
            $table->boolean('sop_agreed')->default(false);
            $table->timestamp('sop_agreed_at')->nullable();
            $table->string('signature_name')->nullable();

            // Payment Information
            $table->string('mpesa_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('branch_code')->nullable();
            $table->decimal('rate_per_hour', 10, 2)->nullable();

            // Status & Verification
            $table->enum('status', ['pending', 'verified', 'rejected', 'suspended'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();

            // Metadata
            $table->text('bio')->nullable();
            $table->integer('years_experience')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('email');
            $table->index('status');
            $table->index('professional_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professionals');
    }
};
