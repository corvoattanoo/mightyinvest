<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stock; // bunu ekle, yoksa Stock bulunamaz
use App\Models\StockHistory;
use App\Services\FinnhubService;

class StockController extends Controller
{
    protected $finnhubService;

    public function __construct(FinnhubService $finnhubService){
        $this->finnhubService = $finnhubService;
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
            return [];
        }
        return Stock::where('symbol', 'LIKE', "%{$q}%")//like search operator
            ->orWhere('name', 'LIKE', "%{$q}%")//if symbol doesnt match look for name
            ->limit(5)// max return 5 result
            ->get();//run
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



