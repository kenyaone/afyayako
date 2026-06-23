<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('support_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description');
            $table->string('category', 50);    // depression, anxiety, addiction, etc.
            $table->string('icon', 10)->default('💬');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('member_count')->default(0);
            $table->timestamps();
        });

        Schema::create('group_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('support_groups')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('display_name', 100)->nullable();   // anonymous alias
            $table->boolean('is_anonymous')->default(true);
            $table->timestamp('joined_at');
            $table->timestamps();
            $table->unique(['group_id', 'user_id']);
        });

        Schema::create('group_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('support_groups')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->string('display_name', 100);   // anonymised name used at post time
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_moderated')->default(false);   // hidden by admin
            $table->timestamp('moderated_at')->nullable();
            $table->timestamps();
            $table->index(['group_id', 'created_at']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('group_messages');
        Schema::dropIfExists('group_memberships');
        Schema::dropIfExists('support_groups');
    }
};
