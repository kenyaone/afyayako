<?php

namespace App\Console\Commands;

use App\Mail\EapMonthlyHrSummary;
use App\Models\Company;
use App\Models\EapSession;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Fires monthly (1st of each month at 08:00) — sends each Company's HR
 * contact an aggregate summary of the previous month's EAP usage.
 *
 * Registered in bootstrap/app.php or Console/Kernel.php.
 * Manual run: `php artisan eap:monthly-summary`
 *   — override month with `--month=2026-06`.
 */
class SendMonthlyEapSummary extends Command
{
    protected $signature   = 'eap:monthly-summary {--month=}';
    protected $description = 'Email each EAP-subscribed company HR contact last month\'s usage summary.';

    public function handle(): int
    {
        $month     = $this->option('month')
            ? \Carbon\Carbon::createFromFormat('Y-m', $this->option('month'))
            : now()->subMonth();
        $start     = $month->copy()->startOfMonth();
        $end       = $month->copy()->endOfMonth();
        $label     = $month->format('F Y');

        $companies = Company::whereHas('eapSubscriptions', fn ($q) => $q->where('status', 'active'))->get();

        $sent = 0;
        foreach ($companies as $company) {
            if (!$company->contact_email) {
                $this->warn("Skipping {$company->name} — no contact_email");
                continue;
            }

            $subscription = $company->eapSubscriptions()->where('status', 'active')->latest()->first();

            $sessions = EapSession::where('company_id', $company->id)
                ->whereBetween('session_date', [$start, $end])
                ->get();

            $delivered  = $sessions->where('session_status', 'completed')->count();
            $spend      = (float) $sessions->where('payment_status', 'paid')->sum('cost_charged');
            $activeIds  = $sessions->pluck('corporate_employee_id')->unique()->count();

            // Round employee count to nearest 5 to guard against
            // identity inference on very small teams.
            $activeRounded = $activeIds > 0 ? max(5, (int) (round($activeIds / 5) * 5)) : 0;

            try {
                Mail::to($company->contact_email)->send(new EapMonthlyHrSummary(
                    company:            $company,
                    monthLabel:         $label,
                    totalEmployees:     (int) ($subscription?->employee_limit ?? $company->employee_count ?? 0),
                    activeEmployees:    $activeRounded,
                    sessionsDelivered:  $delivered,
                    totalSpendKes:      $spend,
                ));
                $sent++;
                $this->info("✓ Sent to {$company->name} ({$company->contact_email})");
            } catch (\Throwable $e) {
                $this->error("✗ Failed {$company->name}: ".$e->getMessage());
            }
        }

        $this->line("Done. {$sent}/".$companies->count()." summaries sent for {$label}.");
        return self::SUCCESS;
    }
}
