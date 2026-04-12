<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FinnhubService;

class NewsController extends Controller {

    protected $finnhub;

    //servisleri constructor icinde controllera tanitiyoruz
    public function __construct(FinnhubService $finnhub){
        $this->finnhub = $finnhub;
    }

    public function index(Request $request){
        $category = $request->get('category', 'general');
        $news = $this->finnhub->getMarketNews($category);

        return response()->json($news);
    }
}