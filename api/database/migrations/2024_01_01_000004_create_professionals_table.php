<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Authoritative create for the `professionals` table.
 *
 * NOTE: The platform moved from a user-linked provider model to a standalone
 * professional-application model. This canonical schema matches production and
 * the App\Models\Professional model. The later 2026_06_21_000001 migration that
 * also "created" this table is now a guarded no-op, and the add_* ALTER
 * migrations are idempotent (hasColumn-guarded) so they layer on extra columns
 * without colliding with this base.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('professionals')) {
            return;
        }

        Schema::create('professionals', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('full_name');
            $table->string('phone')->nullable();

            // Professional information
            $table->enum('professional_type', ['counselor', 'doctor', 'peer_mentor', 'corporate'])->default('counselor');
            $table->string('kmpdc_license')->nullable();
            $table->string('cpb_license')->nullable();

            // Photo upload
            $table->string('professional_photo_path')->nullable();
            $table->string('professional_photo_original_name')->nullable();

            // License document upload
            $table->string('license_document_path')->nullable();
            $table->string('license_document_original_name')->nullable();

            // Specializations & languages (JSON)
            $table->json('specializations')->nullable();
            $table->json('languages')->nullable();

            // SOP consent
            $table->boolean('sop_agreed')->default(false);
            $table->timestamp('sop_agreed_at')->nullable();
            $table->string('signature_name')->nullable();

            // Payment information
            $table->string('mpesa_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('branch_code')->nullable();
            $table->decimal('rate_per_hour', 10, 2)->nullable();

            // Status & verification
            $table->enum('status', ['pending', 'verified', 'rejected', 'suspended'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();

            // Metadata
            $table->text('bio')->nullable();
            $table->integer('years_experience')->nullable();

            $table->timestamps();
            $table->softDeletes();

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
