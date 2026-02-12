<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stock; // bunu ekle, yoksa Stock bulunamaz
use App\Models\StockHistory;

class StockController extends Controller
{
    public function index(){
        return Stock::all();
    }

    public function history($id){
        return StockHistory::where('stock_id', $id)
            ->orderBy('recorded_at')
            ->get();
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



