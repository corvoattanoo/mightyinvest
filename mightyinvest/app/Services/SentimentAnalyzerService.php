<?php
namespace App\Services;


class SentimentAnalyzerService {
    private array $bullishKeywords = [
        // WSB tarzı
        'moon', 'rocket', 'buy', 'calls', 'bull', 'pump', 'long', 'yolo',
        '🚀', '🔥', '💎', '📈', '✅',
        // Finansal haber dili
        'soar', 'soars', 'soaring', 'surges', 'surge', 'rallies', 'rally',
        'profit', 'profits', 'jumped', 'breakout', 'outperforms', 'beats',
        'gains', 'upside', 'strong', 'bullish', 'upgrade', 'upgraded',
        'growth', 'record', 'winning', 'recovery', 'rebound', 'beat',
    ];

    private array $bearishKeywords = [
        // WSB tarzı
        'crash', 'puts', 'bear', 'sell', 'short', 'dump', 'panic', 'fear',
        '📉', '🤡', '❌', '🩸',
        // Finansal haber dili
        'plunges', 'plunge', 'tumbles', 'tumble', 'fell', 'drops', 'slumps',
        'slump', 'losses', 'bankruptcy', 'bankrupt', 'bearish', 'downgrade',
        'downgraded', 'missed', 'recession', 'selloff', 'collapse',
    ];

    private array $negators = [
        'not', 'never', 'no', "don't", 'sold', 'selling', 'avoid'
    ];
    private array $bullishPhrases = [
        'all in', 'to the moon','short squeeze', 'break out', 'load up', 
        'backed up the truck' , 'strong buy', 'all time high', 'ath',
        'price target up', 'beat earnings', 'revenue growth'
    ];
    private array $bearishPhrases  = [
        'get out', 'cut losses', 'stop loss hit', 'bull trap', 'price drop', 
        'going down', 'stay away', 'relief rally', 'all time low', 'atl',
        'price target down', 'missed earnings', 'debt crisis'
    ];

    public function analyze(string $text): array
{
    $text = strtolower($text);

    $bullishScore = 0;
    $bearishScore = 0;
    $negateMode   = 0; 

    // Multi-word phrase'leri önce kontrol et
    foreach ($this->bullishPhrases as $phrase) {
        if (str_contains($text, $phrase)) $bullishScore += 2;
    }
    foreach ($this->bearishPhrases as $phrase) {
        if (str_contains($text, $phrase)) $bearishScore += 2;
    }

    $words = preg_split('/\s+/', $text);

    foreach ($words as $word) {
        $word = trim($word);
        if (empty($word)) continue;
        
        $cleanWord = preg_replace('/[[:punct:]]/', '', strtolower($word)); // Sadece noktalama işaretlerini sil

        if (in_array($cleanWord, $this->negators)) { 
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