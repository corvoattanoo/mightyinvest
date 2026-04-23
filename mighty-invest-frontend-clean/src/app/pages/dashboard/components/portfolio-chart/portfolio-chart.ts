import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { createChart, IChartApi, ISeriesApi, AreaSeries } from 'lightweight-charts';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-portfolio-chart',
    standalone: true,
    imports: [CommonModule],
        template: `<div #chartContainer style="width: 100%; height: 400px;"></div>`,
})
export class PortfolioChartComponent implements AfterViewInit, OnDestroy {
    @ViewChild('chartContainer') chartContainer!: ElementRef;
    
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
    this.portfolioService.getPerformanceHistory()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (data) => {
                console.log('Portfolio Chart Data:', data);
                if (data && data.length > 0) {
                    this.areaSeries?.setData(data);
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

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.chart) this.chart.remove();
    }
}