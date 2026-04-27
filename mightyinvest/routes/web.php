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
Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    // Güvenlik: Hash kontrolü
    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Invalid verification link'], 403);
    }

    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    // Onaylandı! Şimdi Angular dashboard'a yolla.
    return redirect('http://localhost:4200/dashboard?verified=1');
})->middleware(['signed'])->name('verification.verify');