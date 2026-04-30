import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../services/stock.service';
import { Subject, takeUntil, debounceTime, switchMap, of, map, forkJoin } from 'rxjs';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal';
import { StockQuote } from '../../models/stock.model';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
@Component({
    selector: 'app-markets',
    standalone: true,
    imports: [CommonModule, FormsModule, TradeModalComponent],
    templateUrl: './markets.html',
    styleUrl: './markets.css',
})
export class MarketsComponent implements OnInit, OnDestroy {
   stocks: any[] = []; //tabloda gosterilecek hisseler
   searchResults: any[] = [];
   searchQuery = '';
   marketStatus: any = null;
   loading = true;

   //signals veri degisirse aninda degisir sayfa
   activeCategory = signal('most-traded');
   globalMarkets = signal<any[]>([]);

   // trade modal durumu
   showTradeModal = false;
   selectedStock: any= null;

   private destroy$ = new Subject<void>();
   private searchSubject = new Subject<string>();
    // Hangi kategoride hangi gerçek semboller çekilecek, buraya yazıyoruz
    private categorySymbols: { [key: string]: string[] } = {
        'most-traded': ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT', 'META'],
        'most-bought': ['IREN', 'HIMS', 'IONQ', 'HOOD'],
        'most-shorted': ['CVX', 'BRK.B', 'XOM', 'JNJ'],
        'commodities': ['GLD', 'SLV', 'USO', 'UNG'],
        'indices': ['SPY', 'QQQ', 'DIA', 'IWM'],
        'forex': ['FXE', 'FXY', 'FXB'],
        'stocks': ['GOOGL', 'NFLX', 'DIS', 'PYPL', 'ADBE'],
        'crypto': ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:SOLUSDT'],
        'etfs': ['VOO', 'VTI', 'VGT', 'ARKK'],
        'treasuries': ['TLT', 'IEF', 'SHY']
    };

   constructor(
    private stockService: StockService,
    private route: ActivatedRoute
   ) { }

   ngOnInit(): void {
        // 1. URL dinleme (Bu bağımsız bir blok)
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const category = params['category'] || 'most-traded';
            this.loadCategory(category);
        });
        // 2. Global market verilerini çekme (Bu da bağımsız)
        this.loadGlobalMarkets(); 
        // 3. Market durumunu çekme (Bu da bağımsız)
        this.stockService.getMarketStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.marketStatus = data;
            });
        // 4. Arama mantığı (Debounce: Kullanıcı yazmayı bitirince ara)
        this.searchSubject.pipe(
            takeUntil(this.destroy$),
            debounceTime(400), // 400ms bekle
            switchMap((query) => {
                if (query.length < 2) return of([]); // 2 harften azsa arama yapma
                return this.stockService.searchStocks(query);
            })
        ).subscribe((results) => {
            this.searchResults = results;
        });    
   }


   // 1. loadCategory metodunu düzgünce kapatalım
   loadCategory(category: string): void {
    this.loading = true;
    this.activeCategory.set(category);
    const symbols = this.categorySymbols[category] || [];
    if(symbols.length === 0){
        this.stocks = [];
        this.loading = false;
        return;
    }
    
    const requests = symbols.map(symbol =>
        this.stockService.getStockQuote(symbol).pipe(
            map(quote => ({
                symbol,
                name: this.getDisplayName(symbol),
                livePrice: quote.current_price,
                change: quote.percent_change, // Bunu da ekleyelim, tabloda lazım
                exchange: this.getExchange(symbol)
            }))
        )
    );
    forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
            this.stocks = data;
            this.loading = false;
        },
        error: () => { this.loading = false; }
    });
   } // <--- loadCategory burada bitti!
   // 2. Diğer yardımcı metodlar ayrı birer fonksiyon olarak devam eder
   getDisplayName(symbol: string): string {
    const names: { [key: string]: string } = {
            'AAPL': 'Apple Inc.', 'TSLA': 'Tesla Motors', 'NVDA': 'NVIDIA Corp.',
            'AMZN': 'Amazon.com', 'MSFT': 'Microsoft Corp.', 'META': 'Meta Platforms',
            'BINANCE:BTCUSDT': 'Bitcoin', 'BINANCE:ETHUSDT': 'Ethereum'
        };
        return names[symbol] || symbol;
   }
   getExchange(symbol: string): string {
        return symbol.includes(':') ? 'CRYPTO' : 'NASDAQ';
   }

       loadGlobalMarkets(): void {
        const globalSymbols = ['GLD', 'QQQ', 'FXE']; // Altın, Nasdaq, Euro ETF'leri
        
        const requests = globalSymbols.map(symbol => 
            this.stockService.getStockQuote(symbol).pipe(
                map(quote => ({
                    symbol,
                    name: symbol === 'GLD' ? 'Gold' : symbol === 'QQQ' ? 'USA Tech 100' : 'EUR/USD',
                    type: symbol === 'GLD' ? 'Commodity' : symbol === 'QQQ' ? 'Index' : 'Forex',
                    price: quote.current_price,
                    change: (quote.percent_change >= 0 ? '+' : '') + quote.percent_change.toFixed(2) + '%',
                    positive: quote.percent_change >= 0
                }))
            )
        );

        // forkJoin ile tüm verileri çekip sinyalimizi (signal) güncelliyoruz
        forkJoin(requests).subscribe(data => {
            this.globalMarkets.set(data);
        });
    }
        onSearch(query: string): void {
        this.searchQuery = query;
        this.searchSubject.next(query); // Arama motorunu tetikle
    }

    openTradeModal(stock: any): void {
        this.selectedStock = stock;
        this.showTradeModal = true;
    }

    ngOnDestroy(): void {
        this.destroy$.next(); // Tüm abonelikleri (subscriptions) iptal et
        this.destroy$.complete();
    }
}
