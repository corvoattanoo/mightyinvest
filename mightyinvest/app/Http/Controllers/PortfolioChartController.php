<?php

namespace App\Http\Controllers;
use App\Models\PortfolioSnapshot;
use Illuminate\Http\Request;

class PortfolioChartController extends Controller {
    public function performance() {
        return PortfolioSnapshot::where('user_id', auth()->id())
            ->orderBy('snapshot_at', 'asc') // snapshot_at'e göre sırala
            ->get()
            ->map(fn($s) => [
            'time' => $s->snapshot_at->timestamp,
            'value' => (float) $s->total_value
        ]);

    }
}