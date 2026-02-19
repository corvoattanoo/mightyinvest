import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../models/auth.model';

@Injectable({
    providedIn: 'root', //auth.service i uygulama genleinde kullanmayi saglar
})
export class AuthService {
    private apiUrl = 'http://127.0.0.1:8000/api';
    private readonly TOKEN_KEY = 'auth_token';
    private isBrowser: boolean;

    private currentUserSubject = new BehaviorSubject<User | null>(null);//Uygulama içinde "aktif kullanıcı kim?" bilgisini reaktif tutar.
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) platformId: object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        // Restore user state from localStorage on app start (browser only)
        if (this.isBrowser && this.getToken()) {
            this.fetchCurrentUser().subscribe();
        }
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((response) => this.handleAuthSuccess(response))
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
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
            tap((response) => this.currentUserSubject.next(response.user))
        );
    }

    getToken(): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    private handleAuthSuccess(response: AuthResponse): void {
        if (this.isBrowser) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
        }
        this.currentUserSubject.next(response.user);
    }

    private clearSession(): void {
        if (this.isBrowser) {
            localStorage.removeItem(this.TOKEN_KEY);
        }
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}
