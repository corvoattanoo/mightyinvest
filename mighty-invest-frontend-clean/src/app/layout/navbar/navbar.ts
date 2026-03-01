import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(){
    this.authService.logout();
  }
  // {
  //   this.currentUser$ = this.authService.currentUser$;
  // }

  // logout() {
  //   this.authService.logout();
  // }
}
