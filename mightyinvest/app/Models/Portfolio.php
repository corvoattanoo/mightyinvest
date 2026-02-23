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
        'name',
        'purchase_price',
        'currency',
        'description',
        'is_active',
    ];

    protected $appends = ['current_value', 'profit', 'profit_percentage'];

    // Current total value of this holding (Quantity * Current Market Price)
    public function getCurrentValueAttribute()
    {
        return $this->quantity * ($this->stock->price ?? 0);
    }

    // Total profit/loss in currency
    public function getProfitAttribute()
    {
        return $this->current_value - ($this->quantity * $this->purchase_price);
    }

    // Profit/Loss percentage
    public function getProfitPercentageAttribute()
    {
        $costBasis = $this->quantity * $this->purchase_price;
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
    
}
