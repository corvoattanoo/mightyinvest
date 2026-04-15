<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
class SocialScraperService
{
    private string $baseUrl = "https://www.reddit.com/r";


    public function fetchLatestPosts(string $subreddit, int $limit = 50): array{
        $url = "{$this->baseUrl}/{$subreddit}/new.json?limit={$limit}";
        try {
                $response = Http::withHeaders([
                'User-Agent' => 'MightyInvest/1.0 (Laravel Portfolio Tracker)'
                    ])->get($url);

                if($response->failed()){
                Log::error("Reddit API error". $subreddit);
                return [];
                }

                return $response->json('data.children') ?? [];

                
            
        } catch (\Exception $e) {
            Log::error("Reddit connnection error". $e->getMessage());
            return [];
        }
        
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
            'User-Agent' => 'MightyInvest/1.0 (Laravel Portfolio Tracker)'
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

        //calculate total interaction
        $engagement = $ups + ($numComments*2);

        $weight = log10(max($engagement, 1)) / 5; //assume max interavtion 100.000

        return min($weight, 1.0); //max 1;
    }
}