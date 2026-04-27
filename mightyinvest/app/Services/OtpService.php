<?php

namespace App\Services;

use App\Models\User;
use App\Models\LoginOtp;
use Illuminate\Support\Facades\Mail;

class OtpService{
    // 6 digits code generation
    public function send(User $user){
        //delete if there is generated codes already
        LoginOtp::where('user_id', $user->id)->delete();

        $code = str_pad(random_int(0, 999999),6 , '0', STR_PAD_LEFT);

        //10 mins expires
        LoginOtp::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10)
        ]);

        //sending an email
        Mail::raw("MightyInvest Security Code: {$code}\n\nBu kod 10 dakika süreyle geçerlidir.", function ($msg) use ($user){
            $msg->to($user->email)->subject('Login Verification Code');
        });
    }

    // verifies the code 
    public function verify(User $user, string $code): bool{
        $otp = LoginOtp::where('user_id', $user->id)
            ->where('code', $code)
            ->where('expires_at', '>', now())
            ->first();
        if(!$otp){
            return false;
        }

        //after verification delete the code 
        $otp->delete();
        return true;
    }
}