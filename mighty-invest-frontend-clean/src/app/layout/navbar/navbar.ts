import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Observable, takeUntil } from 'rxjs';
import { User } from '../../models/auth.model';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { Stock } from '../../models/stock.model';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnDestroy {
  currentUser$: Observable<User | null>;
  searchTerm: string = '';
  searchResult: Stock[] = [];
  marketStatus: {isOpen: boolean, session: string | null} = {isOpen:false, session:null};
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService,private stockService: StockService,private cdRef: ChangeDetectorRef  
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
          this.cdRef.detectChanges();
        }
      )

    this.fetchMarketStatus();
  }

  fetchMarketStatus(){
    this.stockService.getMarketStatus().pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.marketStatus = status;
        this.cdRef.detectChanges;
      });
  }
  
  onSearch(){
    this.searchSubject.next(this.searchTerm);
  }

  onSelectStock(stock: Stock){
    this.stockService.selectStock(stock);
    this.searchTerm = ''; // arama kutusunu temizle
    this.searchResult = []; //arama listesini kapat
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
