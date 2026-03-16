import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Stock, StockHistory } from '../models/stock.model';

@Injectable({
    providedIn: 'root',
})
export class StockService {
    private apiUrl = '/api';
    private selectedStockSubject = new BehaviorSubject<Stock | null>(null);
    public selectedStock$ = this.selectedStockSubject.asObservable();

    constructor(private http: HttpClient) { }

    getCandles(symbol: string, range: string = '1M'): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/stocks/candles/${symbol}?range=${range}`);
    }

    getStockQuote(symbol: string){
        return this.http.get<Stock>(`${this.apiUrl}/stocks/quote/${symbol}`);
    }

    selectStock(stock: Stock) {
        this.selectedStockSubject.next(stock);
    }

    getStocks(symbol?: string): Observable<Stock[]> {
        let params = new HttpParams();
        if (symbol) {
            params = params.set('symbol', symbol);
        }
        return this.http.get<Stock[]>(`${this.apiUrl}/stocks`, { params });
    }

    getStockHistory(stockId: number): Observable<StockHistory[]> {
        return this.http.get<StockHistory[]>(`${this.apiUrl}/stocks/${stockId}/history`);
    }

    searchStocks(query: string): Observable<Stock[]> {
        return this.http.get<Stock[]>(`${this.apiUrl}/stocks/search?q=${query}`);
    }
    getWatchlist(): Observable<Stock[]> {
        return this.http.get<Stock[]>(`${this.apiUrl}/watchlist`);
    }

    addToWatchlist(stockId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/watchlist`, { stock_id: stockId });
    }

    removeFromWatchlist(stockId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/watchlist/${stockId}`);
    }
}
