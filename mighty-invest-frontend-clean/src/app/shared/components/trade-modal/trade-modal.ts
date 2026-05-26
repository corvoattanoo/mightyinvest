import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-trade-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './trade-modal.css',
  template: `
    <!-- Backdrop: closes when clicking outside the modal -->
<div class="modal-backdrop" (click)="close.emit()" *ngIf="visible">
  <!-- Modal content: stopPropagation prevents inner clicks from reaching backdrop -->
  <div class="modal-content" (click)="$event.stopPropagation()">
    <h2>{{ mode === 'buy' ? '📈 Buy Stock' : '📉 Sell Stock' }}</h2>
    <p class="stock-name">{{ stockSymbol }} — {{ stockName }}</p>
    <!-- Quantity input -->
    <label>Quantity (Shares)</label>
    <input type="number" [(ngModel)]="quantity" min="1" placeholder="How many shares?">
    <!-- Current price (from API) -->
    <p class="price-info">
      Unit Price: <strong>{{ currentPrice | currency }}</strong>
    </p>
    <!-- Total cost calculation -->
    <p class="total">
      Total: <strong>{{ quantity * currentPrice | currency }}</strong>
    </p>
    <!-- Error message -->
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    <!-- Action buttons -->
    <div class="actions">
      <button class="btn-cancel" (click)="close.emit()">Cancel</button>
      <button
        class="btn-confirm"
        [class.buy]="mode === 'buy'"
        [class.sell]="mode === 'sell'"
        (click)="onConfirm()"
        [disabled]="loading">
        {{ loading ? 'Processing...' : (mode === 'buy' ? 'Buy' : 'Sell') }}
      </button>
    </div>
  </div>
</div>`
})

export class TradeModalComponent {
  //@Input() ile parent componentten veri alinir

  @Input() visible = false;
  @Input() mode: 'buy' | 'sell' = 'buy';
  @Input() stockId?: number;
  @Input() stockSymbol = '';
  @Input() stockName = '';
  @Input() currentPrice = 0;

  //@Output() ile parent a event gonderme

  @Output() close = new EventEmitter<void>();
  @Output() tradeComplete = new EventEmitter<void>();

  quantity = 1;
  loading = false;
  errorMessage = '';

  constructor(
    private transactionService: TransactionService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) { }

  onConfirm() {
    if (this.mode === 'sell' && !this.stockId) {
      this.errorMessage = 'İşlem hatası: Hisse ID bulunamadı.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // DEBUG: See what is being sent to API
    console.log('[TradeModal] Payload:', {
      stockId: this.stockId,
      symbol: this.stockSymbol,
      name: this.stockName,
      quantity: this.quantity,
      currentPrice: this.currentPrice,
    });

    // calls service up to the mode 
    let action$;
    if (this.mode === 'buy') {
      action$ = this.transactionService.buy(this.stockId, this.quantity, this.currentPrice, this.stockSymbol, this.stockName);
    } else {
      action$ = this.transactionService.sell(this.stockId, this.quantity, this.currentPrice);
    }

    action$.subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.show({
          type: this.mode === 'buy' ? 'buy': 'sell',
          title: this.mode === 'buy' ? 'order Excecuted' : 'sell Order Filled',
          message: `${this.mode === 'buy' ? 'bought' : 'Sold'} ${this.quantity} Inits of  ${this.stockSymbol} at $${this.currentPrice}`
        });
        this.tradeComplete.emit();
        this.close.emit();
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Trade Error details:', err);
        // Backend'den gelen hata mesajlarını parsela (error veya message alanı olabilir)
        this.errorMessage = err.error?.error || err.error?.message || 'Transaction failed. Please try again.';
        this.cdRef.detectChanges();
      },
    });

  }



}