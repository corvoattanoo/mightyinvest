<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Portfolio;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function buy(Request $request)
    {
        $validated = $request->validate([
            'stock_id' => 'nullable|exists:stocks,id',
            'symbol' => 'required_without:stock_id|string',
            'name' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'required|numeric|min:0',
        ]);
        $user = auth()->user();

        try{
            DB::transaction(function () use ($validated, $user){
        $cost = $validated['quantity'] * $validated['purchase_price'];

        //Check if ther is enough balance
        if($user->balance < $cost){
            throw new \Exception('Insufficient balance');
        }
        $userId = auth()->id();
        $stockId = $validated['stock_id'] ?? null;

        if (!$stockId) {
            $stock = Stock::firstOrCreate(
                ['symbol' => $validated['symbol']],
                ['name' => $validated['name'] ?? $validated['symbol'], 'price' => $validated['purchase_price']]
            );
            $stockId = $stock->id;
        }

        Transaction::create([
            'user_id' => $userId,
            'stock_id' => $stockId,
            'type' => 'buy',
            'quantity' => $validated['quantity'],
            'purchase_price' => $validated['purchase_price'],
        ]);

        // Portfolio güncelle veya oluştur
        $portfolio = Portfolio::where('user_id', $userId)
            ->where('stock_id', $stockId)
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
                'stock_id' => $stockId,
                'quantity' => $validated['quantity'],
                'average_price' => $validated['purchase_price'],
                'name' => 'Default', // Migration expects a name
                'description' => 'Automatically created', // Migration expects description
            ]);
        }
        
        $user->decrement('balance', $cost);
        
        });
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage()], 400);
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
        $user = auth()->user();
        try{
            DB::transaction(function() use ($validated, $user){
            $userId = auth()->id();
            // Portfolio kontrol
        $portfolio = Portfolio::where('user_id', $userId)
            ->where('stock_id', $validated['stock_id'])
            ->first();

        if (!$portfolio) {
            throw new \Exception('Stock not found in portfolio');
        }

        if ($portfolio->quantity < $validated['quantity']) {
            throw new \Exception('Not enough stock');
        }    

        $revenue = $validated['quantity'] * $validated['price'];
        
        $user->increment('balance', $revenue);

        // Transaction kaydı oluştur
        Transaction::create([
            'user_id' => $userId,
            'stock_id' => $validated['stock_id'],
            'type' => 'sell',
            'quantity' => $validated['quantity'],
            'purchase_price' => $validated['price'],
        ]);

        // Portfolio güncelle veya sil
        $remaining = $portfolio->quantity - $validated['quantity'];

        if ($remaining == 0) {
            $portfolio->delete();
        } else {
            $portfolio->update(['quantity' => $remaining]);
        }

        return response()->json(['message' => 'Stock sold']);
        });
        }catch(\Exception $e){
            return response()->json(['error'=> $e->getMessage()], 400);
        }

        return response()->json(['message' => 'Stock sold'], 201);
               
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