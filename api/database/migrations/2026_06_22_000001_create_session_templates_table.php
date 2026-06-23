<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('session_templates')) {
            return;
        }

        Schema::create('session_templates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('professional_id')->index();
            $table->string('name');
            $table->string('category')->default('general');
            // SOAP note scaffolding
            $table->text('subjective')->nullable();
            $table->text('objective')->nullable();
            $table->text('assessment')->nullable();
            $table->text('plan')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_templates');
    }
};
