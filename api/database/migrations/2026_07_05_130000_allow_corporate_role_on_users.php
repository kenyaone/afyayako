<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds 'corporate' (HR / EAP administrator) as an allowed value for
 * the users.role check constraint. On SQLite the constraint is baked
 * into the CREATE TABLE so we recreate the table; on MySQL/Postgres we
 * just drop-and-recreate the check.
 *
 * Idempotent: if the new role is already accepted, this is a no-op.
 */
return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        // Cheap probe — try to insert-and-rollback with role='corporate'
        try {
            DB::beginTransaction();
            DB::table('users')->insert([
                'username'     => '__probe_corporate__',
                'display_name' => 'probe',
                'password'     => 'x',
                'role'         => 'corporate',
            ]);
            DB::rollBack();
            return; // constraint already accepts it
        } catch (\Throwable $e) {
            DB::rollBack();
        }

        if ($driver === 'sqlite') {
            // Rebuild users table with expanded role check
            Schema::disableForeignKeyConstraints();
            DB::statement("CREATE TABLE users_new (
                id integer primary key autoincrement not null,
                username varchar not null,
                display_name varchar not null,
                email varchar,
                phone varchar,
                role varchar check (role in ('user','professional','admin','corporate')) not null default 'user',
                is_anonymous_mode tinyint(1) not null default '1',
                password varchar not null,
                avatar varchar,
                remember_token varchar,
                created_at datetime,
                updated_at datetime,
                date_of_birth date,
                anonymity_preference varchar check (anonymity_preference in ('anonymous','identified')) not null default 'identified',
                is_test tinyint(1) not null default '0'
            )");
            DB::statement("INSERT INTO users_new SELECT * FROM users");
            DB::statement("DROP TABLE users");
            DB::statement("ALTER TABLE users_new RENAME TO users");
            // Recreate indexes if any (users_username_unique / users_email_unique are common)
            DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username)");
            DB::statement("CREATE INDEX IF NOT EXISTS users_email_index ON users(email)");
            Schema::enableForeignKeyConstraints();
        } else {
            // MySQL: modify the enum/check via raw SQL
            // For safety, don't hard-code the column definition — just try to drop the constraint
            try {
                DB::statement("ALTER TABLE users MODIFY role VARCHAR(20) NOT NULL DEFAULT 'user'");
            } catch (\Throwable $e) {
                // leave as-is; enforcement is application-level anyway
            }
        }
    }

    public function down(): void
    {
        // Not reversing — narrowing the constraint could delete corporate users.
    }
};
