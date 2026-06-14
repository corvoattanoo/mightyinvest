import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingService } from '../../services/pricing.service';

@Component({
  selector: 'app-pricing-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing-modal.html',
  styleUrl: './pricing-modal.css',
})
export class PricingModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  loadingPlan: 'monthly' | 'yearly' | null = null;
  errorMessage: string | null = null;

  constructor(private pricingService: PricingService) {}

  closeModal() {
    this.closed.emit();
  }

  selectPlan(plan: 'monthly' | 'yearly') {
    this.loadingPlan = plan;
    this.errorMessage = null;

    this.pricingService.getCheckoutUrl(plan).subscribe({
      next: (response) => {
        if (response && response.checkout_url) {
          window.open(response.checkout_url, '_blank');
        } else {
          this.errorMessage = 'Could not generate checkout session. Please try again.';
          this.loadingPlan = null;
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Something went wrong. Please check your connection and try again.';
        this.loadingPlan = null;
      }
    });
  }
}
