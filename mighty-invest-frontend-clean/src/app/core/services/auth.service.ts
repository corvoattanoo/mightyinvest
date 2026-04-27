import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../models/auth.model';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root', //auth.service i uygulama genleinde kullanmayi saglar
})
export class AuthService {
    private apiUrl = '/api';

    private currentUserSubject = new BehaviorSubject<User | null>(null);//Uygulama içinde "aktif kullanıcı kim?" bilgisini reaktif tutar.
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
        private tokenService: TokenService
    ) {
        //test comment
        // Uygulama başlarken TokenService'den mevcut kullanıcıyı alıyoruz
        const user = this.tokenService.getUser();
        if (user) {
            this.currentUserSubject.next(user);
            // Bilgileri güncel tutmak için API'den tazeleme yapıyoruz
            if (this.tokenService.getToken()) {
                this.fetchCurrentUser().subscribe({
                    error: () => this.clearSession()
                });
            }
        }
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((response) => {
                if (!response.requires_otp) {
                    this.handleAuthSuccess(response);
                }
            })
        );
    }

    verifyOtp(email: string, code: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/verify-otp`, { email, code }).pipe(
            tap((response) => this.handleAuthSuccess(response))
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap((response) => this.handleAuthSuccess(response))
        );
    }

    loginAsGuest(): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/demo`, {}).pipe(
            tap((response) => this.handleAuthSuccess(response))
        );
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
            complete: () => this.clearSession(),
            error: () => this.clearSession(),
        });
    }

    fetchCurrentUser(): Observable<{ user: User }> {
        return this.http.get<{ user: User }>(`${this.apiUrl}/user`).pipe(
            tap((response) => {
                this.currentUserSubject.next(response.user);
                this.tokenService.setUser(response.user);
            })
        );
    }

    getToken(): string | null {
        return this.tokenService.getToken();
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    private handleAuthSuccess(response: AuthResponse): void {
        if (response.token && response.user) {
            this.tokenService.setToken(response.token);
            this.tokenService.setUser(response.user);
            this.currentUserSubject.next(response.user);
        }
    }

    private clearSession(): void {
        this.tokenService.clear();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}
