<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SocialScraperService
{
    private string $baseUrl = "https://www.reddit.com/r";
    


    public function fetchLatestPosts(string $subreddit, int $limit = 50): array{
        
        $cacheKey = "reddit_posts_{$subreddit}_{$limit}";

        return Cache::remember($cacheKey, now()->addMinutes(30), function() use ($subreddit, $limit){
            $endpoints = ['hot', 'new'];
            $allposts = [];
            foreach( $endpoints as $endpoint){
                $url = "{$this->baseUrl}/{$subreddit}/{$endpoint}.json?limit={$limit}";
                
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ])->get($url);

                if ($response->status() === 429) {
                   Log::warning("Reddit Rate Limit hit for subreddit: {$subreddit}/{$endpoint}");
                    return [];
                }    
                if($response->failed()){
                Log::error("Reddit API error {$subreddit}/{$endpoint} - Status: " . $response->status());
                    continue;
                }
                $posts = collect($response->json('data.children') ?? []);
                if ($endpoint === 'hot') {
                    $posts = $posts->filter(fn($post) => ($post['data']['ups'] ?? 0) >= 100);
                    Log::info("Subreddit: {$subreddit}/{$endpoint} - FILTERED (ups>=100) posts: " . $posts->count());
                }

                $allposts = array_merge($allposts, $posts->values()->toArray());
                Log::info("Current total posts in loop: " . count($allposts));
          
        } catch (\Exception $e) {
            Log::error("Reddit connection error". $e->getMessage());
            return [];
        }
        }
        return $allposts;
        });       
    }
    /**
 * Belirli bir postun yorumlarını çeker
 * Reddit bu endpoint'te [post, yorumlar] şeklinde 2'li array döner
 */
public function fetchComments(string $postId, int $limit = 20): array
{
    $url = "https://www.reddit.com/comments/{$postId}.json?limit={$limit}&sort=top";

    try {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ])->get($url);

        if ($response->failed()) {
            Log::error("Yorum çekme hatası: post {$postId}");
            return [];
        }

        // [1] = yorumlar, [0] = post — direkt index ile erişiyoruz
        $comments = $response->json('1.data.children') ?? [];

        return collect($comments)
            ->map(fn($c) => $c['data']['body'] ?? null)
            ->filter()                    // null ve [deleted] olanları çıkar
            ->reject(fn($b) => $b === '[deleted]' || $b === '[removed]')
            ->values()
            ->toArray();

    } catch (\Exception $e) {
        Log::error("Yorum bağlantı hatası: " . $e->getMessage());
        return [];
    }
}

    /**
     * Postun 'Agirligini' hesaplar (Upvote ve Yorum sayısına göre)
     * Logaritmik ölçekleme kullanılır: 100 vs 1000 upvote farkı önemlidir, 
     * ama 50.000 vs 51.000 farkı skoru bozmamalıdır.
     */

    public function calculateEngagementWeight(array $postData) : float {
        $ups = $postData['ups'] ?? 0;
        $numComments = $postData['num_comments'] ?? 0;

        // Yorumlara daha fazla ağırlık veriyoruz (x3) çünkü etkileşimi daha iyi temsil eder
        $engagement = $ups + ($numComments * 3);

        // Bölücü rakamı 5'ten 4'e düşürerek ağırlığın daha hızlı yükselmesini sağlıyoruz
        // Ayrıca 0.35 taban puan ekliyoruz ki her postun bir etkisi olsun
        $weight = (log10(max($engagement, 1)) / 4) + 0.35;

        return min($weight, 1.0); // max 1.0;
    }
    // IM A HUMAN AFTER ALL, DONT PUT YOUR BLAME ON MEEE.
    public function humanDelay(): void{
        usleep(random_int(400_000, 1_200_000));
    }
}