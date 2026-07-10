<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tracks whether each reminder has already been sent, so a session
 * doesn't get spammed with 3-4 identical reminders per window.
 * Idempotent — safe to re-run.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            if (!Schema::hasColumn('consultations', 'reminder_24h_sent_at')) {
                $table->timestamp('reminder_24h_sent_at')->nullable()->after('actual_end');
            }
            if (!Schema::hasColumn('consultations', 'reminder_1h_sent_at')) {
                $table->timestamp('reminder_1h_sent_at')->nullable()->after('reminder_24h_sent_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            if (Schema::hasColumn('consultations', 'reminder_1h_sent_at')) {
                $table->dropColumn('reminder_1h_sent_at');
            }
            if (Schema::hasColumn('consultations', 'reminder_24h_sent_at')) {
                $table->dropColumn('reminder_24h_sent_at');
            }
        });
    }
};
