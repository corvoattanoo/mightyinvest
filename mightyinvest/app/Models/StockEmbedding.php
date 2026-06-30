<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockEmbedding extends Model
{
    protected $fillable = [
        'stock_id',
        'content',
        'embedding'
    ];

    public function stock(){
        return $this->belongsTo(Stock::class);
    }

    public function setEmbeddingAttribute($value){
        if(is_array($value)){
            $this->attributes['embedding'] = '[' . implode(',', $value)     .']';
        }else{
            $this->attributes['embedding'] = $value;
        }
    }
}
