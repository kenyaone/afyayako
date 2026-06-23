<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('parental_consents', function (Blueprint $table) {
            // The minor's own affirmation (assent), captured alongside guardian consent.
            // MoH Guideline 4: minors require guardian consent AND assent of the minor.
            $table->boolean('minor_assent')->default(false)->after('relationship');
            $table->timestamp('minor_assented_at')->nullable()->after('consent_given_at');
        });
    }

    public function down(): void
    {
        Schema::table('parental_consents', function (Blueprint $table) {
            $table->dropColumn(['minor_assent', 'minor_assented_at']);
        });
    }
};
