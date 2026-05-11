<?php

namespace App\Http\Controllers;
use App\Services\OtpService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    public function __construct(private OtpService $otpService) {}

    // REGISTER
    public function register(Request $request){ // frontendden gelen verileri al
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // E-posta doğrulama tetiğini çalıştır Bu user register oldu, bunu dinleyen varsa çalışsın
        event(new Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'name', 'email']),
            'token' => $token,
        ]);

    }

    // LOGIN
    public function login(Request $request){
        $request->validate([
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        //Password is correct but we send OTP
        $this->otpService->send($user);

        return response()->json([
            'message' => 'OTP send to your email',
            'requires_otp' => true,
            'email' => $user->email
        ]);

        //$token = $user->createToken('auth_token')->plainTextToken;
        // return response()->json([
        //     'user' => $user,
        //     'token' => $token,
        //]);
    }

         // OTP verification
        public function verifyOtp(Request $request) {
            $request->validate([
                'email' => 'required|email',
                'code' => 'required|string|size:6',
            ]);

            $user = User::Where('email', $request->email)->first();

            if(!$user || !$this->otpService->verify($user, $request->code)){
                return response()->json(['message' => 'Invalid or expired OTP'], 401);
            }

            //OTP true
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' =>$user,
                'token' => $token,
            ]);

        }
    public function verifyEmail(Request $request, $id, $hash){
        $user = User::findOrFail($id);

    if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
        abort(403);
    }

    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    return redirect('http://localhost:8085/dashboard?verified=1');
    }

    //DEMO PAGE
    public function demo(){
        // "guest@mightyinvest.com" kullanıcısını bul veya oluştur
        $user = User::where('email', 'guest@mightyinvest.com')->first();

        if (!$user) {
            $user = User::create([
                'name' => 'Portfolio Guest',
                'email' => 'guest@mightyinvest.com',
                'password' => Hash::make('mighty-guest-password-2026'),
                'email_verified_at' => now(),
                'balance' => 100000.00
            ]);
        } else {
            $user->email_verified_at = now();
            if ($user->balance < 1000) {
                $user->balance = 100000.00;
            }
            $user->save();
        }

        // Eğer portföy boşsa örnek hisseleri ekle
        if ($user->portfolios()->count() === 0) {
            $sampleStocks = [
                ['symbol' => 'AAPL', 'quantity' => 50, 'average_price' => 175.50],
                ['symbol' => 'TSLA', 'quantity' => 20, 'average_price' => 240.20],
                ['symbol' => 'NVDA', 'quantity' => 15, 'average_price' => 450.80],
                ['symbol' => 'MSFT', 'quantity' => 30, 'average_price' => 380.00],
            ];

            foreach ($sampleStocks as $stockData) {
                $stock = \App\Models\Stock::where('symbol', $stockData['symbol'])->first();
                if ($stock) {
                    $user->portfolios()->create([
                        'stock_id' => $stock->id,
                        'name' => 'Main Portfolio',
                        'symbol' => $stockData['symbol'],
                        'quantity' => $stockData['quantity'],
                        'average_price' => $stockData['average_price'],
                        'currency' => 'USD'
                    ]);
                }
            }
        }

        // Eğer watchlist boşsa örnekleri ekle
        if ($user->watchlist()->count() === 0) {
            $watchlistSymbols = ['BTCUSDT', 'ETHUSDT', 'GOOGL', 'AMZN', 'META'];
            foreach ($watchlistSymbols as $symbol) {
                $user->watchlist()->create(['symbol' => $symbol]);
            }
        }

        // Bu kullanıcı için yeni bir sanctum token oluştur
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'balance']),
            'token' => $token,
            'message' => 'Welcome to the Demo Mode!'
        ]);
    }

    public function resendVerification(Request $request){
        //if the user already approved  return information 
        if($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 200);
        }

        request()->user()->sendEmailVerificationNotification();
    }

    // LOGOUT
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    // GET USER
    public function getUser(Request $request){
        return response()->json([
            'user' => $request->user(),
        ]);
    }
    
}
