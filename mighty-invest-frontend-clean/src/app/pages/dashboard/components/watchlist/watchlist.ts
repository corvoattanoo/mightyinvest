import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stock } from '../../../../models/stock.model';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { StockService } from '../../../../services/stock.service';

@Component({
    selector: 'app-watchlist',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './watchlist.html',
    styleUrl: './watchlist.css',
})
export class WatchlistComponent {
    @Input() title: string = '';
    @Input() stocks: Stock[] = [];

    @Output() add = new EventEmitter<string>();

    searchTerm: string = '';
    searchResult: Stock[] = [];
    private searchSubject = new Subject<string>();

    constructor(private stockService: StockService, private cdRef: ChangeDetectorRef) {
        this.searchSubject.pipe(
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
        this.stockService.addToWatchlist(stock.id).subscribe(() => {
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
            this.stockService.removeFromWatchlist(stockId).subscribe({
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


}
