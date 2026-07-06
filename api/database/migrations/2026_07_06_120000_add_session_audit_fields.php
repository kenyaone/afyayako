<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Watertight session management — HR needs to be sure a session
 * actually happened and the therapist showed up and did the work.
 *
 * (A) Dual attendance timestamps on consultations
 *     - patient_joined_at, professional_joined_at
 *     - both non-null AND overlap ≥ 20 min ⇒ delivered
 *
 * (B) Clinical notes gate
 *     - clinical_notes (SOAP-formatted), clinical_notes_filed_at
 *     - Consultation cannot flip to 'completed' unless notes filed
 *     - HR sees only the boolean + word count, never the text
 *
 * (D) Post-session feedback survey (D)
 *     - session_feedbacks table already exists; add feedback_token
 *       + feedback_requested_at + a boolean for anonymity
 *
 * All idempotent (hasColumn guards).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $t) {
            if (!Schema::hasColumn('consultations', 'patient_joined_at')) {
                $t->timestamp('patient_joined_at')->nullable()->after('scheduled_at');
            }
            if (!Schema::hasColumn('consultations', 'professional_joined_at')) {
                $t->timestamp('professional_joined_at')->nullable()->after('patient_joined_at');
            }
            if (!Schema::hasColumn('consultations', 'clinical_notes')) {
                $t->longText('clinical_notes')->nullable()->after('professional_joined_at');
            }
            if (!Schema::hasColumn('consultations', 'clinical_notes_filed_at')) {
                $t->timestamp('clinical_notes_filed_at')->nullable()->after('clinical_notes');
            }
            if (!Schema::hasColumn('consultations', 'clinical_notes_word_count')) {
                $t->integer('clinical_notes_word_count')->default(0)->after('clinical_notes_filed_at');
            }
            if (!Schema::hasColumn('consultations', 'attendance_verified_at')) {
                $t->timestamp('attendance_verified_at')->nullable()->after('clinical_notes_word_count');
            }
        });

        if (Schema::hasTable('session_feedback')) {
            Schema::table('session_feedback', function (Blueprint $t) {
                if (!Schema::hasColumn('session_feedback', 'feedback_token')) {
                    $t->string('feedback_token', 64)->nullable()->unique()->after('id');
                }
                if (!Schema::hasColumn('session_feedback', 'feedback_requested_at')) {
                    $t->timestamp('feedback_requested_at')->nullable()->after('feedback_token');
                }
                if (!Schema::hasColumn('session_feedback', 'therapist_showed_up')) {
                    $t->boolean('therapist_showed_up')->nullable()->after('feedback_requested_at');
                }
                if (!Schema::hasColumn('session_feedback', 'would_book_again')) {
                    $t->boolean('would_book_again')->nullable()->after('therapist_showed_up');
                }
                if (!Schema::hasColumn('session_feedback', 'satisfaction_rating')) {
                    $t->tinyInteger('satisfaction_rating')->nullable()->after('would_book_again');
                }
            });
        }

        // Extend eap_sessions with denormalised audit signals so HR audit
        // view can query the boolean flags without hitting consultations.
        if (Schema::hasTable('eap_sessions')) {
            Schema::table('eap_sessions', function (Blueprint $t) {
                if (!Schema::hasColumn('eap_sessions', 'attendance_verified')) {
                    $t->boolean('attendance_verified')->default(false)->after('session_status');
                }
                if (!Schema::hasColumn('eap_sessions', 'notes_filed')) {
                    $t->boolean('notes_filed')->default(false)->after('attendance_verified');
                }
                if (!Schema::hasColumn('eap_sessions', 'feedback_score')) {
                    $t->tinyInteger('feedback_score')->nullable()->after('notes_filed');
                }
            });
        }
    }

    public function down(): void {}
};
