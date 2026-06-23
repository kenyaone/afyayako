<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The booking flow sets consultations.status = 'draft' (pre-payment), but the
 * live MySQL enum was created without it (SQLite didn't enforce the enum, so
 * this only surfaced on production). Widen the enum to include 'draft'.
 */
return new class extends Migration {
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return; // SQLite stores status as TEXT — no enum constraint
        }
        DB::statement("ALTER TABLE consultations MODIFY status
            ENUM('draft','pending','confirmed','in_progress','completed','cancelled','refunded')
            NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }
        DB::statement("ALTER TABLE consultations MODIFY status
            ENUM('pending','confirmed','in_progress','completed','cancelled','refunded')
            NOT NULL DEFAULT 'pending'");
    }
};
