<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eap_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eap_subscription_id')->constrained('eap_subscriptions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('sessions_used')->default(0);
            $table->integer('sessions_allowed')->default(4);
            $table->boolean('is_active')->default(true);
            $table->timestamp('joined_at')->useCurrent();
            $table->unique(['eap_subscription_id', 'user_id'], 'eap_emp_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eap_employees');
    }
};
