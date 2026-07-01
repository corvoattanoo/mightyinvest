<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Services\EmbeddingService;

use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(EmbeddingService $embedService) {
        $this->embedService = $embedService;
    }
    public function chat(Request $request){

        $message = $request->input('message');

        $queryEmbedding = $this->embedService->embed($message);

        $vector = '[' . implode(',', $queryEmbedding) . ']';

        //similarity search

        $results = DB::select("
            SELECT se.content, s.symbol,
                se.embedding <=> ?::vector AS distance
            FROM stock_embeddings se
            JOIN stocks s ON s.id = se.stock_id
            ORDER BY distance ASC
            LIMIT 3
        ", [$vector]);

        $context = collect($results)->map(fn($r) => $r->content)->join("\n");
    }
}
