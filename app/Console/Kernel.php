<?php

namespace App\Console;

use App\Jobs\AutoCheckoutJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Auto checkout every hour, check if any shift has ended
        $schedule->job(new AutoCheckoutJob)->everyMinute()->name('auto-checkout');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
