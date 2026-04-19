<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:refresh-stock-prices')->everyFiveMinutes()->runInBackground();

Schedule::command('scrape:reddit')->hourly()
    ->withoutOverlapping() // Prevents a new run if the previous one is still running
    ->runInBackground();// Executes the command in the background 