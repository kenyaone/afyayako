<?php

use App\Jobs\SendSessionReminders;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run every 30 minutes — catches both the 24h and 1h reminder windows
Schedule::job(new SendSessionReminders)->everyThirtyMinutes();
