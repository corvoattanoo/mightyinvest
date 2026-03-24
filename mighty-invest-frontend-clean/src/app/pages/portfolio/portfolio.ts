import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioHolding, PortfolioService } from '../../core/services/portfolio.service';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, TradeModalComponent],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class PortfolioComponent implements OnInit {
  portfolioData: PortfolioHolding[] = [];
  cashBalance: number = 10000; //users will set it
  loading: boolean = true;

  //trade modal state
  showTradeModal = false;
  tradeMode: 'buy' | 'sell' = 'buy';
  selectedHolding: any = null;


  get totalStockValue(): number {
    return this.portfolioData.reduce((sum, item) => sum + item.current_value, 0);
  }

  constructor(private portfolioService: PortfolioService){

  }

  // Total balance = Value of stocks + current cash

  get totalNetWorth(): number {
    return this.totalStockValue + this.cashBalance;
  }

  ngOnInit(): void {
    this.loadPortfolio();
  }

  get stockPercentage(): number {
    if (this.totalNetWorth === 0) return 0;
    return (this.totalStockValue / this.totalNetWorth) * 100;
  }

  get donutStyle(){
    const stockPerc = this.stockPercentage;
    return `conic-gradient(#1337ec 0% ${stockPerc}%, #3b3f54 ${stockPerc}% 100%)`;
  }

  loadPortfolio(): void {
    this.loading = true;
    this.portfolioService.getPortfolio().subscribe({
      next: (res) => {
        this.portfolioData = res.holdings;
        this.cashBalance = res.balance;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
  // clicking sell button
  openSellModal(holding: PortfolioHolding): void{
    this.selectedHolding = holding;
    this.tradeMode = 'sell';
    this.showTradeModal = true;
  }
  //renew the portfolio after complete
  onTradeComplete(): void{
    this.loadPortfolio()
  }
}
