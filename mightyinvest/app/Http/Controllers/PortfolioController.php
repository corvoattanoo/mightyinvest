<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Portfolio;

class PortfolioController extends Controller
{
    //
    public function index(){
        return Portfolio::with('stock')
            ->where('user_id', auth()->id())
            ->get();
    }

}
