import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PricingService } from '../../../services/pricing.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-premium-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './success.html',
  styleUrl: './success.css',
})
export class PremiumSuccessComponent implements OnInit, OnDestroy {
  state: 'verifying' | 'success' | 'processing' = 'verifying';
  sessionId: string | null = null;
  private pollSubscription: Subscription | null = null;
  private maxRetries = 15; // 30 seconds total

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pricingService: PricingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'] || null;
    });

    this.startStatusPolling();
  }

  startStatusPolling(): void {
    let attempts = 0;

    this.pollSubscription = interval(2000).subscribe(() => {
      attempts++;

      this.pricingService.getStatus().subscribe({
        next: (status) => {
          // If the backend indicates premium activation has completed
          if (status.is_premium || status.subscribed) {
            this.state = 'success';
            this.stopPolling();
            this.refreshUserSession();
          } else if (attempts >= this.maxRetries) {
            this.state = 'processing';
            this.stopPolling();
            this.refreshUserSession(); // Try one final sync
          }
        },
        error: (err) => {
          console.error('Error checking subscription status:', err);
          if (attempts >= this.maxRetries) {
            this.state = 'processing';
            this.stopPolling();
          }
        }
      });
    });
  }

  refreshUserSession(): void {
    this.authService.fetchCurrentUser().subscribe({
      error: (err) => console.error('Failed to sync updated user status:', err)
    });
  }

  stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
