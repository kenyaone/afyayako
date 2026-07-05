<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds consultations.eap_subscription_id so that we can attribute a
 * consultation to the specific EAP subscription that paid for it.
 *
 * Idempotent — no-op if column already exists (e.g. on live where we
 * added it manually via tinker on 2026-07-05).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('consultations', 'eap_subscription_id')) {
            return;
        }
        Schema::table('consultations', function (Blueprint $table) {
            $table->foreignId('eap_subscription_id')
                ->nullable()
                ->after('professional_id')
                ->constrained('eap_subscriptions')
                ->nullOnDelete();
            $table->index('eap_subscription_id');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('consultations', 'eap_subscription_id')) {
            return;
        }
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['eap_subscription_id']);
            $table->dropColumn('eap_subscription_id');
        });
    }
};
