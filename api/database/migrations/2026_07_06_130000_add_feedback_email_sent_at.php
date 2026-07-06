<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Records when we sent the 24h feedback survey email so the scheduler
 * never double-sends. Idempotent.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('session_feedback')
            && !Schema::hasColumn('session_feedback', 'feedback_email_sent_at')) {
            Schema::table('session_feedback', function (Blueprint $t) {
                $t->timestamp('feedback_email_sent_at')->nullable()->after('feedback_requested_at');
            });
        }
    }

    public function down(): void {}
};
