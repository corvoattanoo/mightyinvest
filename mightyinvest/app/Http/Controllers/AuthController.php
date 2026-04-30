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
        // "guest@mightyinvest.com" kullanicisini bul veya yoksa olustur
        $user = User::firstOrCreate(
            ['email'  => 'guest@mightyinvest.com'],
            [
                'name' => 'Portfolio guest',
                'password' => Hash::make('mighty-guest-password-2026'),
            ]
            );

            //bu kullanici icin yeni bir sanctum token olustur
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user->only(['id', 'name', 'email']),
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
