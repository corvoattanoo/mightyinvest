<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Portfolio;

class PortfolioController extends Controller
{
    //
    public function index(){
        return Portfolio::all();
    }

    public function store(Request $request){
        $validate = $requeest->validate([
            'name' => 'required|string|max:255',
            'user_id' => 'required|integer',
            'stock_id' => 'required|integer',
            'quantity' => 'required|integer',
            'purchase_price' => 'required|numeric',
            'purchase_date' => 'required|date',
        ]);

        $portfolio = Portfolio::create($validate);

        return response()->json($portfolio, 201);

        //...
    }
}
