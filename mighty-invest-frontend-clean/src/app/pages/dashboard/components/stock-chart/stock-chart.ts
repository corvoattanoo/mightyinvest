import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { StockService } from '../../../../services/stock.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-stock-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stock-chart.html',
    styleUrl: './stock-chart.css',
})
export class StockChartComponent implements AfterViewInit, OnChanges, OnDestroy {
    // HTML'deki #chartContainer div'ine erişmek için
    @ViewChild('chartContainer') chartContainer!: ElementRef;
    //dashboard hangi jissenin secildigini alacak
    @Input() symbol: string | undefined;

    private chart: IChartApi | null = null;
    private candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
    private destroy$ = new Subject<void>();
    currentRange: string = '1D'; // Varsayılan zaman aralıgı

    private isBrowser: boolean;

    constructor(
        private stockService: StockService,
        @Inject(PLATFORM_ID) platformId: any
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            this.initChart();
        }
    }

    private initChart() {
        if (!this.chartContainer) return;
        //grafigi olusturma

        this.chart = createChart(this.chartContainer.nativeElement, {
            layout: {
                background: { color: 'transparent' }, // Dashboard arka planına uysun
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
                horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });
        //mum grafik serisi ekleme
        this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        })
        const resizeObserver = new ResizeObserver(entries => { //thanks to AI :D resizes the chart throu the size
            if (entries.length === 0 || !this.chart) return;
            const newRect = entries[0].contentRect;
            this.chart.applyOptions({ width: newRect.width, height: newRect.height });
        });
        resizeObserver.observe(this.chartContainer.nativeElement);
    }

    //: Veriyi Yükleme ve Map'leme (Load & Map Data)
    private loadData() {
        if (!this.symbol || !this.candlestickSeries) return;

        this.stockService.getCandles(this.symbol, this.currentRange).pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                console.log(`${this.symbol} için Grafik Verileri (${this.currentRange}):`, data);
                if (data && data.length > 0) {
                    //laravel verisini charta ceviriyor
                    const chartData: CandlestickData[] = data.map(d => ({
                        time: d.time as any,
                        open: d.open,
                        high: d.high,
                        low: d.low,
                        close: d.close,
                    }));

                    this.candlestickSeries?.setData(chartData);
                    this.chart?.timeScale().fitContent(); // grafigi ekrana sigdirma
                }
            });
    }

    setRange(range: string) {
        this.currentRange = range;
        this.loadData();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['symbol'] && this.symbol) {
            this.loadData();
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.chart) {
            this.chart.remove();
        }
    }

}
