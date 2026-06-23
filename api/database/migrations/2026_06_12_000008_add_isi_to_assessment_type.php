<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('assessments', function (Blueprint $table) {
            $table->enum('assessment_type', ['phq9', 'gad7', 'audit', 'pgsi', 'ftnd', 'isi'])->change();
        });
    }

    public function down(): void {
        Schema::table('assessments', function (Blueprint $table) {
            $table->enum('assessment_type', ['phq9', 'gad7', 'audit', 'pgsi', 'ftnd'])->change();
        });
    }
};
