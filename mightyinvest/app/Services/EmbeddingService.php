<?php

namespace App\Services;
use Illuminate\Support\Facades\Http;


class EmbeddingService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function embed(string $text){

        $response = Http::withToken(config('services.voyageai.key'))
            ->post('https://api.voyageai.com/v1/embeddings', [
                'model'=> 'voyage-3.5-lite',
                'input' => [$text],
                'input_type' => 'document',  ]);
          
        return $response->json('data.0.embedding');
    }   

}
