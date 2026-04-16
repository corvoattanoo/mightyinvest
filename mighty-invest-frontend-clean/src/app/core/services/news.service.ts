import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface NewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface SocialSentiment {
  ticker: string;
  source: string;
  score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  post_count: number;
  avg_engagement: number;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = '/api/news';

  constructor(private http: HttpClient) { }

  getMarketNews(category: string = 'general'): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(this.apiUrl, {
      params: { category }
    });
  }

  getEconomicCalendar(): Observable<any[]> {
    return this.http.get<any[]>('/api/calendar')
  }

  getSocialSentiments(): Observable<SocialSentiment[]> {
    return this.http.get<SocialSentiment[]>('/api/news/social-sentiments');
  }


}