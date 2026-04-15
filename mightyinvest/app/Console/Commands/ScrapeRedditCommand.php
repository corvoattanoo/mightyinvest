<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SocialScraperService;
use App\Services\SentimentAnalyzerService;
use Illuminate\Support\Facades\DB;

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

                    //analyze comments
                    $comments = $this->scraper->fetchComments($postId);
                    $commentScores = collect($comments)
                        ->map(fn($comment) => $this->analyzer->analyze($comment)['score'])
                        ->avg() ?? 50;


                    $weight = $this->scraper->calculateEngagementWeight($data);
                    // 4. Nihai Puan Hesaplama (Ham Puan * Ağırlık)
                    // Puanı 50'den (nötr) uzaklaştırıyoruz

                    $finalScore = ($titleSentiment['score'] * 0.4) + ($commentScores * 0.6);
                    $finalScore = round($finalScore * $weight + 50 * (1 - $weight));
                    $finalSentiment = $finalScore > 55 ? 'bullish' : ($finalScore < 45 ? 'bearish' : 'neutral');

                    //update database
                    // Mevcut kaydı kontrol et
                    $existing = DB::table('social_sentiments')
                        ->where('ticker', $ticker)
                        ->where('source', $subreddit)
                        ->first();
                    if ($existing) {
                        // Varsa GÜNCELLE
                        DB::table('social_sentiments')
                            ->where('id', $existing->id)
                            ->update([
                                'score'      => round($finalScore),
                                'sentiment'  => $finalSentiment,
                                'post_count' => $existing->post_count + 1,
                                'avg_engagement' => $weight,
                                'updated_at' => now(),
                            ]);
                    } else {
                        // Yoksa YENİ EKLE
                        DB::table('social_sentiments')->insert([
                            'ticker'     => $ticker,
                            'source'     => $subreddit,
                            'score'      => round($finalScore),
                            'sentiment'  => $finalSentiment,
                            'post_count' => 1,
                            'avg_engagement' => $weight,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                    $this->line("✅ {$ticker}: {$finalSentiment} (Puan: " . round($finalScore) . ")");
                    $this->line("✅ {$ticker}: {$titleSentiment['sentiment']} (Puan: " . round($finalScore) . ")");
                }
            }
        }
         $this->info("🎯 Tarama başarıyla tamamlandı.");
    }
}
