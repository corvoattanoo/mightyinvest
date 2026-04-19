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
        '1H' => ['multiplier' => '1', 'timespan' => 'minute', 'subtract' => 'subHour', 'cache_ttl' => 60],
        '1D' => ['multiplier' => '5', 'timespan' => 'minute', 'subtract' => 'subDay', 'cache_ttl' => 300],
        '1W' => ['multiplier' => '1', 'timespan' => 'hour',   'subtract' => 'subWeek', 'cache_ttl' => 3600],
        '1M' => ['multiplier' => '1', 'timespan' => 'hour',   'subtract' => 'subMonth', 'cache_ttl' => 3600]
    ];

    public function getCandles(string $symbol, string $range): array{
        $symbol = strtoupper($symbol);
        $config = $this->range_config[$range] ?? $this->range_config['1D'];
        $cacheKey = "polygon:candles:{$symbol}:{$range}";

        return Cache::remember($cacheKey, $config['cache_ttl'], function () use ($symbol, $config, $range) {
            $to = now();
            $from = now()->{$config['subtract']}();

            // Hafta sonu veya piyasa kapalıysa (Pazartesi sabahı gibi) pencereyi genişlet
            // 1H ve 1D için veri gelmeme riskini bu şekilde yönetiyoruz
            if (in_array($range, ['1H', '1D'])) {
                if ($to->isSaturday()) $from = $to->copy()->subDays(1);
                if ($to->isSunday())   $from = $to->copy()->subDays(2);
                if ($to->isMonday() && $to->hour < 16) $from = $to->copy()->subDays(3);
            }

            $fromStr = $from->format('Y-m-d');
            $toStr = $to->format('Y-m-d');

            $url = "{$this->baseUrl}/v2/aggs/ticker/{$symbol}/range/{$config['multiplier']}/{$config['timespan']}/{$fromStr}/{$toStr}";
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
                    'close' => $result['c'],
                    //'recorded_at' => Carbon::createFromTimestampMs($result['t'])->toDateTimeString(),
                    'high' => $result['h'],
                    'low' => $result['l'],
                    'open' => $result['o'],
                    'time' => $result['t'] / 1000
                ];
            }

            return $history;
        });
    }        


}