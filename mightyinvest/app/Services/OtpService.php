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

        $emailContent = "Dear User,\n\n"
            . "Your MightyInvest login verification code is: {$code}\n\n"
            . "Please use this code to complete your login. For your security, this code will expire in 10 minutes.\n\n"
            . "If you did not request this code, please ignore this email or contact our support team immediately.\n\n"
            . "Best regards,\n"
            . "MightyInvest Security Team";

        //sending an email
        Mail::raw($emailContent, function ($msg) use ($user){
            $msg->to($user->email)->subject('MightyInvest - Login Verification Code');
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