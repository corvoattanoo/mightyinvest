<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FinnhubService;

class WatchlistController extends Controller
{
    //
    public function index(){
        return auth()->user()->watchlist()->with('stock')->get()
            ->map(function($item){
                return [
                    'id' => $item->stock->id,
                'symbol' => $item->symbol,
                'name' => $item->stock->name ?? $item->symbol,
                'price' => $item->stock->price ?? 0,
                // Eğer modelinde varsa bunları da ekleyebilirsin:
                'percent_change' => $item->stock->percent_change ?? 0,
                ];
            });
    }

    public function store(Request $request, FinnhubService $finnhub){
             $watchlist = auth()->user()->watchlist()->firstOrCreate(['symbol' => $request->symbol]); //add if there is no.dont add if there is
                        //return response()->json(['message' => "Added to the watchlist"]);
                // fetch data
                $stockData = $finnhub->getQuote($request->symbol);

                //frontend message and return the price
                return response()->json([
                    'message' => "Added to the watchlist",
                    'price' => $stockData['current_price'],
                    'percent_change' => $stockData['percent_change']
                ]);
    
    }

    
    public function destroy($symbol){
        auth()->user()->watchlist()->where('symbol', $symbol)->delete();
        return response()->json(['message' => 'Removed from watchlist']);
    }
}
