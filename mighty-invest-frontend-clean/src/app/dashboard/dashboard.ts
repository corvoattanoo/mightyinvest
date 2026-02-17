import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService } from '../service/stock.service';
import { Stock, StockHistory } from '../models/stock.model';
import { Chart, registerables } from 'chart.js';


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

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.stockService.getStocks().subscribe({
      next: (data) => {
        this.stocks = data;
        //console.log('Stocks loaded:', data);
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

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    // Wait for view to update and canvas to be present
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
