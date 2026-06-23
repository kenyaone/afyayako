<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('session_feedback', function (Blueprint $table) {
            $table->enum('flag_status', ['none', 'flagged', 'cleared', 'removed'])->default('none')->after('comment');
            $table->text('flag_reason')->nullable()->after('flag_status');
            $table->foreignId('flagged_by')->nullable()->constrained('users')->nullOnDelete()->after('flag_reason');
            $table->timestamp('flagged_at')->nullable()->after('flagged_by');
            $table->boolean('is_hidden')->default(false)->after('flagged_at');
            $table->index(['flag_status']);
        });
    }

    public function down(): void {
        Schema::table('session_feedback', function (Blueprint $table) {
            $table->dropForeign(['flagged_by']);
            $table->dropColumn(['flag_status', 'flag_reason', 'flagged_by', 'flagged_at', 'is_hidden']);
        });
    }
};
