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

         return [
            'current_price' => $response['c'] ?? 0,
            'high_price' => $response['h'] ?? 0,
            'low_price' => $response['l'] ?? 0,
            'open_price' => $response['o'] ?? 0,
            'previous_close' => $response['pc'] ?? 0,
            'change' => $response['d'] ?? 0,
            'precent_change' => $response['dp'] ?? 0,
            'timestamp' => $response['t'] ?? 0,
        ];

        });
        
        
       
    }
}
