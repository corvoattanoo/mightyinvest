import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stock } from '../../../../models/stock.model';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap, takeUntil } from 'rxjs';
import { StockService } from '../../../../services/stock.service';

@Component({
    selector: 'app-watchlist',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './watchlist.html',
    styleUrl: './watchlist.css',
})
export class WatchlistComponent implements OnDestroy {
    @Input() title: string = '';
    @Input() stocks: Stock[] = [];

    @Output() add = new EventEmitter<string>();

    searchTerm: string = '';
    searchResult: Stock[] = [];
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(private stockService: StockService, private cdRef: ChangeDetectorRef) {
        this.searchSubject.pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(query => query ? this.stockService.searchStocks(query) : of([]))
        ).subscribe(
            results => {
                this.searchResult = results;
                this.cdRef.detectChanges();
            });
    }
    onSelectStock(stock: Stock){
        this.stockService.selectStock(stock);
    }

    onSearchType() {
        this.searchSubject.next(this.searchTerm);
    }

    selectSearchType(stock: Stock) {
        this.stockService.addToWatchlist(stock.id).pipe(takeUntil(this.destroy$))
        .subscribe(() => {
            this.stocks.push(stock);
            this.searchTerm = '';
            this.searchResult = [];
            this.cdRef.detectChanges();
        });
    }

    addStock() {
        if (!this.searchTerm.trim()) return;

        this.add.emit(this.searchTerm);
        this.searchTerm = '';
    }

    removeStock(event: Event, stockId: number) {
        event.stopPropagation();// tiklamanin yukari sicramasini engelledik

        if (confirm('You want to remove this stock from watchlist?')) {
            this.stockService.removeFromWatchlist(stockId).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    console.log('Stock is deleted'),
                        this.stocks = this.stocks.filter(s => s.id !== stockId);
                    console.log('Stock is deleted from UI and Backend');
                    this.cdRef.detectChanges();
                },
                error: (e) => { console.log('Deletion is interupted', e) }
            });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


}
