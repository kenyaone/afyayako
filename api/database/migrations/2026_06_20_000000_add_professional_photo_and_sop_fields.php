<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProfessionalPhotoAndSopFields extends Migration
{
    public function up()
    {
        Schema::table('professionals', function (Blueprint $table) {
            // signature_name, sop_agreed, sop_agreed_at already exist in the
            // canonical create; only add what is genuinely new here.
            if (!Schema::hasColumn('professionals', 'professional_photo')) {
                $table->string('professional_photo')->nullable();
            }
            if (!Schema::hasColumn('professionals', 'signature_name')) {
                $table->string('signature_name')->nullable();
            }
            if (!Schema::hasColumn('professionals', 'sop_agreed')) {
                $table->boolean('sop_agreed')->default(false);
            }
            if (!Schema::hasColumn('professionals', 'sop_agreed_at')) {
                $table->timestamp('sop_agreed_at')->nullable();
            }
            if (!Schema::hasColumn('professionals', 'kmpdc_verified')) {
                $table->boolean('kmpdc_verified')->default(false);
            }
            if (!Schema::hasColumn('professionals', 'kmpdc_verified_at')) {
                $table->timestamp('kmpdc_verified_at')->nullable();
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'anonymity_preference')) {
                $table->enum('anonymity_preference', ['anonymous', 'identified'])->default('identified');
            }
        });
    }

    public function down()
    {
        Schema::table('professionals', function (Blueprint $table) {
            foreach (['professional_photo', 'signature_name', 'sop_agreed', 'sop_agreed_at', 'kmpdc_verified', 'kmpdc_verified_at'] as $name) {
                if (Schema::hasColumn('professionals', $name)) {
                    $table->dropColumn($name);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'anonymity_preference')) {
                $table->dropColumn('anonymity_preference');
            }
        });
    }
}
