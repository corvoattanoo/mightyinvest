<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    //
    protected $fillable = [
        'user_id',
        'stock_id',
        'quantity',
        'average_price',
        'name',
        'description',
    ];

    protected $appends = ['current_value', 'profit', 'profit_percentage', 'daily_profit'];

    // Current total value of this holding (Quantity * Current Market Price)
    public function getCurrentValueAttribute()
    {
        return $this->quantity * ($this->stock?->price ?? 0);
    }

    // Total profit/loss in currency
    public function getProfitAttribute()
    {
        return $this->current_value - ($this->quantity * $this->average_price);
    }

    // Profit/Loss percentage
    public function getProfitPercentageAttribute()
    {
        $costBasis = $this->quantity * $this->average_price;
        if ($costBasis == 0) return 0;
        return ($this->profit / $costBasis) * 100;
    }

    // Portföyün hisse senedi ile ilişkisi
    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    // Portföyün kullanıcı ile ilişkisi
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Sadece BUGÜNKÜ kâr/zararı hesaplar
    public function getDailyProfitAttribute(){
        $currentPrice = $this->stock?->price ?? 0;
        $percentChange = $this->stock?->percent_change ?? 0;

        if ($currentPrice == 0) return 0;

        $yesterdayClose = $currentPrice / (1 + ($percentChange / 100));

        $dailyProfit = $this->quantity * ($currentPrice - $yesterdayClose);

        return $dailyProfit;
    }
    
}
