<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChartAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image_path',
        'result',
        'trend',
        'risk_level',
        'status',
        'error_message'
    ];

    protected $casts = [
        'result' => 'array'
    ];


    public function user(): BelongsTo{
        return $this->belongsTo(User::class);
    }
}
