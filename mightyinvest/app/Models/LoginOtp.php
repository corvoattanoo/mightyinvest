<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginOtp extends Model
{
    protected $fillable = ['user_id', 'code', 'expires_at'];

    // expires_at alani tarih veri girisi ypabileceginin belirtiyruz
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    //bu otpnin hangi kullaniciya ait oldugu
    public function user(){
        return $this->belongsTo(User::class);
    }
}
