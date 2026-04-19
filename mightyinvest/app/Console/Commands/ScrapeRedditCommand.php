<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SocialScraperService;
use App\Services\SentimentAnalyzerService;
use Illuminate\Support\Facades\DB;
use App\Models\SocialSentiment;

class ScrapeRedditCommand extends Command
{
    //in terminal we gonna run it 'php artisan scrape::reddit'
    protected $signature = 'scrape:reddit';
    protected $description = 'Reddit üzerinden hisse senedi duyarlilik analizi yapar';

    public function __construct(private SocialScraperService $scraper, private SentimentAnalyzerService $analyzer){
        parent::__construct();
    }

    public function handle(): void{
        $subreddits = ['wallstreetbets', 'stocks', 'investing'];
        $this->info("🚀 Reddit taraması başlatıldı...");
        
        
        foreach($subreddits as $subreddit){
            $this->info("--- {$subreddit} kanalı işleniyor ---");
            $this->scraper->humanDelay();
            $posts = $this->scraper->fetchLatestPosts($subreddit, 25);

            foreach($posts as $post){
                $data = $post['data'];
                $title = $data['title'];
                $postId = $data['id'];

                // 1. Ticker (Hisse Kodu) Ayıklama: $AAPL veya TSLA gibi 2-5 harfli büyük kelimeleri bulur
                preg_match('/\$?([A-Z]{2,5})\b/', $title, $matches);
                $ticker = $matches[1] ?? null;

                if($ticker){
                    //analyze post title
                    $titleSentiment = $this->analyzer->analyze($title);
                    $weight = $this->scraper->calculateEngagementWeight($data);
                    if($weight > 0.3){
                        $this->scraper->humanDelay();
                        $comments = $this->scraper->fetchComments($postId);
                        
                    }else{
                         $comments = [];
                         $commentScores = 50;
                    }
                    $commentScores = collect($comments)
                        ->map(fn($comment) => $this->analyzer->analyze($comment)['score'])
                        ->avg() ?? 50;
                    // 4. Nihai Puan Hesaplama (Ham Puan * Ağırlık)
                    // Puanı 50'den (nötr) uzaklaştırıyoruz

                    $finalScore = ($titleSentiment['score'] * 0.4) + ($commentScores * 0.6);
                    $finalScore = round($finalScore * $weight + 50 * (1 - $weight));
                    $finalSentiment = $finalScore > 55 ? 'bullish' : ($finalScore < 45 ? 'bearish' : 'neutral');

                    // 5. Veritabanını Güncelle (Bisturi Yöntemi: updateOrCreate)
                    SocialSentiment::updateOrCreate(
                        ['ticker' => $ticker, 'source' => $subreddit],
                        [
                            'score' => round($finalScore),
                            'sentiment' => $finalSentiment,
                            'post_count' => DB::raw('post_count +1'),
                            'avg_engagement' => $weight,
                        ]
                    );
                    $this->line("✅ {$ticker}: {$finalSentiment} (Puan: " . round($finalScore) . ")");
                }
            }
        }
         $this->info("🎯 Tarama başarıyla tamamlandı.");
    }
}
