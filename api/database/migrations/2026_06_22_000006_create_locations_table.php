<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('locations')) {
            Schema::create('locations', function (Blueprint $table) {
                $table->id();
                $table->string('name');                 // display label, e.g. "Nairobi CBD"
                $table->string('county')->nullable();    // e.g. "Nairobi"
                $table->string('town')->nullable();      // e.g. "Nairobi"
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_custom')->default(false);
                $table->timestamps();
            });
        }

        // Seed a starter set of Kenyan locations (only if empty).
        if (DB::table('locations')->count() === 0) {
            $now = now();
            $seed = [
                ['Nairobi', 'Nairobi', -1.2864, 36.8172],
                ['Mombasa', 'Mombasa', -4.0435, 39.6682],
                ['Kisumu', 'Kisumu', -0.0917, 34.7680],
                ['Nakuru', 'Nakuru', -0.3031, 36.0800],
                ['Eldoret', 'Uasin Gishu', 0.5143, 35.2698],
                ['Thika', 'Kiambu', -1.0333, 37.0693],
                ['Nyeri', 'Nyeri', -0.4201, 36.9476],
                ['Machakos', 'Machakos', -1.5177, 37.2634],
                ['Kakamega', 'Kakamega', 0.2827, 34.7519],
                ['Meru', 'Meru', 0.0463, 37.6559],
            ];
            $rows = [];
            foreach ($seed as [$name, $county, $lat, $lng]) {
                $rows[] = [
                    'name' => $name, 'county' => $county, 'town' => $name,
                    'latitude' => $lat, 'longitude' => $lng,
                    'is_active' => true, 'is_custom' => false,
                    'created_at' => $now, 'updated_at' => $now,
                ];
            }
            DB::table('locations')->insert($rows);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
