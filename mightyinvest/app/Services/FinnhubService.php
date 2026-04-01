<?php

namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;

/**
 * Finnhub API ile iletisimi saglayan servis.
 * Buraya getQuote, getHistory gibi metodlar ekleyebilirsin.
 */
class FinnhubService
{
    protected $apiKey;
    protected $baseUrl = 'https://finnhub.io/api/v1';

    public function __construct()
    {
        $this->apiKey = Config::get('services.finnhub.key');
        
    }

    public function getQuote($symbol){  

        $cacheKey = "stock_quote_{$symbol}";
        //60 saniye bu anahtar altinda veriyi sakla
        return Cache::remember($cacheKey, 60, function ()
        use ($symbol){
            //api istegi atma ve veriyi isimlendirme(mapping) islemini buraya tasiiyrouz
            $response = Http::get("{$this->baseUrl}/quote", [
            'symbol' => $symbol,
            'token' => $this->apiKey
        ])->json();

         $mappedData = [
            'current_price' => $response['c'] ?? 0,
            'high_price' => $response['h'] ?? 0,
            'low_price' => $response['l'] ?? 0,
            'open_price' => $response['o'] ?? 0,
            'previous_close' => $response['pc'] ?? 0,
            'change' => $response['d'] ?? 0,
            'percent_change' => $response['dp'] ?? 0,
            'timestamp' => $response['t'] ?? 0,
        ];

        // Update Stock price in database if exists
        \App\Models\Stock::updateOrCreate(
            ['symbol' => $symbol],
            ['price' => $mappedData['current_price']]
        );

        return $mappedData;

        }); 
    }
    protected $range_config = [
            '1H' => [
                'resolution' => '1',
                'subtract' => 'subHour', //Carbon: now()->subHour()
                'cache_ttl' => 60,
            ],
            '1D' => [
                'resolution' => '5',
                'subtract' => 'subDay',
                'cache_ttl' => 300, // 5min
            ],
            '1W' => [
                'resolution' => 'D', //Daily
                'subtract' => 'subWeek',
                'cache_ttl' => 3600, 
            ],
            '1M' => [
                'resolution' => 'D',
                'subtract' => 'subMonth',
                'cache_ttl' => 3600, 
            ]

            ];

    public function getCandles(string $symbol, string $range): array
    {
        // 1. Ayar paketini çek 
        $config = $this->range_config[$range] ?? $this->range_config['1M'];
        $cacheKey = "stock:candles:{$symbol}:{$range}";

        // 2. Cache::remember kullanarak hem kontrolü hem kaydı tek seferde yapıyoruz
        return Cache::remember($cacheKey, $config['cache_ttl'], function () use ($symbol, $config) {
            
            $to = now()->timestamp;
            $from = now()->{$config['subtract']}()->timestamp;

            // API isteği
            $response = Http::get("{$this->baseUrl}/stock/candle", [
                'symbol' => $symbol,
                'resolution' => $config['resolution'],
                'from' => $from,
                'to' => $to,
                'token' => $this->apiKey
            ])->json();


        if(($response['s'] ?? '') !== 'ok'){
                return [];
            }

            // 4. Veri Dönüştürme (Transformation)
            // Finnhub'ın 'c' (prices) ve 't' (timestamps) dizilerini frontendin beklediği formata sokuyoruz
            $history = [];

        foreach($response['c'] as $index => $price){
            $timestamp = $response['t'][$index];

                $history[] = [
                    'price' => $price,
                'recorded_at' => now()->setTimestamp($timestamp)->toDateTimeString()
                ];
            }

            return $history;
        });
    }

    public function symbolSearch($query){
        $cacheKey = "stock_query_{$query}";

        return Cache::remember($cacheKey, 300, function () use ($query){
            $response = Http::get("{$this->baseUrl}/search", [
                'q' => $query,
                'token' => $this->apiKey,
            ])->json();
            
            $results = $response['result'] ?? [];

            // Mapping: Sadece bize lazım olan symbol ve description (name) alanlarını alalım
            return array_map(function($item){
                return [
                    'symbol' => $item['symbol'], 
                    'name' => $item['description']
                ];
            }, $results);
        });
    }

    public function getMarketStatus(){
        $cacheKey = "market_status_us";

        return Cache::remember($cacheKey, 60, function () {
            $response = Http::get("{$this->baseUrl}/market/status", [
                'exchange' => 'US',
                'token' => $this->apiKey,
            ])->json();
            // dd($response);

            return [
                'isOpen' => $response['isOpen'] ?? false,
                'session' => $response['session'] ?? false,
                'timezone' => $response['timezone'] ?? 'UTC' 
            ];
        });

    }


}
