import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { createChart, IChartApi, ISeriesApi, AreaSeries } from 'lightweight-charts';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-portfolio-chart',
    standalone: true,
    imports: [CommonModule],
        template: `
    <div class="chart-header" style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 20px;">
        
        <div class="chart-controls" style="display: flex; gap: 4px; background: rgba(30, 41, 59, 0.5); padding: 4px; border-radius: 8px;">
            <button (click)="setRange('1D')" 
                [style.background]="currentRange === '1D' ? '#3b82f6' : 'transparent'" 
                style="color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s ease;">1D</button>
            <button (click)="setRange('1W')" 
                [style.background]="currentRange === '1W' ? '#3b82f6' : 'transparent'" 
                style="color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s ease;">1W</button>
            <button (click)="setRange('1M')" 
                [style.background]="currentRange === '1M' ? '#3b82f6' : 'transparent'" 
                style="color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s ease;">1M</button>
            <button (click)="setRange('ALL')" 
                [style.background]="currentRange === 'ALL' ? '#3b82f6' : 'transparent'" 
                style="color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s ease;">ALL</button>
        </div>
    </div>
    <div #chartContainer style="width: 100%; height: 400px;"></div>
`,
})
export class PortfolioChartComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chartContainer') chartContainer!: ElementRef;
    
    currentRange: string = '1W';
    private chart: IChartApi | null = null;
    private areaSeries: ISeriesApi<'Area'> | null = null;
    private destroy$ = new Subject<void>();
    private isBrowser: boolean;

    constructor(
        private portfolioService: PortfolioService,
        @Inject(PLATFORM_ID) platformId: any
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            this.initChart();
            this.loadData();
        }
    }

    private initChart() {
        this.chart = createChart(this.chartContainer.nativeElement, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
                horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
            },
            rightPriceScale: {
                borderVisible: false,
            },
        });

        this.areaSeries = this.chart.addSeries(AreaSeries, {
            lineColor: '#3b82f6', // Mavi çizgi
            topColor: 'rgba(59, 130, 246, 0.4)', // Mavi gölge başı
            bottomColor: 'rgba(59, 130, 246, 0.0)', // Mavi gölge sonu
            lineWidth: 2,
        });

        // Responsive resize
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !this.chart) return;
            const newRect = entries[0].contentRect;
            this.chart.applyOptions({ width: newRect.width });
        });
        resizeObserver.observe(this.chartContainer.nativeElement);
    }

    private loadData() {
    this.portfolioService.getPerformanceHistory(this.currentRange)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (data) => {
                if (data && data.length > 0) {

                    const filteredData = data.filter((item, index) => {
                        if(index === 0) return true;
                        return item.value !== data[index-1].value;
                    });
                    this.areaSeries?.setData(filteredData);
                    this.chart?.timeScale().fitContent();
                } else {
                    console.warn('Portfolio chart: Veri boş geldi');
                }
            },
            error: (err) => {
                console.error('Portfolio chart API hatası:', err);
            }
        });
}

setRange(range: string) {
    this.currentRange = range;
    this.loadData();
}

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.chart) this.chart.remove();
    }
}