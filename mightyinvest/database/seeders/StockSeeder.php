<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // $Stocks = Stock::all();

        // foreach($stocks as $stock){
        //     $start = Caron::today();
        //     for($i = 0; $i < 24; $i++){
        //         DB::table('stock_histories')->insert([
        //             'stock_id' => $stock->id,
        //             'price' =>rand($stock->price-20, $stock->price + 20),
        //             'recorded_at' => now(),
        //             'updated_at' => now(),
        //         ]);
        //     }
        // }
        // $stocks = [
        //     ['symbol' => 'AAPL', 'name' => 'Apple Inc', 'price' => 170, 'user_id' => 1],
        //     ['symbol' => 'TSLA', 'name' => 'Tesla Inc', 'price' => 240, 'user_id' => 1],
        //     ['symbol' => 'AMZN', 'name' => 'Amazon.com Inc', 'price' => 130, 'user_id' => 1],
        //     ['symbol' => 'GOOGL', 'name' => 'Alphabet Inc', 'price' => 125, 'user_id' => 1],
        //     ['symbol' => 'MSFT', 'name' => 'Microsoft Corp', 'price' => 310, 'user_id' => 1],
        //     ['symbol' => 'NVDA', 'name' => 'NVIDIA Corp', 'price' => 400, 'user_id' => 1],
        //     ['symbol' => 'META', 'name' => 'Meta Platforms', 'price' => 230, 'user_id' => 1],
        //     ['symbol' => 'NFLX', 'name' => 'Netflix Inc', 'price' => 450, 'user_id' => 1],
        //     ['symbol' => 'BABA', 'name' => 'Alibaba Group', 'price' => 90, 'user_id' => 1],
        //     ['symbol' => 'INTC', 'name' => 'Intel Corp', 'price' => 50, 'user_id' => 1],
        //     ['symbol' => 'AMD', 'name' => 'Advanced Micro Devices', 'price' => 95, 'user_id' => 1],
        //     ['symbol' => 'PYPL', 'name' => 'PayPal Holdings', 'price' => 80, 'user_id' => 1],
        //     ['symbol' => 'ADBE', 'name' => 'Adobe Inc', 'price' => 620, 'user_id' => 1],
        //     ['symbol' => 'CRM', 'name' => 'Salesforce Inc', 'price' => 210, 'user_id' => 1],
        //     ['symbol' => 'UBER', 'name' => 'Uber Technologies', 'price' => 45, 'user_id' => 1],
        //     ['symbol' => 'LYFT', 'name' => 'Lyft Inc', 'price' => 50, 'user_id' => 1],
        //     ['symbol' => 'TWTR', 'name' => 'Twitter Inc', 'price' => 65, 'user_id' => 1],
        //     ['symbol' => 'SNAP', 'name' => 'Snap Inc', 'price' => 75, 'user_id' => 1],
        //     ['symbol' => 'SHOP', 'name' => 'Shopify Inc', 'price' => 1400, 'user_id' => 1],
        //     ['symbol' => 'SQ', 'name' => 'Block Inc', 'price' => 260, 'user_id' => 1],
        //     ['symbol' => 'ROKU', 'name' => 'Roku Inc', 'price' => 100, 'user_id' => 1],
        //     ['symbol' => 'DOCU', 'name' => 'DocuSign Inc', 'price' => 85, 'user_id' => 1],
        //     ['symbol' => 'ZM', 'name' => 'Zoom Video', 'price' => 75, 'user_id' => 1],
        //     ['symbol' => 'PINS', 'name' => 'Pinterest Inc', 'price' => 35, 'user_id' => 1],
        //     ['symbol' => 'BIDU', 'name' => 'Baidu Inc', 'price' => 130, 'user_id' => 1],
        //     ['symbol' => 'BA', 'name' => 'Boeing Co', 'price' => 200, 'user_id' => 1],
        //     ['symbol' => 'CAT', 'name' => 'Caterpillar Inc', 'price' => 250, 'user_id' => 1],
        //     ['symbol' => 'DIS', 'name' => 'Walt Disney', 'price' => 110, 'user_id' => 1],
        //     ['symbol' => 'V', 'name' => 'Visa Inc', 'price' => 230, 'user_id' => 1],
        //     ['symbol' => 'MA', 'name' => 'Mastercard Inc', 'price' => 360, 'user_id' => 1],
        //     ['symbol' => 'JNJ', 'name' => 'Johnson & Johnson', 'price' => 175, 'user_id' => 1],
        //     ['symbol' => 'PG', 'name' => 'Procter & Gamble', 'price' => 150, 'user_id' => 1],
        //     ['symbol' => 'KO', 'name' => 'Coca-Cola', 'price' => 60, 'user_id' => 1],
        //     ['symbol' => 'PEP', 'name' => 'PepsiCo Inc', 'price' => 190, 'user_id' => 1],
        //     ['symbol' => 'NKE', 'name' => 'Nike Inc', 'price' => 120, 'user_id' => 1],
        //     ['symbol' => 'SBUX', 'name' => 'Starbucks Corp', 'price' => 110, 'user_id' => 1],
        //     ['symbol' => 'MCD', 'name' => 'McDonald’s Corp', 'price' => 270, 'user_id' => 1],
        //     ['symbol' => 'WMT', 'name' => 'Walmart Inc', 'price' => 150, 'user_id' => 1],
        //     ['symbol' => 'COST', 'name' => 'Costco Wholesale', 'price' => 600, 'user_id' => 1],
        //     ['symbol' => 'T', 'name' => 'AT&T Inc', 'price' => 19, 'user_id' => 1],
        //     ['symbol' => 'VZ', 'name' => 'Verizon Communications', 'price' => 55, 'user_id' => 1],
        //     ['symbol' => 'XOM', 'name' => 'Exxon Mobil', 'price' => 120, 'user_id' => 1],
        //     ['symbol' => 'CVX', 'name' => 'Chevron Corp', 'price' => 160, 'user_id' => 1],
        //     ['symbol' => 'SLB', 'name' => 'Schlumberger', 'price' => 55, 'user_id' => 1],
        //     ['symbol' => 'COP', 'name' => 'ConocoPhillips', 'price' => 70, 'user_id' => 1],
        //     ['symbol' => 'BP', 'name' => 'BP PLC', 'price' => 33, 'user_id' => 1],
        //     ['symbol' => 'RDS.A', 'name' => 'Royal Dutch Shell', 'price' => 60, 'user_id' => 1],
        //     ['symbol' => 'TOT', 'name' => 'TotalEnergies', 'price' => 55, 'user_id' => 1],
        //     ['symbol' => 'ENB', 'name' => 'Enbridge Inc', 'price' => 40, 'user_id' => 1],
        //     ['symbol' => 'SU', 'name' => 'Suncor Energy', 'price' => 45, 'user_id' => 1],
        // ];

        // foreach($stocks as $stock){
        //     Stock::create($stock);
        // }
    }
}
