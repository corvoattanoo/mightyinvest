import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-trade-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './trade-modal.css',
  template: `
    <!-- Backdrop: Modal dışına tıklayınca kapansın -->
    <div class="modal-backdrop" (click)="close.emit()" *ngIf="visible">
      <!-- Modal içeriği: event.stopPropagation() ile iç tıklamalar backdrop'a gitmesin -->
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>{{ mode === 'buy' ? '📈 Hisse Satın Al' : '📉 Hisse Sat' }}</h2>
        <p class="stock-name">{{ stockSymbol }} — {{ stockName }}</p>
        <!-- Miktar girişi -->
        <label>Miktar (Adet)</label>
        <input type="number" [(ngModel)]="quantity" min="1" placeholder="Kaç adet?">
        <!-- Anlık fiyat (API'den gelen) -->
        <p class="price-info">
          Birim Fiyat: <strong>{{ currentPrice | currency }}</strong>
        </p>
        <!-- Toplam maliyet hesabı -->
        <p class="total">
          Toplam: <strong>{{ quantity * currentPrice | currency }}</strong>
        </p>
        <!-- Hata mesajı -->
        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <!-- Aksiyon butonları -->
        <div class="actions">
          <button class="btn-cancel" (click)="close.emit()">İptal</button>
          <button
            class="btn-confirm"
            [class.buy]="mode === 'buy'"
            [class.sell]="mode === 'sell'"
            (click)="onConfirm()"
            [disabled]="loading">
            {{ loading ? 'İşleniyor...' : (mode === 'buy' ? 'Satın Al' : 'Sat') }}
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
    private cdRef: ChangeDetectorRef
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