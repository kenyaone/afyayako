<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('professionals', function (Blueprint $table) {
            // MoH competence floor: minimum a diploma, and evidence of it.
            if (!Schema::hasColumn('professionals', 'qualification')) {
                $table->string('qualification')->nullable();          // e.g. "Diploma in Counselling"
            }
            if (!Schema::hasColumn('professionals', 'credential_document')) {
                $table->string('credential_document')->nullable();    // uploaded proof URL
            }
        });
    }

    public function down(): void
    {
        Schema::table('professionals', function (Blueprint $table) {
            foreach (['qualification', 'credential_document'] as $name) {
                if (Schema::hasColumn('professionals', $name)) {
                    $table->dropColumn($name);
                }
            }
        });
    }
};
