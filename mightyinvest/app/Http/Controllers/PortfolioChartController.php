<?php

namespace App\Http\Controllers;
use App\Models\PortfolioSnapshot;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PortfolioChartController extends Controller {
    public function performance(Request $request) {
        $range = $request->query('range', '1D');
        $query = PortfolioSnapshot::where('user_id', auth()->id());

        if ($range === '1D') {
            $query->where('snapshot_at', '>=', Carbon::now()->subDay());
        } elseif ($range === '1W') {
            $query->where('snapshot_at', '>=', Carbon::now()->subWeek());
        } elseif ($range === '1M') {
            $query->where('snapshot_at', '>=', Carbon::now()->subMonth());
        }

        return $query->orderBy('snapshot_at', 'asc') // snapshot_at'e göre sırala
            ->get()
            ->map(fn($s) => [
            'time' => $s->snapshot_at->timestamp,
            'value' => (float) $s->total_value
        ]);

    }
}