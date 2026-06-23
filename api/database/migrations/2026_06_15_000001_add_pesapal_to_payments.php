<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('phone');
            $table->string('pesapal_order_tracking_id')->nullable()->after('mpesa_result_desc');
        });
    }

    public function down(): void {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'pesapal_order_tracking_id']);
        });
    }
};
