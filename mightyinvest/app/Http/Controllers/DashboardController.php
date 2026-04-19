<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Portfolio;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        // 1. Cash Balance
        $cashBalance = $user->balance;

        // 2. Sum Value (Open Positions) - with('stock') is added for speed!
        $holdings = Portfolio::where('user_id', $user->id)->with('stock')->get();
        
        // Using 'current_value' and 'daily_profit' accessors from Portfolio model
        $totalStockValue = $holdings->sum->current_value;
        $totalNetWorth = $cashBalance + $totalStockValue;
        $dailyProfit = $holdings->sum->daily_profit;

        // Portfolio Daily Percentage calculation
        $previousDayValue = $totalNetWorth - $dailyProfit;
        $dailyChangePercentage = $previousDayValue > 0 ? ($dailyProfit / $previousDayValue) * 100 : 0;

        return response()->json([
            'total_balance' => $totalNetWorth,
            'daily_profit' => $dailyProfit,
            'daily_change_percentage' => round($dailyChangePercentage, 2),
            'open_positions' => $holdings->count(),
            'cash_balance' => $cashBalance,
            'stock_value' => $totalStockValue
        ]);
    }
}
