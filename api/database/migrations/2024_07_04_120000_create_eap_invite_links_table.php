<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('eap_invite_links')) {
        Schema::create('eap_invite_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('token')->unique(); // unique invite token
            $table->string('email')->nullable(); // optional: pre-fill email
            $table->integer('max_uses')->nullable(); // null = unlimited
            $table->integer('current_uses')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->softDeletes();

            $table->index('company_id');
            $table->index('token');
        });
        }

        if (!Schema::hasTable('corporate_employees')) {
        Schema::create('corporate_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('invite_link_id')->nullable()->constrained('eap_invite_links')->onDelete('set null');
            $table->string('employee_code')->unique(); // anonymous code for privacy
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->softDeletes();

            $table->unique(['company_id', 'user_id']);
            $table->index('company_id');
            $table->index('user_id');
            $table->index('employee_code');
        });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('corporate_employees');
        Schema::dropIfExists('eap_invite_links');
    }
};
