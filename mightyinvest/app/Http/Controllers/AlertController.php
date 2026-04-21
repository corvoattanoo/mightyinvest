<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SocialSentiment;
class AlertController extends Controller
{
    public function live(){
        $alerts = SocialSentiment::whereNotNull('top_signal')
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();
        
            return response()->json($alerts);
    }
}
