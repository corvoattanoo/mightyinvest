import { Component, EventEmitter, Input, Output } from '@angular/core';
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

    constructor(private stockService: StockService){
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(query => query ? this.stockService.searchStocks(query): of([]))
        ).subscribe(results => this.searchResult = results);
    }

    onSearchType(){
        this.searchSubject.next(this.searchTerm);
    }

    selectSearchType(stock: Stock){
        this.stockService.addToWatchlist(stock.id).subscribe(() => {
            this.stocks.push(stock);
            this.searchTerm = '';
            this.searchResult = [];
        });
    }

    addStock() {
        if (!this.searchTerm.trim()) return;

        this.add.emit(this.searchTerm);
        this.searchTerm = '';
    }


}
