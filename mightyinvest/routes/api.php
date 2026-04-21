<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StockController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WatchlistController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\AlertController;



   Route::get('/news/social-sentiments', [NewsController::class, 'social_sentiments']);
Route::middleware('throttle:5,1')->group(function (){
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/auth/demo', [AuthController::class, 'demo']);
});

Route::get('/stocks', [StockController::class, 'index']);
Route::get('/stocks/quote/{symbol}', [StockController::class, 'quote']);
Route::get('/stocks/market-status', [StockController::class, 'marketStatus']);
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/social-sentiments', [NewsController::class, 'social_sentiments']);
  Route::get('/alerts/live',[AlertController::class, 'live']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::get('/portfolio', [PortfolioController::class, 'index']);
    Route::post('/buy', [TransactionController::class, 'buy']);
    Route::post('/sell', [TransactionController::class, 'sell']);
    Route::get('transactions', [TransactionController::class, 'history']);
    Route::get('/watchlist', [WatchlistController::class, 'index']);
    Route::post('/watchlist', [WatchlistController::class, 'store']);
    Route::delete('/watchlist/{symbol}',[WatchlistController::class, 'destroy']);
    Route::get('stocks/search', [StockController::class, 'search']);
    Route::get('/stocks/{id}/history', [StockController::class, 'history']);
    Route::get('/stocks/candles/{symbol}', [StockController::class, 'candles']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/calendar', [NewsController::class, 'calendar']);
  
});
   