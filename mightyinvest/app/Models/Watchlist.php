<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Watchlist extends Model
{
    protected $fillable = ['user_id', 'symbol'];

    public function stock()
    {
        return $this->belongsTo(\App\Models\Stock::class, 'symbol', 'symbol');
    }
}
