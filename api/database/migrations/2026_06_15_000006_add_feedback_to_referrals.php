<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('referrals', function (Blueprint $table) {
            // Closing the loop from the RECEIVING provider back to the referrer
            // (MoH Guideline 10: "a complete referral entails feedback from both ends").
            $table->text('receiver_notes')->nullable()->after('approval_notes');
            $table->timestamp('responded_at')->nullable()->after('receiver_notes');   // accepted/declined
            $table->text('outcome')->nullable()->after('responded_at');               // outcome of care
            $table->timestamp('outcome_at')->nullable()->after('outcome');            // when outcome reported
        });
    }

    public function down(): void
    {
        Schema::table('referrals', function (Blueprint $table) {
            $table->dropColumn(['receiver_notes', 'responded_at', 'outcome', 'outcome_at']);
        });
    }
};
