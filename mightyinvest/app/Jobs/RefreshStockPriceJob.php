<?php

namespace App\Jobs;

use App\Models\Stock;
use App\Services\FinnhubService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class RefreshStockPriceJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;
    public int $backoff = 15; // wait 15 sec before every try
    public int $timeout = 30;

    public function __construct(public string $symbol) {}

    public function handle(FinnhubService $finnhub): void
    {
        try {
            $data = $finnhub->getQuote($this->symbol);

        Stock::updateOrCreate(
            ['symbol' => $this->symbol],
            [
                'price'          => $data['current_price'],
                'percent_change' => $data['percent_change'],
                'daily_high'     => $data['high_price'],
                'daily_low'      => $data['low_price'],
                'volume'         => $data['volume'] ?? 0,
            ]
        );

        Log::info("✅ Stock updated: {$this->symbol}");
        } catch (\Throwable $th) {
             Log::warning("⚠️ Stock update failed for {$this->symbol}: " . $th->getMessage());
             throw $th;
        }
        
    }
}
