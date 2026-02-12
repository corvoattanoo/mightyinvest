<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StockController;


Route::get('/stocks', [StockController::class, 'index']);
Route::get('/stocks/{id}/history', [StockController::class, 'history']);