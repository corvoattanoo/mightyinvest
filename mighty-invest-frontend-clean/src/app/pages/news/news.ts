import { CommonModule, } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsArticle, NewsService, SocialSentiment } from '../../core/services/news.service';


@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class NewsComponent implements OnInit {
  newsArticle: NewsArticle[] = [];
  loading: boolean = true;
  selectedCategory: string = 'general';
  calendarEvents: any[] = [];
  socialSentiments: SocialSentiment[] = [];
  constructor(private newsService: NewsService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.fetchNews(this.selectedCategory);
    this.fetchCalendarEvents();
    this.fetchSocialSentiments();
  }

  fetchNews(category: string): void {
    this.loading = true;
    this.selectedCategory = category;
    this.newsService.getMarketNews(category).subscribe({
      next: (data) => {
        this.newsArticle = Array.isArray(data) ? data : [];
        console.log('news loaded', data)
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.log('couldnt load the news', err)
        this.cdRef.detectChanges();
      }
    });
  }

  fetchCalendarEvents() {
    this.newsService.getEconomicCalendar()
      .subscribe({
        next: (events) => {
          const safeEvents = Array.isArray(events) ? events : [];
          this.calendarEvents = safeEvents
            .filter(event => event.country === 'US')
            .slice(0, 6);
          this.cdRef.detectChanges();
        },
        error: (err) => {
          console.log('error fetching calendar events', err);
        }
      })
  }

  fetchSocialSentiments() {
    this.newsService.getSocialSentiments().subscribe({
      next: (data) => {
        this.socialSentiments = Array.isArray(data) ? data : [];
        this.cdRef.detectChanges();
      },
      error: (err) => console.log('Error loading sentiment', err)
    });
  }


}

