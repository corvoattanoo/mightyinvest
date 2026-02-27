<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StockController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\TransactionController;

Route::get('/stocks', [StockController::class, 'index']);
Route::get('/stocks/{id}/history', [StockController::class, 'history']);
//user routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::get('/portfolio', [PortfolioController::class, 'index']);
    Route::post('/buy', [TransactionController::class, 'buy']);
    Route::post('/sell', [TransactionController::class, 'sell']);
    Route::get('transactions', [TransactionController::class, 'history']);
});