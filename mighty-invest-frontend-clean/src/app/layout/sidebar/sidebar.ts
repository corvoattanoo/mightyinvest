import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PricingModalComponent } from '../../shared/pricing-modal/pricing-modal';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, PricingModalComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit, OnDestroy {

  isMarketsPage = false;
  showPricingModal = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(private Router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // sayfa ilk yuklendiginde kontrol et
    this.checkRoute(this.Router.url);

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  checkRoute(url: string){
    this.isMarketsPage = url.includes('/markets');
  }

  get isPremium(): boolean {
    return !!this.currentUser?.is_premium;
  }

  openPricingModal(){
    this.showPricingModal = true;
  }

  closePricingModal(){
    this.showPricingModal = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
