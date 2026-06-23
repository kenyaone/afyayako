<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('consultations', function (Blueprint $table) {
            $table->enum('mode', ['virtual', 'physical'])->default('virtual')->after('amount');
            $table->timestamp('consent_accepted_at')->nullable()->after('mode');
            $table->boolean('booking_fee_paid')->default(false)->after('consent_accepted_at');
            $table->foreignId('booking_fee_payment_id')->nullable()->constrained('payments')->cascadeOnDelete()->after('booking_fee_paid');
        });
    }

    public function down(): void {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['mode', 'consent_accepted_at', 'booking_fee_paid', 'booking_fee_payment_id']);
        });
    }
};
