<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Encrypted-at-rest columns must hold ciphertext (a base64 string), not JSON.
 * On MySQL these were created as JSON columns, which reject the encrypted value
 * ("Invalid JSON text"). Widen them to LONGTEXT so the `encrypted` /
 * `encrypted:array` casts work. (On SQLite these were already TEXT — no-op.)
 */
return new class extends Migration {
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return; // SQLite stores these as TEXT already
        }

        Schema::table('assessments', function (Blueprint $t) {
            $t->longText('responses')->nullable()->change();
        });

        Schema::table('safety_plans', function (Blueprint $t) {
            foreach (['warning_signs','coping_strategies','support_contacts','crisis_resources','reasons_to_live','safe_environment_steps'] as $c) {
                $t->longText($c)->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }
        Schema::table('assessments', function (Blueprint $t) {
            $t->json('responses')->nullable()->change();
        });
        Schema::table('safety_plans', function (Blueprint $t) {
            foreach (['warning_signs','coping_strategies','support_contacts','crisis_resources','reasons_to_live','safe_environment_steps'] as $c) {
                $t->json($c)->nullable()->change();
            }
        });
    }
};
