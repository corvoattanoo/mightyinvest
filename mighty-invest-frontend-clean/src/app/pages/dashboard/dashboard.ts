import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../core/services/auth.service';
import { Stock, StockHistory } from '../../models/stock.model';
import { Chart, registerables } from 'chart.js';
import { PortfolioService } from '../../core/services/portfolio.service';


Chart.register(...registerables);

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
    stocks: Stock[] = [];
    selectedStock: Stock | null = null;
    history: StockHistory[] = [];
    chart: any;

    @ViewChild('stockChart') stockChart!: ElementRef<HTMLCanvasElement>;

    constructor(
        private stockService: StockService,
        private authService: AuthService,
        private router: Router,
        private portfolioService: PortfolioService, //Önce PortfolioService’i inject
    ) { }

    ngOnInit(): void {
        this.stockService.getStocks().subscribe({
            next: (data) => {
                this.stocks = data;
            },
            error: (error) => {
                console.error('Error loading stocks:', error);
            }
        });
    }

    selectStock(stock: Stock): void {
        this.selectedStock = stock;
        this.stockService.getStockHistory(stock.id).subscribe((data) => {
            this.history = data;
            this.renderChart();
        });
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
        this.portfolioService.getPortfolio().subscribe({
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
}
