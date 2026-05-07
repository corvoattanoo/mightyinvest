import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { takeUntil, Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent implements OnInit, AfterViewInit {
  tickerStocks: any[] = [];

  sentimentValue: number = 65; // Default
  sentimentLabel: string = 'GREED';
  sentimentOffset: number = 251 * (1 - (65 / 100)); // Default offset

  private destroy$ = new Subject<void>();
  constructor(
    private router: Router, 
    private stockService: StockService, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.calculateSentiment(); // Calculate for initial manual data

    this.stockService.getTickerStocks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('LANDING TICKER DATA RECEIVED:', data); // <--- BURASI
        if (data && data.length > 0) {
          this.tickerStocks = data;
          this.calculateSentiment();
          this.cdr.detectChanges();
        }
      });
  }

  calculateSentiment(): void {
    if (this.tickerStocks.length === 0) return;

    const avgChange = this.tickerStocks.reduce((acc, stock) => acc + (stock.percent_change || 0), 0) / this.tickerStocks.length;

    // Map -3% to +3% range to 0-100 scale
    // (avg + 3) / 6 * 100
    let value = Math.round(((avgChange + 3) / 6) * 100);
    this.sentimentValue = Math.min(Math.max(value, 0), 100);

    if (this.sentimentValue < 20) this.sentimentLabel = 'EXTREME FEAR';
    else if (this.sentimentValue < 40) this.sentimentLabel = 'FEAR';
    else if (this.sentimentValue < 60) this.sentimentLabel = 'NEUTRAL';
    else if (this.sentimentValue < 85) this.sentimentLabel = 'GREED';
    else this.sentimentLabel = 'EXTREME GREED';

    this.sentimentOffset = 251 * (1 - (this.sentimentValue / 100));
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  scrollTo(section: string): void {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  tryDemo(): void {
    // RECRUITER MODE: This will trigger a one-click guest login
    // to bypass the login form and show the app's power immediately.
    this.authService.loginAsGuest().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Demo login failed', err);
        this.router.navigate(['/dashboard']);
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
