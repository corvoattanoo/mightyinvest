<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Portfolio;

class TransactionController extends Controller
{
    public function buy(Request $request)
    {
        $validated = $request->validate([
            'stock_id' => 'required|exists:stocks,id',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'required|numeric|min:0',
        ]);

        $userId = auth()->id();

        // Transaction kaydı oluştur
        Transaction::create([
            'user_id' => $userId,
            'stock_id' => $validated['stock_id'],
            'type' => 'buy',
            'quantity' => $validated['quantity'],
            'price' => $validated['purchase_price'],
        ]);

        // Portfolio güncelle veya oluştur
        $portfolio = Portfolio::where('user_id', $userId)
            ->where('stock_id', $validated['stock_id'])
            ->first();

        if ($portfolio) {
            $totalCost = ($portfolio->quantity * $portfolio->average_price)
                + ($validated['quantity'] * $validated['purchase_price']);
            $totalQuantity = $portfolio->quantity + $validated['quantity'];

            $portfolio->update([
                'quantity' => $totalQuantity,
                'average_price' => $totalCost / $totalQuantity,
            ]);
        } else {
            Portfolio::create([
                'user_id' => $userId,
                'stock_id' => $validated['stock_id'],
                'quantity' => $validated['quantity'],
                'average_price' => $validated['purchase_price'],
            ]);
        }

        return response()->json(['message' => 'Stock purchased'], 201);
    }

    public function sell(Request $request)
    {
        $validated = $request->validate([
            'stock_id' => 'required|exists:stocks,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        $userId = auth()->id();

        // Portfolio kontrol
        $portfolio = Portfolio::where('user_id', $userId)
            ->where('stock_id', $validated['stock_id'])
            ->first();

        if (!$portfolio) {
            return response()->json(['error' => 'Stock not found in portfolio'], 400);
        }

        if ($portfolio->quantity < $validated['quantity']) {
            return response()->json(['error' => 'Not enough stock'], 400);
        }

        // Transaction kaydı oluştur
        Transaction::create([
            'user_id' => $userId,
            'stock_id' => $validated['stock_id'],
            'type' => 'sell',
            'quantity' => $validated['quantity'],
            'price' => $validated['price'],
        ]);

        // Portfolio güncelle veya sil
        $remaining = $portfolio->quantity - $validated['quantity'];

        if ($remaining == 0) {
            $portfolio->delete();
        } else {
            $portfolio->update(['quantity' => $remaining]);
        }

        return response()->json(['message' => 'Stock sold']);
    }

    public function history()
    {
        $userId = auth()->id();

        return Transaction::with('stock')
            ->where('user_id', $userId)
            ->latest()// bak
            ->get();
    }
}