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
use App\Http\Controllers\PortfolioChartController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/auth/demo', [AuthController::class, 'demo']);
});

Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/social-sentiments', [NewsController::class, 'social_sentiments']);
Route::get('/stocks/market-status', [StockController::class, 'marketStatus']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
// Email verification — API route üzerinden (nginx api/* → Laravel)
Route::get('/email/verify/{id}/{hash}',[AuthController::class, 'verifyEmail'])->name('verification.verify');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (May be Unverified)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);
});

/*
|--------------------------------------------------------------------------
| Verified Routes (Must be Authenticated and Verified)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Market Data
    Route::get('/stocks', [StockController::class, 'index']);
    Route::get('/stocks/search', [StockController::class, 'search']);
    Route::get('/stocks/quote/{symbol}', [StockController::class, 'quote']);
    Route::get('/stocks/candles/{symbol}', [StockController::class, 'candles']);
    Route::get('/stocks/{id}/history', [StockController::class, 'history']);
    Route::get('/alerts/live', [AlertController::class, 'live']);
    
    // Portfolio & Trading
    Route::get('/portfolio', [PortfolioController::class, 'index']);
    Route::get('/portfolio/performance', [PortfolioChartController::class, 'performance']);
    Route::post('/buy', [TransactionController::class, 'buy']);
    Route::post('/sell', [TransactionController::class, 'sell']);
    Route::get('/transactions', [TransactionController::class, 'history']);

    // Watchlist
    Route::get('/watchlist', [WatchlistController::class, 'index']);
    Route::post('/watchlist', [WatchlistController::class, 'store']);
    Route::delete('/watchlist/{symbol}', [WatchlistController::class, 'destroy']);

    // Dashboard & News
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/calendar', [NewsController::class, 'calendar']);
});
   