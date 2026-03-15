import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../core/services/auth.service';
import { Stock, StockHistory } from '../../models/stock.model';
import { Chart, registerables } from 'chart.js';
import { PortfolioService } from '../../core/services/portfolio.service';


Chart.register(...registerables);

import { StatCardComponent } from './components/stat-card/stat-card';
import { WatchlistComponent } from './components/watchlist/watchlist'
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, StatCardComponent, WatchlistComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
    stocks: Stock[] = [];
    selectedStock: Stock | null = null;
    history: StockHistory[] = [];
    chart: any;
    watchlistStocks: Stock[] = [];
    private destroy$ = new Subject<void>();

    @ViewChild('stockChart') stockChart!: ElementRef<HTMLCanvasElement>;

    constructor(
        private stockService: StockService,
        private authService: AuthService,
        private router: Router,
        private portfolioService: PortfolioService, //Önce PortfolioService’i inject
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
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

    onAddStock(symbol: string) {
        this.stockService.searchStocks(symbol).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    if (data && data.length > 0) {
                        const stock = data[0];
                        console.log("Api response: ", data);

                        if (!this.watchlistStocks.some(s => s.id === stock.id)) {
                            // DB'ye kaydetmek için addToWatchlist çağırıyoruz:
                            this.stockService.addToWatchlist(stock.id).pipe(takeUntil(this.destroy$))
                                .subscribe({
                                    next: () => {
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
        this.selectedStock = stock;

        this.stockService.getStockHistory(stock.id).pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.history = data;
                this.renderChart();
                this.cdRef.detectChanges();
            })
        // fire the real data from finnhub
        this.stockService.getStockQuote(stock.symbol).pipe(takeUntil(this.destroy$))
            .subscribe((quoteData) => {
                this.selectedStock = { ...this.selectedStock, ...quoteData };
                this.cdRef.detectChanges();
            })

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
                    this.portfolioData = res.map((item: any) => ({
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

    renderChart(): void {
        if (this.chart) {
            this.chart.destroy();
        }

        setTimeout(() => {
            if (!this.stockChart) return;
            const ctx = this.stockChart.nativeElement.getContext('2d');
            if (!ctx) return;

            const labels = this.history.map(h => new Date(h.recorded_at).toLocaleTimeString());
            const prices = this.history.map(h => h.price);

            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${this.selectedStock?.name} Price`,
                        data: prices,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                }
            });
        }, 0);
    }
    ngOnDestroy(): void {
        this.destroy$.next();// "Bileşen yok oluyor!" sinyalini gönder
        this.destroy$.complete()// Kanalı tamamen kapat
    }
}
