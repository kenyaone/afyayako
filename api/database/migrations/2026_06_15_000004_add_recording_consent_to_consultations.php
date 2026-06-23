<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            // MoH Guideline 4 / Data Management: a session may only be recorded
            // with explicit prior permission. Default OFF.
            $table->boolean('recording_consent')->default(false)->after('recording_deleted');
            $table->timestamp('recording_consent_at')->nullable()->after('recording_consent');
            $table->unsignedBigInteger('recording_consent_by')->nullable()->after('recording_consent_at');
        });

        // Recordings are now opt-in: stop defaulting recording_enabled to true.
        // Existing rows are left untouched; new bookings start with it off.
        // (SQLite can't alter a default in place cleanly, so we just rely on the
        //  recording_consent gate; recording_enabled stays advisory.)
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['recording_consent', 'recording_consent_at', 'recording_consent_by']);
        });
    }
};
