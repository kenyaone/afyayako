<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('consultation_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['internal', 'external'])->default('external');
            $table->unsignedBigInteger('referred_to_professional_id')->nullable(); // for internal
            $table->string('referred_to_name', 255)->nullable();                   // for external
            $table->string('referred_to_org', 255)->nullable();
            $table->text('reason');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'accepted', 'declined', 'completed'])->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('referrals'); }
};
