<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('contact_name', 100);
            $table->string('contact_email');
            $table->string('contact_phone', 15);
            $table->string('industry', 100)->nullable();
            $table->integer('employee_count');
            $table->string('kra_pin', 20)->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
