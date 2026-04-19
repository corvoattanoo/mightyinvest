<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stock; // bunu ekle, yoksa Stock bulunamaz
use App\Models\StockHistory;
use App\Services\FinnhubService;
use App\Services\PolygonService;

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
        $data = $this->finnhubService->getQuote($symbol);
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
        $data = $this->finnhubService->getMarketStatus();
        return response()->json($data);
    }
}


// class StockController extends Controller
// {
//     public function index()
//     {
//         // Dummy data döndürüyoruz
//         $stocks = [
//             ['id' => 1, 'name' => 'Apple', 'price' => 150],
//             ['id' => 2, 'name' => 'Microsoft', 'price' => 300],
//             ['id' => 3, 'name' => 'Tesla', 'price' => 700],
//         ];

//         return response()->json($stocks);
//     }
// }



