<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\PortfolioSnapshot;

class TakePortfolioSnapshot extends Command
{
    // Terminalde çalıştırmak için kullanacağımız isim: php artisan portfolio:snapshot
    protected $signature = 'portfolio:snapshot';
    protected $description = 'Her kullanıcının günlük toplam varlığını kaydeder';

    public function handle()
    {
        $this->info('Portföy kayıtları alınıyor...');
        
        User::all()->each(function ($user) {
            // Bakiyesini ve hisselerinin o anki toplam değerini hesapla
            $holdingsValue = $user->portfolios()->with('stock')->get()->sum('current_value');
            $totalValue = $user->balance + $holdingsValue;

            // Bugün için kayıt varsa güncelle, yoksa yeni oluştur
            PortfolioSnapshot::create([
                'user_id' => $user->id,
                'total_value' => $totalValue,
                'snapshot_at' => now(), // Anlık zamanı kaydet
            ]);
        });

        $this->info('Kayıt işlemi başarıyla tamamlandı!');
    }
}