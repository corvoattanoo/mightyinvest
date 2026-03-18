<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    //
    public function index(){
        return auth()->user()->watchlist;
    }

    public function store(Request $request){
                auth()->user()->watchlist()->firstOrCreate(['symbol' => $request->symbol]); //add if there is no.dont add if there is
                        return response()->json(['message' => "Added to the watchlist"]);
                            }

    
    public function destroy($symbol){
        auth()->user()->watchlist()->where('symbol', $symbol)->delete();
        return response()->json(['message' => 'Removed from watchlist']);
    }
}
