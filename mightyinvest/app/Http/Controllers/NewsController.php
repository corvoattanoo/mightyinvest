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
        // Bullish'leri al (Tam eşleşme için küçük harf zorlamasıyla)
        $bullish = DB::table('social_sentiments')
            ->whereRaw('LOWER(sentiment) = ?', ['bullish'])
            ->orderBy('post_count', 'desc')
            ->limit(4)
            ->get();

        // Bearish'leri al (Daha cesur bir liste için)
        $bearish = DB::table('social_sentiments')
            ->whereRaw('LOWER(sentiment) = ?', ['bearish'])
            ->orderBy('post_count', 'desc')
            ->limit(1)
            ->get();

        // Eğer hiç bearish yoksa (nadir durum), listeyi 5 bullish ile tamamla
        if ($bearish->isEmpty()) {
            $sentiments = $bullish;
        } else {
            $sentiments = $bullish->merge($bearish);
        }

        // Karıştırıp döndür
        return response()->json($sentiments->shuffle());
    }
}