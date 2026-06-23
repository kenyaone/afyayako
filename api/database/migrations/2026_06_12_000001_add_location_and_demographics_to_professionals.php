<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('professionals', function (Blueprint $table) {
            // cpb_license already exists in the canonical create; skip it here.
            $cols = [
                'location_city'        => fn () => $table->string('location_city')->nullable(),
                'location_county'      => fn () => $table->string('location_county')->nullable(),
                'latitude'             => fn () => $table->decimal('latitude', 10, 7)->nullable(),
                'longitude'            => fn () => $table->decimal('longitude', 10, 7)->nullable(),
                'tribe'                => fn () => $table->string('tribe')->nullable(),
                'date_of_birth'        => fn () => $table->date('date_of_birth')->nullable(),
                'is_available_physical'=> fn () => $table->boolean('is_available_physical')->default(false),
            ];
            foreach ($cols as $name => $add) {
                if (!Schema::hasColumn('professionals', $name)) {
                    $add();
                }
            }
        });
    }

    public function down(): void {
        Schema::table('professionals', function (Blueprint $table) {
            foreach (['location_city', 'location_county', 'latitude', 'longitude', 'tribe', 'date_of_birth', 'is_available_physical'] as $name) {
                if (Schema::hasColumn('professionals', $name)) {
                    $table->dropColumn($name);
                }
            }
        });
    }
};
