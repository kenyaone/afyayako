<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('eap_subscriptions', function (Blueprint $t) {
            if (!Schema::hasColumn('eap_subscriptions', 'payment_method')) {
                // invoice_net30 | bank_transfer | cheque | mpesa
                $t->string('payment_method', 30)->nullable()->after('amount_paid');
            }
            if (!Schema::hasColumn('eap_subscriptions', 'billing_notes')) {
                $t->text('billing_notes')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('eap_subscriptions', 'activated_at')) {
                $t->timestamp('activated_at')->nullable()->after('billing_notes');
            }
        });
    }

    public function down(): void {}
};
