<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FinnhubService; 
class RefreshStockPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:refresh-stock-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(FinnhubService $finnhub)
    {
        // all watchlist and portfolio symbols
        $symbols = \App\Models\Watchlist::pluck('symbol')// takes all watchlist and stocks stocks merge and prevents duplications
            ->merge(\App\Models\Stock::pluck('symbol'))
            ->unique();

        $this->info("Updating" . $symbols->count() . " stocks...");

        foreach ($symbols as $symbol){
            $finnhub->getQuote($symbol);
            $this->line("Updated: {$symbol}");
        }

        $this->info("All stocks updated successfully.");
    }
}
