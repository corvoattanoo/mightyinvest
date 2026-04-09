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

        // 2. Sum Value (Open Positions)
        $holdings = Portfolio::where('user_id', $user->id)->get();
        
        // Using 'current_value' and 'profit' accessors from Portfolio model
        $totalStockValue = $holdings->sum->current_value;
        $totalNetWorth = $cashBalance + $totalStockValue;
        $totalProfit = $holdings->sum->profit;

        return response()->json([
            'total_balance' => $totalNetWorth,
            'daily_profit' => $totalProfit,
            'open_positions' => $holdings->count(),
            'cash_balance' => $cashBalance,
            'stock_value' => $totalStockValue
        ]);
    }
}
