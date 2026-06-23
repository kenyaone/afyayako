<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('telehealth'); // telehealth, data_sharing, ...
            $table->string('version');                      // document version accepted
            $table->string('content_hash')->nullable();     // sha256 of accepted text
            $table->timestamp('accepted_at');
            $table->ipAddress('ip_address')->nullable();
            $table->string('source')->default('explicit');  // explicit | booking
            $table->timestamps();

            $table->index(['user_id', 'type', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_consents');
    }
};
