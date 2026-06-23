<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('referrals', function (Blueprint $table) {
            $table->foreignId('approved_by')->nullable()->constrained('users')->cascadeOnDelete()->after('status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('approval_notes')->nullable()->after('approved_at');
            $table->string('facility_name')->nullable()->after('approval_notes');
            $table->text('facility_address')->nullable()->after('facility_name');
        });
    }

    public function down(): void {
        Schema::table('referrals', function (Blueprint $table) {
            $table->dropColumn(['approved_by', 'approved_at', 'approval_notes', 'facility_name', 'facility_address']);
        });
    }
};
