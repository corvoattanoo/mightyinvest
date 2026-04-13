import { CommonModule,  } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsArticle, NewsService } from '../../core/services/news.service';

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
  constructor(private newsService: NewsService, private cdRef: ChangeDetectorRef){}

  ngOnInit(): void {
    this.fetchNews(this.selectedCategory);
  }

  fetchNews(category:string ): void{
    this.loading = true;
    this.selectedCategory = category;
    this.newsService.getMarketNews(category).subscribe({
      next: (data) => {
        this.newsArticle = Array.isArray(data) ? data: [];
        console.log('news loaded',data )
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
}

