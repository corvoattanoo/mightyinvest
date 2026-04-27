import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    loginForm: FormGroup;
    otpForm: FormGroup;

    isLoading = signal(false);
    errorMessage = signal('');
    currentStep = signal<'credentials' | 'otp'>('credentials');
    userEmail = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
        });

        this.otpForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        });
    }

    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }
    get otpCode() { return this.otpForm.get('code'); }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        this.authService.login(this.loginForm.value)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res) => {
                    if (res.requires_otp) {
                        this.userEmail = this.loginForm.value.email;
                        this.currentStep.set('otp');
                    } else {
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(err.error?.message || 'Invalid email or password.');
                },
            });
    }

    onVerifyOtp(): void {
        if (this.otpForm.invalid) return;

        this.isLoading.set(true);
        this.errorMessage.set('');

        const code = this.otpForm.value.code;
        this.authService.verifyOtp(this.userEmail, code)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    this.errorMessage.set(err.error?.message || 'Invalid or expired OTP.');
                }
            });
    }

    backToLogin(): void {
        this.currentStep.set('credentials');
        this.errorMessage.set('');
    }
}
