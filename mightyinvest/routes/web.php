<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StockController;
use App\Models\User;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/greeting', function () {
    return 'Hello World';
});

// Email doğrulama linkine tıklandığında çalışacak rota
// Email doğrulama linkine tıklandığında
