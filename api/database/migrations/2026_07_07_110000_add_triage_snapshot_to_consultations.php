<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('consultations', 'triage_snapshot')) {
            Schema::table('consultations', function (Blueprint $table) {
                $table->json('triage_snapshot')->nullable()->after('share_mood_logs');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('consultations', 'triage_snapshot')) {
            Schema::table('consultations', function (Blueprint $table) {
                $table->dropColumn('triage_snapshot');
            });
        }
    }
};
