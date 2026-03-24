import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PortfolioResponse {
  holdings: PortfolioHolding[];
  balance: number;
}

export interface PortfolioHolding{
  id: number;
  stock_id: number;
  quantity: number;
  average_price: number;
  current_value: number;     // Backend'de appends ile hesaplanıyor
  profit: number;            // Backend'de appends ile hesaplanıyor
  profit_percentage: number; // Backend'de appends ile hesaplanıyor
  stock: {
    id: number;
    symbol: string;
    name: string;
    price: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {

  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  /**
   * Portfolio verisini çek
   * Backend response: { holdings: [...], balance: number }
   *
   * Backend'deki Portfolio modeline dikkat et:
   *   protected $appends = ['current_value', 'profit', 'profit_percentage'];
   * Bu accessor'lar otomatik olarak JSON'a ekleniyor!
   */

  getPortfolio(): Observable<any> {
    return this.http.get(`${this.apiUrl}/portfolio`)
  }
}
