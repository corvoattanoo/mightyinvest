<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockHistory extends Model
{
    protected $fillable = ['stock_id', 'price', 'recorded_at'];
    public function stock(){
        return $this->belongsTo(Stock::class);
    }
}
