<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Encryption\DecryptException;

/**
 * Encrypts existing plaintext PHI columns in place so the `encrypted` /
 * `encrypted:array` model casts can take over (MoH Guideline 4 — Data
 * Management & Confidentiality: protect data at rest).
 *
 * Idempotent: a value that already decrypts cleanly is left untouched, so this
 * is safe to run repeatedly and safe to run before OR after the casts are added
 * (it reads/writes RAW column values via the query builder, bypassing casts).
 */
class EncryptPhi extends Command
{
    protected $signature = 'phi:encrypt {--dry-run : Report what would change without writing}';
    protected $description = 'Encrypt existing plaintext clinical (PHI) columns at rest';

    /** table => [columns] holding sensitive free-text or JSON PHI. */
    private array $map = [
        'consultations' => ['professional_notes'],
        'crisis_events' => ['content'],
        'mood_logs'     => ['notes'],
        'assessments'   => ['responses'],
        'safety_plans'  => [
            'warning_signs', 'coping_strategies', 'support_contacts',
            'crisis_resources', 'reasons_to_live', 'safe_environment_steps',
        ],
    ];

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $totalEncrypted = 0;

        foreach ($this->map as $table => $columns) {
            if (!DB::getSchemaBuilder()->hasTable($table)) {
                $this->warn("skip {$table} (no such table)");
                continue;
            }

            foreach (DB::table($table)->select(array_merge(['id'], $columns))->cursor() as $row) {
                $updates = [];
                foreach ($columns as $col) {
                    $val = $row->$col ?? null;
                    if ($val === null || $val === '') {
                        continue;
                    }
                    if ($this->isEncrypted($val)) {
                        continue; // already protected
                    }
                    $updates[$col] = Crypt::encryptString($val);
                }

                if ($updates) {
                    $totalEncrypted += count($updates);
                    if (!$dry) {
                        DB::table($table)->where('id', $row->id)->update($updates);
                    }
                    $this->line(($dry ? '[dry] ' : '') . "{$table}#{$row->id}: " . implode(', ', array_keys($updates)));
                }
            }
        }

        $this->info(($dry ? '[dry-run] ' : '') . "Encrypted {$totalEncrypted} column value(s).");
        return self::SUCCESS;
    }

    private function isEncrypted(string $value): bool
    {
        try {
            Crypt::decryptString($value);
            return true;
        } catch (DecryptException $e) {
            return false;
        }
    }
}
