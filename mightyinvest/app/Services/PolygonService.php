<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PolygonService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.polygon.io';

    public function __construct(){
        $this->apiKey = Config::get('services.polygonio.key');
    }

    protected $range_config = [
            '1H' => [
                'multiplier' => '1',
                'timespan' => 'minute', 
                'subtract' => 'subHour',
                'cache_ttl' => 60,
            ],
            '1D' => [
                'multiplier' => '5',
                'timespan' => 'minute', 
                'subtract' => 'subDay',
                'cache_ttl' => 300,
            ],
            '1W' => [
                'multiplier' => '1',
                'timespan' => 'day', 
                'subtract' => 'subWeek',
                'cache_ttl' => 3600,
            ],
            '1M' => [
                'multiplier' => '1',
                'timespan' => 'day', 
                'subtract' => 'subMonth',
                'cache_ttl' => 3600, 
            ]
            ];
    public function getCandles(string $symbol, string $range): array{
        $symbol = strtoupper($symbol);
        $config = $this->range_config[$range] ?? $this->range_config['1D'];
        $cacheKey = "polygon:candles:{$symbol}:{$range}";

        return Cache::remember($cacheKey,$config['cache_ttl'], function () use ($symbol, $config){
             $to = now()->format('Y-m-d');;
            $from = now()->{$config['subtract']}()->format('Y-m-d');
            $url = "{$this->baseUrl}/v2/aggs/ticker/{$symbol}/range/{$config['multiplier']}/{$config['timespan']}/{$from}/{$to}";
            //api istegi atma
            $response = Http::get($url, [
                'apiKey' => $this->apiKey
            ])->json();
           

            //mapping
            //control if api responded
            $status = $response['status'] ?? '';
            if (!in_array($status, ['OK', 'DELAYED']) || !isset($response['results'])) {
                return [];
            }

            $history = [];
            //2. dongu ile results listesini gezme
            foreach($response['results'] as $result){
                $history[] =[
                    //c closing
                    'price' => $result['c'],
                    'recorded_at' => Carbon::createFromTimestampMs($result['t'])->toDateTimeString()
                ];
            }

            return $history;
        });
    }        


}