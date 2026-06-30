<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use \App\Models\Stock;
use \App\Services\EmbeddingService;
use \App\Models\StockEmbedding;

class StockEmbeddingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $service = new EmbeddingService();

        $stocks = Stock::all();

        foreach($stocks as $stock){
            $content = "{$stock->symbol} - Price: {$stock->price}";

            $embedding = $service->embed($content);

            StockEmbedding::create([
            'stock_id' => $stock->id,
            'content' => $content,
            'embedding' => $embedding
            ]);

        }

        

    }
}
