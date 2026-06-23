<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('claim_reference', 50)->unique();
            $table->string('provider', 100);
            $table->string('member_number', 100);
            $table->string('id_number', 50);
            $table->string('scheme_name', 100)->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'submitted', 'approved', 'rejected', 'co_payment_required'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
    }
};
