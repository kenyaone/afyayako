<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->unique()->constrained('consultations')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('phone', 15);
            $table->string('mpesa_checkout_id', 100)->nullable();
            $table->string('mpesa_transaction_id', 100)->nullable();
            $table->string('mpesa_result_code', 10)->nullable();
            $table->text('mpesa_result_desc')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
