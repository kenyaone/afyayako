<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('parental_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('guardian_name');
            $table->string('guardian_phone', 15);
            $table->string('guardian_email')->nullable();
            $table->string('relationship');
            $table->timestamp('consent_given_at')->nullable();
            $table->ipAddress()->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('parental_consents');
    }
};
