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
}