import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../services/stock.service';
import { Subject, takeUntil, debounceTime, switchMap, of } from 'rxjs';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal';
import { StockQuote } from '../../models/stock.model';
@Component({
    selector: 'app-markets',
    standalone: true,
    imports: [CommonModule, FormsModule, TradeModalComponent],
    templateUrl: './markets.html',
    styleUrl: './markets.css',
})
export class MarketsComponent implements OnInit, OnDestroy {
    stocks: any[] = [];         // DB'deki hisseler (seeded stocks)
    searchResults: any[] = [];  // Finnhub arama sonuçları
    searchQuery = '';
    loading = true;
    marketStatus: any = null;   // Piyasa açık/kapalı bilgisi
    // Trade modal state
    showTradeModal = false;
    selectedStock: any = null;
    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>(); // Arama için RxJS Subject
    constructor(private stockService: StockService) { }
    ngOnInit(): void {
        // 1. DB'deki hisseleri çek
        this.stockService.getStocks()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.stocks = data;
                    this.loading = false;
                    // Her hisse için güncel fiyat çek
                    this.fetchLivePrices();
                },
                error: () => { this.loading = false; }
            });
        // 2. Piyasa durumu
        this.stockService.getMarketStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => this.marketStatus = data);
        // 3. Arama: debounceTime ile kullanıcı yazmayı bırakana kadar bekle
        this.searchSubject.pipe(
            takeUntil(this.destroy$),
            debounceTime(400),  // 400ms bekle (her tuşta istek atma!)
            switchMap((query) => {
                // switchMap: Önceki isteği iptal et, sadece son aramayı yap
                if (query.length < 2) return of([]); // 2 karakterden azsa arama yapma
                return this.stockService.searchStocks(query);
            })
        ).subscribe((results) => {
            this.searchResults = results;
        });
    }
    onSearch(query: string): void {
        this.searchQuery = query;
        this.searchSubject.next(query); // Subject'e gönder, debounce beklesin
    }
    fetchLivePrices(): void {
        // Her hisse için Finnhub'dan güncel fiyat al
        this.stocks.forEach((stock) => {
            this.stockService.getStockQuote(stock.symbol)
                .pipe(takeUntil(this.destroy$))
                .subscribe((quote) => {
                    stock.livePrice = quote.current_price;
                    stock.change = quote.percent_change;
                });
        });
    }
    openBuyModal(stock: any): void {
        this.selectedStock = stock;
        this.showTradeModal = true;
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
