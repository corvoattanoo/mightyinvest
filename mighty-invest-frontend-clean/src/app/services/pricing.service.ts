import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PricingService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getCheckoutUrl(plan: 'monthly' | 'yearly'): Observable<{ checkout_url: string }> {
    return this.http.post<{ checkout_url: string }>(`${this.apiUrl}/subscription/checkout`, { plan });
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/subscription/status`);
  }
}
