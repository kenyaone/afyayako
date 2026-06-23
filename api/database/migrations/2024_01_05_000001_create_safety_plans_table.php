<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('safety_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('professional_id')->nullable()->constrained('professionals')->onDelete('set null');
            $table->json('warning_signs')->nullable();
            $table->json('coping_strategies')->nullable();
            $table->json('support_contacts')->nullable();
            $table->json('crisis_resources')->nullable();
            $table->json('reasons_to_live')->nullable();
            $table->json('safe_environment_steps')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('safety_plans'); }
};
