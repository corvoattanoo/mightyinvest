import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, StockHistory } from '../models/stock.model';

@Injectable({
    providedIn: 'root',
})
export class StockService {
    private apiUrl = 'http://127.0.0.1:8000/api';

    constructor(private http: HttpClient) { }

    getStocks(): Observable<Stock[]> {
        return this.http.get<Stock[]>(`${this.apiUrl}/stocks`);
    }

    getStockHistory(stockId: number): Observable<StockHistory[]> {
        return this.http.get<StockHistory[]>(`${this.apiUrl}/stocks/${stockId}/history`);
    }
}
