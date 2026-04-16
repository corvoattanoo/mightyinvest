<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FinnhubService;
use Illuminate\Support\Facades\DB;

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

    public function calendar()
    {
        $calendar = $this->finnhub->getEconomicCalendar();

        return response()->json($calendar);
    }

    public function social_sentiments(){
        $sentiments = DB::table('social_sentiments')
            ->orderBy('post_count', 'desc')
            ->limit(5)
            ->get();

        return response()->json($sentiments);
    }
}