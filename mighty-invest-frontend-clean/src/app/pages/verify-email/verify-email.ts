import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmailComponent implements OnInit {
  userEmail = signal('');
  isResending = signal(false);
  reSendCooldown = signal(0);
  resendMessage = signal('');

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private http: HttpClient,

  ) {}

  private intervalId: any;



  ngOnInit() {
    const user = this.tokenService.getUser();
    if(user?.email){
      this.userEmail.set(user.email);
    }
  }

  resendEmail(){
    if(this.reSendCooldown() > 0) return;
    this.isResending.set(true);
    this.http.post('/api/email/resend', {}).subscribe({
      next: () => {
        this.isResending.set(false);
        this.resendMessage.set('email sent! Check your inbox');
        this.startCooldown();
      },
      error: () => {
        this.isResending.set(false);
        this.resendMessage.set('Something went wrong. Try again');
      }
    });
  }

  private startCooldown(){
    this.reSendCooldown.set(60);
    this.intervalId = setInterval(() => {
      this.reSendCooldown.update(v => {
        if(v <= 1){
          clearInterval(this.intervalId);
          return 0;
        }
        return v-1;
      });
    }, 1000);
  }

  logout() {
    this.authService.logout();
  }



}
