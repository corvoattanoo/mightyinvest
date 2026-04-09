import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';

export interface DashboardStats {
    total_balance: number;
    daily_profit: number;
    open_positions: number;
    cash_balance: number;
    stock_value: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard/stats`;
    
    constructor(private http: HttpClient) {}

    getStats(){
        return this.http.get<DashboardStats>(this.apiUrl);
    }
}