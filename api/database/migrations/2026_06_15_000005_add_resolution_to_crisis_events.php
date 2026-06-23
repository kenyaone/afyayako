<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('crisis_events', function (Blueprint $table) {
            $table->timestamp('resolved_at')->nullable()->after('resolved');
            $table->unsignedBigInteger('resolved_by')->nullable()->after('resolved_at');
            $table->text('resolution_notes')->nullable()->after('resolved_by');
            $table->boolean('escalated')->default(false)->after('resolution_notes');
        });
    }

    public function down(): void
    {
        Schema::table('crisis_events', function (Blueprint $table) {
            $table->dropColumn(['resolved_at', 'resolved_by', 'resolution_notes', 'escalated']);
        });
    }
};
