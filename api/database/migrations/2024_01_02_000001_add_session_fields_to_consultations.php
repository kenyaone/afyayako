<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('consultations', function (Blueprint $table) {
            $table->string('recording_url')->nullable()->after('recording_enabled');
            $table->boolean('recording_kept')->default(false)->after('recording_url');
            $table->boolean('recording_deleted')->default(false)->after('recording_kept');
            $table->timestamp('notes_requested_at')->nullable()->after('professional_notes');
            $table->boolean('is_follow_up')->default(false)->after('notes_requested_at');
            $table->unsignedBigInteger('parent_consultation_id')->nullable()->after('is_follow_up');
        });
    }
    public function down(): void {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['recording_url','recording_kept','recording_deleted','notes_requested_at','is_follow_up','parent_consultation_id']);
        });
    }
};
