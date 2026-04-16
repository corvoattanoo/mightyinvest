import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../core/services/auth.service';
import { Stock, StockHistory } from '../../models/stock.model';
import { PortfolioService } from '../../core/services/portfolio.service';



import { StatCardComponent } from './components/stat-card/stat-card';
import { WatchlistComponent } from './components/watchlist/watchlist'
import { Subject, takeUntil } from 'rxjs';
import { StockChartComponent } from './components/stock-chart/stock-chart';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, StatCardComponent, WatchlistComponent, StockChartComponent, TradeModalComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
    stocks: Stock[] = [];
    selectedStock: Stock | null = null;
    history: StockHistory[] = [];
    watchlistStocks: Stock[] = [];
    private destroy$ = new Subject<void>();
    stats: DashboardStats = {
        total_balance: 0,
        daily_profit: 0,
        daily_change_percentage: 0,
        open_positions: 0,
        cash_balance: 0,
        stock_value: 0,
    }

    // Trade modal state
    showTradeModal = false;
    tradeMode: 'buy' | 'sell' = 'buy';

    constructor(
        private dashboardService: DashboardService,
        private stockService: StockService,
        private authService: AuthService,
        private router: Router,
        private portfolioService: PortfolioService, //Önce PortfolioService’i inject
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.getPortfolio();
        this.loadDashboardStats();
        this.stockService.getStocks().pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.stocks = data;
                    this.cdRef.detectChanges();
                },
                error: (error) => {
                    console.error('Error loading stocks:', error);
                }
            });
        this.stockService.getWatchlist().pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.watchlistStocks = data;
                    this.fetchWatchlistQuotes();
                    this.cdRef.detectChanges();
                },
                error: (error) => { console.error('Error loading watchlist:', error) }
            });
        this.stockService.selectedStock$.pipe(takeUntil(this.destroy$))
            .subscribe(stock => {
                if (stock) {
                    this.selectStock(stock);
                }
            })
    }

    loadDashboardStats(): void {
        this.dashboardService.getStats().pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.stats = data;
                    this.cdRef.detectChanges();
                },
                error: (err) => console.log('Stats error', err)
            });
    }

    onAddStock(symbol: string) {
        this.stockService.searchStocks(symbol).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    if (data && data.length > 0) {
                        const stock = data[0];
                        console.log("Api response: ", data);

                        if (!this.watchlistStocks.some(s => s.symbol === stock.symbol)) {
                            // DB'ye kaydetmek için addToWatchlist çağırıyoruz:
                            this.stockService.addToWatchlist(stock.symbol).pipe(takeUntil(this.destroy$))
                                .subscribe({
                                    next: (res: any) => {
                                        console.log('Backend Gelen Cevap:', res);
                                        stock.price = res.price;
                                        stock.percent_change = res.percent_change;
                                         console.log('Güncellenen Stock Objesi:', stock);
                                        this.watchlistStocks.push(stock);
                                        console.log('stock added to the database and watchlist:', stock.symbol);
                                        this.cdRef.detectChanges();
                                    },
                                    error: (err) => console.error('Error adding to watchlist database:', err)
                                });
                        } else {
                            console.log('stock already in watchlist:', stock.symbol);
                        }
                    } else {
                        console.warn('No stock found for symbol:', symbol)
                    }
                },
                error: (err) => console.error('error fetching stock details:', err)
            });
    }

    selectStock(stock: Stock): void {
        console.log('Seçilen Hisse Bilgileri:', stock);
        this.selectedStock = stock;

        // Note: We'll need to update getStockHistory to potentially handle symbols or IDs
        if (stock.id) {
            this.stockService.getStockHistory(stock.id).pipe(takeUntil(this.destroy$))
                .subscribe((data) => {
                    console.log('Hisse Geçmişi (Raw):', data);
                    this.history = data;

                    this.cdRef.detectChanges();
                })
            // fire the real data from finnhub
            this.stockService.getStockQuote(stock.symbol).pipe(takeUntil(this.destroy$))
                .subscribe((quoteData) => {
                    this.selectedStock = {
                        ...this.selectedStock,
                        current_price: quoteData.current_price,
                        change: quoteData.change,
                        percent_change: quoteData.percent_change
                    } as Stock;
                    this.cdRef.detectChanges();
                })

        }
    }

    openTradeModal(mode: 'buy' | 'sell'): void {
        console.log('Modal window is triggered:', mode);
        if (this.selectedStock) {
            this.tradeMode = mode;
            this.showTradeModal = true;
            this.cdRef.detectChanges();
        }
    }

    onTradeComplete(): void {
        this.getPortfolio();
        this.fetchWatchlistQuotes();
        if (this.selectedStock) {
            this.selectStock(this.selectedStock);
        }
        this.loadDashboardStats();
    }

    logout(): void {
        this.authService.logout();
    }

    portfolioData: any[] = [];
    portfolioLoading = false;
    portfolioError = '';

    getPortfolio(): void {
        this.portfolioLoading = true;
        this.portfolioError = '';
        this.portfolioService.getPortfolio().pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    // Store results in portfolioData, NOT in stocks (stocks is the global list)
                    this.portfolioData = res.holdings.map((item: any) => ({
                        ...item.stock,
                        quantity: item.quantity,
                        average_price: item.average_price
                    }));
                    this.portfolioLoading = false;
                    console.log('Portfolio:', this.portfolioData);
                },
                error: (err) => {
                    this.portfolioError = 'Failed to load portfolio.';
                    this.portfolioLoading = false;
                    console.error(err);
                }
            });
    }

    fetchWatchlistQuotes() {
        this.watchlistStocks.forEach(stock => {
            this.stockService.getStockQuote(stock.symbol).pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (quoteData) => {
                        const index = this.watchlistStocks.findIndex(s => s.symbol === stock.symbol);
                        if (index !== -1) {
                            this.watchlistStocks[index] = {
                                ...this.watchlistStocks[index],
                                current_price: quoteData.current_price,
                                change: quoteData.change,
                                percent_change: quoteData.percent_change
                            } as Stock;
                            this.cdRef.detectChanges();
                        }
                    }
                });
        });

    }
    ngOnDestroy(): void {
        this.destroy$.next();// "Bileşen yok oluyor!" sinyalini gönder
        this.destroy$.complete()// Kanalı tamamen kapat
    }
}
