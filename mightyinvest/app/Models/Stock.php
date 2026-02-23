<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    //Bu 3 alan dışarıdan create() ile doldurulabilir.
    protected $fillable =[
        'symbol',
        'name',
        'user_id'
    ];
    public function histories()
    {
        return $this->hasMany(StockHistory::class);
    }

    public function portfolios()
    {
        return $this->hasMany(Portfolio::class);
    }
}
