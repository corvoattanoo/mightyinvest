<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stock; // bunu ekle, yoksa Stock bulunamaz
use App\Models\StockHistory;
use App\Services\FinnhubService;
use App\Services\PolygonService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class StockController extends Controller
{
    protected $finnhubService;
    protected $polygonService;

    
    public function __construct(FinnhubService $finnhubService, PolygonService $polygonService){
        $this->finnhubService = $finnhubService;
        $this->polygonService = $polygonService;
    }
    public function candles($symbol, Request $request){
        $range = $request->query('range', '1M');
        $data = $this->polygonService->getCandles($symbol, $range);
        return response()->json($data);
    }

    public function quote($symbol){
        // 2 dakika önbellekte tut — Finnhub'a her seferinde bağlanmayı engeller
        $data = Cache::remember("quote_{$symbol}", 120, function() use ($symbol) {
            return $this->finnhubService->getQuote($symbol);
        });
        return response()->json($data);
    }

    public function index(){
        return Stock::all();
    }

    public function history($id){
        return StockHistory::where('stock_id', $id)
            ->orderBy('recorded_at')
            ->get();
    }

    public function search(Request $request){
        $q = $request->query('q');
        if(!$q){
            return response()->json([]);
        }
        $results = $this->finnhubService->symbolSearch($q);
        return response()->json($results);
    }

    public function marketStatus(){
        // 5 dakika önbellekte tut — borsa durumu sık değişmez
        $data = Cache::remember('market_status', 300, function() {
            return $this->finnhubService->getMarketStatus();
        });
        return response()->json($data);
    }

}



