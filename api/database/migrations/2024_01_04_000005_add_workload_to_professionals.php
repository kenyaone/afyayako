<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('professionals', function (Blueprint $table) {
            if (!Schema::hasColumn('professionals', 'max_clients_per_week')) {
                $table->unsignedTinyInteger('max_clients_per_week')->default(20);
            }
        });
    }
    public function down(): void {
        Schema::table('professionals', function (Blueprint $table) {
            if (Schema::hasColumn('professionals', 'max_clients_per_week')) {
                $table->dropColumn('max_clients_per_week');
            }
        });
    }
};
