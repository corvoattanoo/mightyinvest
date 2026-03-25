import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Transaction {
  id: number;
  stock: { symbol: string; name: string; price: number };
  type: 'buy' | 'sell';
  quantity: number;
  purchase_price: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})

export class TransactionService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  buy(stockId: number | undefined, quantity: number, price: number, symbol?: string, name?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/buy`, {
      stock_id: stockId,
      symbol: symbol,
      name: name,
      quantity: quantity,
      purchase_price: price,
    });
  }

  sell(stockId: number | undefined, quantity: number, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sell`, {
      stock_id: stockId,
      quantity: quantity,
      price: price,
    });
  }

  //transaction history recived to the backend
  getHistory(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`)
  }
}




