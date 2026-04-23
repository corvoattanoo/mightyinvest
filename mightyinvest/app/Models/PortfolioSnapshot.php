<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PortfolioSnapshot extends Model {
    public $timestamps = false;

    protected $casts = [
        'snapshot_at' => 'datetime',
    ];

    protected $fillable = ['user_id', 'total_value', 'snapshot_at'];
}