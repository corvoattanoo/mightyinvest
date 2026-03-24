import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../core/services/auth.service';
import { Stock, StockHistory } from '../../models/stock.model';
import { PortfolioService } from '../../core/services/portfolio.service';



import { StatCardComponent } from '../dashboard/components/stat-card/stat-card';
import { WatchlistComponent } from '../dashboard/components/watchlist/watchlist';
import { Subject, takeUntil } from 'rxjs';
import { StockChartComponent } from '../dashboard/components/stock-chart/stock-chart';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class PortfolioComponent implements OnInit {
  portfolioData: any[] = [] // stocks
  cashBalance: number = 10000; //users will set it
  loading: boolean = true;

  get totalStockValue(): number {
    return this.portfolioData.reduce((sum, item) => sum + (item.quantity * item.current_price), 0);
  }

  constructor(private portfolioService: PortfolioService){

  }

  // Total balance = Value of stocks + current cash

  get totalNetWorth(): number {
    const stockValue = this.portfolioData.reduce((sum, item) => sum + (item.quantity * item.current_price), 0);
    return stockValue + this.cashBalance;
  }

  ngOnInit(): void {
    this.loading = true;
    this.portfolioService.getPortfolio().subscribe({
      next: (res) => {
        // gelen response u , htmlin bekledigi hale sokuyoruz 
      this.portfolioData = res.map((item: any) =>({
          symbol: item.stock.symbol,
          name: item.stock.name,
          quantity: item.quantity,
          average_price: item.average_price,
          current_price: item.stock.price
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get stockPercentage(): number {
    if (this.totalNetWorth === 0) return 0;
    return (this.totalStockValue / this.totalNetWorth) * 100;
  }

  get donutStyle(){
    const stockPerc = this.stockPercentage;
    return `conic-gradient(#1337ec 0% ${stockPerc}%, #3b3f54 ${stockPerc}% 100%)`;
  }

  getTotalWorth() {

  }
}
