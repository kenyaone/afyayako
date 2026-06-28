<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add missing columns required by the new code
        Schema::table('professionals', function (Blueprint $table) {
            // Email and name (from users table if needed)
            if (!Schema::hasColumn('professionals', 'email')) {
                $table->string('email')->unique()->nullable()->after('id');
            }
            if (!Schema::hasColumn('professionals', 'full_name')) {
                $table->string('full_name')->nullable()->after('email');
            }
            if (!Schema::hasColumn('professionals', 'phone')) {
                $table->string('phone')->nullable()->after('full_name');
            }

            // Professional type
            if (!Schema::hasColumn('professionals', 'professional_type')) {
                $table->enum('professional_type', ['counselor', 'doctor', 'peer_mentor', 'corporate'])
                    ->default('counselor')->after('cpb_license');
            }

            // Photo paths (consolidate profile_photo -> professional_photo_path)
            if (!Schema::hasColumn('professionals', 'professional_photo_path')) {
                $table->string('professional_photo_path')->nullable()->after('professional_photo');
            }
            if (!Schema::hasColumn('professionals', 'professional_photo_original_name')) {
                $table->string('professional_photo_original_name')->nullable()->after('professional_photo_path');
            }

            // License document
            if (!Schema::hasColumn('professionals', 'license_document_path')) {
                $table->string('license_document_path')->nullable()->after('professional_photo_original_name');
            }
            if (!Schema::hasColumn('professionals', 'license_document_original_name')) {
                $table->string('license_document_original_name')->nullable()->after('license_document_path');
            }

            // Specializations and languages as JSON
            if (!Schema::hasColumn('professionals', 'specializations')) {
                $table->json('specializations')->nullable()->after('professional_type');
            }
            if (!Schema::hasColumn('professionals', 'languages')) {
                $table->json('languages')->nullable()->after('specializations');
            }

            // Status (rename verification_status to status)
            if (!Schema::hasColumn('professionals', 'status')) {
                $table->enum('status', ['pending', 'verified', 'rejected', 'suspended'])
                    ->default('pending');
            }
            if (!Schema::hasColumn('professionals', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable();
            }
            if (!Schema::hasColumn('professionals', 'verified_at')) {
                $table->timestamp('verified_at')->nullable();
            }

            // Payment fields
            if (!Schema::hasColumn('professionals', 'bank_name')) {
                $table->string('bank_name')->nullable()->after('mpesa_number');
            }
            if (!Schema::hasColumn('professionals', 'account_number')) {
                $table->string('account_number')->nullable()->after('bank_name');
            }
            if (!Schema::hasColumn('professionals', 'account_name')) {
                $table->string('account_name')->nullable()->after('account_number');
            }
            if (!Schema::hasColumn('professionals', 'branch_code')) {
                $table->string('branch_code')->nullable()->after('account_name');
            }

            // Soft deletes
            if (!Schema::hasColumn('professionals', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('professionals', function (Blueprint $table) {
            $columns = ['email', 'full_name', 'phone', 'professional_type', 'professional_photo_path',
                       'professional_photo_original_name', 'license_document_path', 'license_document_original_name',
                       'specializations', 'languages', 'status', 'rejection_reason', 'bank_name',
                       'account_number', 'account_name', 'branch_code', 'deleted_at'];

            foreach ($columns as $col) {
                if (Schema::hasColumn('professionals', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
