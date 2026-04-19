<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialSentiment extends Model
{
    protected $fillable = [
        'ticker',
        'source',
        'score',
        'sentiment',
        'post_count',
        'avg_engagement',
    ];

    protected $casts = [ // securing the types
        'score' => 'integer',
        'avg_engagement' => 'float',
    ];
}
