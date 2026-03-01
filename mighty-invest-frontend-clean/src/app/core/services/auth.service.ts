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
    private USER_KEY = 'auth_user';

    private currentUserSubject = new BehaviorSubject<User | null>(null);//Uygulama içinde "aktif kullanıcı kim?" bilgisini reaktif tutar.
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) platformId: object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        if (this.isBrowser) {
            // Restore token and user state from localStorage on app start
            const token = localStorage.getItem(this.TOKEN_KEY);
            const userJson = localStorage.getItem(this.USER_KEY);

            if (token && userJson) {
                try {
                    const user = JSON.parse(userJson);
                    this.currentUserSubject.next(user);
                    // Fetch fresh data from API in background to ensure sync
                    this.fetchCurrentUser().subscribe();
                } catch (error) {
                    console.error('Error parsing stored user', error);
                    this.clearSession();
                }
            }
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
            tap((response) => {
                this.currentUserSubject.next(response.user);
                // Update stored user too
                if (this.isBrowser) {
                    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
                }
            })
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
            // localStorage sadece string saklayabilir, bu yüzden objeyi string'e çeviriyoruz
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        }
        this.currentUserSubject.next(response.user);
    }

    private clearSession(): void {
        if (this.isBrowser) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        }
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}
