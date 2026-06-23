<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * MoH Guideline 9 — supervision is oversight, so an admin designates which
 * professionals are eligible to act as supervisors; supervisions are then
 * assigned from that pool.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('professionals', function (Blueprint $table) {
            if (!Schema::hasColumn('professionals', 'is_eligible_supervisor')) {
                $table->boolean('is_eligible_supervisor')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('professionals', function (Blueprint $table) {
            if (Schema::hasColumn('professionals', 'is_eligible_supervisor')) {
                $table->dropColumn('is_eligible_supervisor');
            }
        });
    }
};
