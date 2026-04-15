<?php
namespace App\Services;


class SentimentAnalyzerService {
    private array $bullishKeywords = [
        'moon', 'rocket', 'buy', 'calls', 'bull', 'pump', 'long', 'yolo', 'all in',
        '🚀', '🔥', '💎', '📈', '✅'
    ];

    private array $bearishKeywords = [
        'crash', 'puts', 'bear', 'sell', 'short', 'dump', 'dead', 'fear', 'panic',
        '📉', '🤡', '❌', '🩸'
    ];

    private array $negators = [
        'not', 'never', 'no', "don't", 'sold', 'selling'
    ];
    private array $bullishPhrases = ['all in', 'to the moon','short squeeze', 'break out', 'load up', 'backed up the truck' , 'strong buy'];
    private array $bearishPhrases  = ['get out', 'cut losses', 'stop loss hit', 'bull trap', 'price drop', 'going down', 'stay away', 'relief rally'];

    public function analyze(string $text): array
{
    $text = strtolower($text);

    $bullishScore = 0;
    $bearishScore = 0;
    $negateMode   = 0; // ← düzeltildi

    // Multi-word phrase'leri önce kontrol et
    foreach ($this->bullishPhrases as $phrase) {
        if (str_contains($text, $phrase)) $bullishScore += 2;
    }
    foreach ($this->bearishPhrases as $phrase) {
        if (str_contains($text, $phrase)) $bearishScore += 2;
    }

    $words = preg_split('/\s+/', $text);

    foreach ($words as $word) {
        $cleanWord = preg_replace('/[^a-z]/', '', $word);

        if (in_array($cleanWord, $this->negators)) { // ← düzeltildi
            $negateMode = 3;
            continue;
        }

        $isBullish = in_array($cleanWord, $this->bullishKeywords)
                  || in_array($word, $this->bullishKeywords); // emoji için orijinal $word
        $isBearish = in_array($cleanWord, $this->bearishKeywords)
                  || in_array($word, $this->bearishKeywords);

        if ($negateMode > 0) {
            if ($isBullish) $bearishScore++;
            if ($isBearish) $bullishScore++;
            $negateMode--;
        } else {
            if ($isBullish) $bullishScore++;
            if ($isBearish) $bearishScore++;
        }
    }

    $total = $bullishScore + $bearishScore;
    $score = $total > 0 ? (int) round(($bullishScore / $total) * 100) : 50; 

    return [
        'score'     => $score,
        'sentiment' => $score > 55 ? 'bullish' : ($score < 45 ? 'bearish' : 'neutral'),
        'signals'   => ['bull' => $bullishScore, 'bear' => $bearishScore],
    ];
}
}