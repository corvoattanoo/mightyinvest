import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../services/stock.service';
import { Subject, takeUntil, debounceTime, switchMap, of, map, forkJoin, catchError, timeout, distinctUntilChanged, finalize } from 'rxjs';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal';
import { StockQuote } from '../../models/stock.model';
import { ActivatedRoute } from '@angular/router';
import { StockChartComponent } from '../dashboard/components/stock-chart/stock-chart';

@Component({
    selector: 'app-markets',
    standalone: true,
    imports: [CommonModule, FormsModule, TradeModalComponent, StockChartComponent],
    templateUrl: './markets.html',
    styleUrl: './markets.css',
})
export class MarketsComponent implements OnInit, OnDestroy {
   stocks: any[] = []; //tabloda gosterilecek hisseler
   searchResults: any[] = [];
   searchQuery = '';
   marketStatus: any = null;
   loading = true;
   viewMode: 'list' | 'detail' = 'list';

   //signals veri degisirse aninda degisir sayfa
   activeCategory = signal('most-traded');
   globalMarkets = signal<any[]>([]);

   // trade modal durumu
   showTradeModal = false;
   tradeMode: 'buy' | 'sell' = 'buy';
   selectedStock: any= null;

   private destroy$ = new Subject<void>();
   private searchSubject = new Subject<string>();
    // Hangi kategoride hangi gerçek semboller çekilecek, buraya yazıyoruz
    private categorySymbols: { [key: string]: string[] } = {
        'most-traded': ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT', 'META'],
    'crypto': ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:SOLUSDT', 'BINANCE:BNBUSDT'],
    'forex': ['OANDA:EUR_USD', 'OANDA:GBP_USD', 'OANDA:USD_JPY'],
    'etfs': ['SPY', 'QQQ', 'VOO', 'VTI', 'ARKK'],
    'indices': ['SPY', 'QQQ', 'DIA'], // Bunlar endekslerin ETF karşılıkları, en güvenlisi!
    'commodities': ['GLD', 'SLV', 'USO'] // Altın, Gümüş, Petrol ETF'leri
};


   constructor(
    private stockService: StockService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
   ) { }

   ngOnInit(): void {
       this.route.queryParams.pipe(
        takeUntil(this.destroy$),
        map(params => params['category'] || 'most-traded'), // Sadece category'yi al
        distinctUntilChanged(), // Aynı kategoriye tekrar tıklanmışsa yeniden yükleme yapma
        switchMap(category => {
            this.loading = true;
            this.cdr.detectChanges(); // Yükleme ekranını hemen göster
            this.activeCategory.set(category);

            const symbols = this.categorySymbols[category] || [];
            if(symbols.length === 0){
                this.stocks = [];
                this.loading = false;
                return of([]); //empty and return
            }
            //for every symbol create an request
            const requests = symbols.map(symbol =>
                this.stockService.getStockQuote(symbol).pipe(
                    timeout(5000),
                    map(quote => ({
                        symbol,
                        name: this.getDisplayName(symbol),
                        livePrice: quote.current_price,
                        change: quote.percent_change,
                        exchange: this.getExchange(symbol),
                        high: quote.high_price,
                        low: quote.low_price,
                        open: quote.open_price,
                        prevClose: quote.previous_close
                    })),
                    catchError(() => of(null))
                )
            );

            return forkJoin(requests).pipe(
                finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges(); // Her durumda ekranı tazele
                })
            );
        })
       ).subscribe({
        next: (data) => {
            //null olanlari temizle 
            this.stocks = data.filter(s => s !== null);
            this.loading = false;
        },
        error: () => {
            this.loading = false;
        }
       });

       this.loadGlobalMarkets();

       this.searchSubject.pipe(
            takeUntil(this.destroy$),
            debounceTime(400),
            switchMap((query) => {
                if (query.length < 2) return of([]);
                return this.stockService.searchStocks(query);
            })
        ).subscribe((results) => {
            this.searchResults = results;
        });
   }
   onSelectedStock(stock: any){
    this.selectedStock = stock;
    this.viewMode = 'detail';
   }

   backToList(){
    this.viewMode = 'list';
    this.selectedStock = null;
   }

   onTradeComplete(): void {
    this.showTradeModal = false;
    // İşlemden sonra gerekirse verileri tekrar çekebilirsin
    this.loadGlobalMarkets();
   }


   
   getDisplayName(symbol: string): string {
    const names: { [key: string]: string } = {
            'AAPL': 'Apple Inc.', 'TSLA': 'Tesla Inc.', 'NVDA': 'NVIDIA Corp.',
            'BINANCE:BTCUSDT': 'Bitcoin', 'BINANCE:ETHUSDT': 'Ethereum',
            'BINANCE:SOLUSDT': 'Solana', 'OANDA:EUR_USD': 'EUR / USD',
            'OANDA:GBP_USD': 'GBP / USD', 'SPY': 'S&P 500 ETF', 'GLD': 'Gold Trust'
        };
        return names[symbol] || symbol;
   }
   getExchange(symbol: string): string {
        return symbol.includes(':') ? 'CRYPTO' : 'NASDAQ';
   }

    loadGlobalMarkets(): void {
        const globalSymbols = ['GLD', 'QQQ', 'SPY']; // Altın, Nasdaq, Euro ETF'leri
        
        const requests = globalSymbols.map(symbol => 
            this.stockService.getStockQuote(symbol).pipe(
                timeout(4000),
                map(quote => ({
                    symbol,
                    name: symbol === 'GLD' ? 'Gold' : symbol === 'QQQ' ? 'USA Tech 100' : 'EUR/USD',
                    type: symbol === 'GLD' ? 'Commodity' : symbol === 'QQQ' ? 'Index' : 'Forex',
                    price: quote.current_price,
                    change: (quote.percent_change >= 0 ? '+' : '') + quote.percent_change.toFixed(2) + '%',
                    positive: quote.percent_change >= 0
                })),
                catchError(() => of(null))
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

    openTradeModal(mode: 'buy' | 'sell'): void {
        this.tradeMode = mode;
        this.showTradeModal = true;
    }

    ngOnDestroy(): void {
        this.destroy$.next(); // Tüm abonelikleri (subscriptions) iptal et
        this.destroy$.complete();
    }
}
