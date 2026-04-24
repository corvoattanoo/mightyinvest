import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioHolding, PortfolioService } from '../../core/services/portfolio.service';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal';
import { StockChartComponent } from '../dashboard/components/stock-chart/stock-chart';
import { PortfolioChartComponent } from '../dashboard/components/portfolio-chart/portfolio-chart';
import {
  AllocationChartComponent,
  AllocationSlice,
} from './components/allocation-chart/allocation-chart';

/** Theme-matching palette for allocation segments */
const SLICE_COLORS = [
  '#1337ec', // primary blue
  '#8b5cf6', // accent purple
  '#06b6d4', // electric cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    TradeModalComponent,
    StockChartComponent,
    PortfolioChartComponent,
    AllocationChartComponent,
  ],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class PortfolioComponent implements OnInit {
  portfolioData: PortfolioHolding[] = [];
  selectedHolding: PortfolioHolding | null = null;
  showChartView: boolean = false;
  cashBalance: number = 0;
  loading: boolean = true;
  errorMessage: string = '';

  // trade modal state
  showTradeModal = false;
  tradeMode: 'buy' | 'sell' = 'buy';

  // allocation chart slices (computed)
  allocationSlices: AllocationSlice[] = [];

  get totalStockValue(): number {
    return this.portfolioData.reduce((sum, item) => sum + (item.current_value || 0), 0);
  }

  get totalProfit(): number {
    return this.portfolioData.reduce((sum, item) => sum + (item.profit || 0), 0);
  }

  get totalNetWorth(): number {
    return this.totalStockValue + this.cashBalance;
  }

  get stockPercentage(): number {
    if (this.totalNetWorth === 0) return 0;
    return (this.totalStockValue / this.totalNetWorth) * 100;
  }

  constructor(
    private portfolioService: PortfolioService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.loading = true;
    this.errorMessage = '';

    this.portfolioService.getPortfolio().subscribe({
      next: (res) => {
        this.portfolioData = res.holdings;
        this.cashBalance = parseFloat(String(res.balance));
        this.loading = false;
        this.buildAllocationSlices();
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Portfolio is not loading.';
        this.cdRef.detectChanges();
        console.error('Portfolio load error:', err);
      },
    });
  }

  private buildAllocationSlices(): void {
    const slices: AllocationSlice[] = this.portfolioData.map((h, i) => ({
      label: h.stock.symbol,
      value: h.current_value || 0,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }));

    // Add cash slice last
    if (this.cashBalance > 0) {
      slices.push({
        label: 'CASH',
        value: this.cashBalance,
        color: '#3b4a6b',
      });
    }

    this.allocationSlices = slices;
  }

  openSellModal(holding: PortfolioHolding): void {
    this.selectedHolding = holding;
    this.tradeMode = 'sell';
    this.showTradeModal = true;
  }

  selectHoldingForChart(holding: PortfolioHolding): void {
    this.selectedHolding = holding;
    this.showChartView = true;
  }

  backPositions(): void {
    this.showChartView = false;
    this.selectedHolding = null;
  }

  onTradeComplete(): void {
    this.loadPortfolio();
  }
}

