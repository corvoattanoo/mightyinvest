<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SocialScraperService;
use App\Services\SentimentAnalyzerService;
use App\Models\SocialSentiment;

class ScrapeRedditCommand extends Command
{
    protected $signature   = 'scrape:reddit';
    protected $description = 'Reddit üzerinden hisse senedi duyarlılık analizi yapar';

    // ✓ Class property — handle() her çalışınca yeniden oluşturulmaz
    private array $blacklist = [
        // Finans jargonu
        'CEO', 'CFO', 'CTO', 'COO', 'IPO', 'ETF', 'SEC', 'FED', 'GDP',
        'ATH', 'CPI', 'NFP', 'IMO', 'DD', 'YOLO', 'ATM', 'OTM', 'ITM',
        // Platform / medya
        'USA', 'AI', 'ML', 'CNBC', 'NYSE', 'WSB', 'PDF', 'API', 'URL',
        'NYSE', 'NASDAQ',
        // Genel İngilizce kısaltmalar
        'THE', 'FOR', 'AND', 'BUT', 'NOT', 'ALL', 'NEW', 'NOW',
        'THIS', 'WITH', 'FROM', 'WILL', 'BEEN', 'HAVE', 'JUST',
        'WHAT', 'WHEN', 'THAT', 'THEY', 'THEM',
    ];

    public function __construct(
        private SocialScraperService     $scraper,
        private SentimentAnalyzerService $analyzer
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        $subreddits = ['wallstreetbets', 'stocks', 'investing'];
        $this->info("Reddit taraması başlatıldı...");

        foreach ($subreddits as $subreddit) {
            $this->info("--- {$subreddit} işleniyor ---");
            $this->scraper->humanDelay();
            $posts = $this->scraper->fetchLatestPosts($subreddit, 25);

            foreach ($posts as $post) {
                $data   = $post['data'];
                $title  = $data['title'];
                $postId = $data['id'];

                // 1. Ticker Ayıklama
                // preg_match_all tüm büyük harf kelimeleri çeker
                // collect + filter blacklist'ten geçirir
                // first() en temiz adayı alır
                preg_match_all('/\b([A-Z]{2,5})\b/', $title, $allMatches);

                $ticker = collect($allMatches[1] ?? [])
                    ->filter(fn($c) => !in_array($c, $this->blacklist))
                    ->first();

                // Ticker bulunamadıysa bu postu atla
                if (!$ticker) continue;

                // 2. Başlık analizi
                $titleSentiment = $this->analyzer->analyze($title);

                // 3. Engagement ağırlığı — ÖNCE hesapla, sonra karar ver
                $weight = $this->scraper->calculateEngagementWeight($data);

                // 4. Yorum analizi — sadece yüksek engagement postlar için
                if ($weight > 0.3) {
                    $this->scraper->humanDelay();
                    $comments = $this->scraper->fetchComments($postId);
                } else {
                    $comments = []; // ✓ düşük engagement → yorum çekme
                }

                // ✓ if/else dışında — $comments her zaman tanımlı
                $commentScores = collect($comments)
                    ->map(fn($comment) => $this->analyzer->analyze($comment)['score'])
                    ->avg() ?? 50; // yorum yoksa nötr başlangıç

                // 5. Final skor hesaplama
                $finalScore = ($titleSentiment['score'] * 0.4) + ($commentScores * 0.6);
                $finalScore = round($finalScore * $weight + 50 * (1 - $weight));
                $finalSentiment = $finalScore > 55
                    ? 'bullish'
                    : ($finalScore < 45 ? 'bearish' : 'neutral');

                // 6. Veritabanı güncelle
                $sentiment = SocialSentiment::updateOrCreate(
                    ['ticker' => $ticker, 'source' => $subreddit],
                    [
                        'score'          => $finalScore,
                        'sentiment'      => $finalSentiment,
                        'avg_engagement' => $weight,
                        'top_signal'     => $title,
                    ]
                );

                // ✓ increment ayrı — updateOrCreate'in üzerine yazmasını engeller
                $sentiment->increment('post_count');

                $this->line("✓ {$ticker}: {$finalSentiment} (Puan: {$finalScore})");
            }
        }

        $this->info("Tarama tamamlandı.");
    }
}