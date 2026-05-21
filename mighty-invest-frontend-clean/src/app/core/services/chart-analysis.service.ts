import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface SupportResistanceLevel {
  price: number;
  strength: 'strong' | 'moderate' | 'weak';
}
export interface ChartPattern {
  name: string;
  description: string;
}
export interface TradePlan {
  entry: number;
  stop_loss: number;
  stop_loss_rationale: string;
  take_profit: number;
}
export interface AnalysisResult {
  trend: 'bullish' | 'bearish' | 'sideways';
  trend_rationale: string;
  support_levels: SupportResistanceLevel[];
  resistance_levels: SupportResistanceLevel[];
  patterns: ChartPattern[];
  trade_plan: TradePlan;
  risk_level: 'low' | 'medium' | 'high';
  summary: string;
  disclaimer: string;
}
export interface ChartAnalysis {
  id: number;
  image_path: string;
  trend: string;
  risk_level: string;
  result: AnalysisResult;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})

export class ChartAnalysisService {
  private apiUrl = '/api';
  constructor(private http: HttpClient) { }

  analyze(file: File): Observable<{ success: boolean; data: ChartAnalysis, remaining?: number }> {
    const formData = new FormData();
    formData.append('chart', file);
    return this.http.post<{ success: boolean; data: ChartAnalysis,remaining?: number }>(
      `${this.apiUrl}/chart/analyze`,
      formData
    );
  }

  getHistory(): Observable<{ success: boolean; data: ChartAnalysis[], remaining?: number }> {
    return this.http.get<{ success: boolean; data: ChartAnalysis[], remaining?: number }>(
      `${this.apiUrl}/chart/history`
    );
  }
}