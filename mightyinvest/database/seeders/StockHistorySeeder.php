<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
class StockHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stocks = Stock::all();

        foreach($stocks as $stock){
            $start = Carbon::today();
            for($i = 0; $i < 24; $i++){
                DB::table('stock_histories')->insert([
                    'stock_id' => $stock->id,
                    'price' =>rand($stock->price-20, $stock->price + 20),
                    'recorded_at' => $start-> copy()->addHours($i),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
