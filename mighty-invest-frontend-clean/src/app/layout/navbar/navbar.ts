import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Observable, takeUntil } from 'rxjs';
import { User } from '../../models/auth.model';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { Stock } from '../../models/stock.model';
import { StockService } from '../../services/stock.service';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  searchTerm: string = '';
  searchResult: Stock[] = [];
  marketStatus: { isOpen: boolean, session: string | null } = { isOpen: false, session: null };
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService,
    private stockService: StockService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => query ? this.stockService.searchStocks(query) : of([]))
    ).pipe(takeUntil(this.destroy$))
      .subscribe(
        result => {
          this.searchResult = result;
          this.cdRef.markForCheck();
        }
      )
  }

  notifications: Notification[] = [];
  showNotifications = false;
  unreadCount = 0;

  ngOnInit(): void {
    this.fetchMarketStatus();

    //notification history
    this.notificationService.history$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.length;
    })
  }

  toggleNotification() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.unreadCount = 0;
    }
  }

  markAllAsRead(){
    this.unreadCount = 0;
  }

  fetchMarketStatus() {
    this.stockService.getMarketStatus().pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.marketStatus = status;
        this.cdRef.detectChanges();
      });
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  onSelectStock(stock: Stock) {
    this.stockService.selectStock(stock);
    this.searchTerm = ''; // arama kutusunu temizle
    this.searchResult = []; //arama listesini kapat
    this.router.navigate(['/dashboard']);
  }

  isGuest(user: User | null): boolean {
    return user?.email === 'guest@mightyinvest.com';
  }

  logout() {
    this.authService.logout();
  }

  goToRegister() {
    this.authService.logout(); // Logout guest first then go to register
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
