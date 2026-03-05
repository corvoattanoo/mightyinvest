import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    // Token İşlemleri
    getToken(): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    setToken(token: string): void {
        if (this.isBrowser) {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    removeToken(): void {
        if (this.isBrowser) {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }

    // Kullanıcı İşlemleri
    getUser(): User | null {
        if (!this.isBrowser) return null;
        const userJson = localStorage.getItem(this.USER_KEY);
        try {
            return userJson ? JSON.parse(userJson) : null;
        } catch (e) {
            console.error('Error parsing stored user', e);
            return null;
        }
    }

    setUser(user: User): void {
        if (this.isBrowser) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    }

    removeUser(): void {
        if (this.isBrowser) {
            localStorage.removeItem(this.USER_KEY);
        }
    }

    // Her şeyi temizle (Logout sırasında kullanılır)
    clear(): void {
        if (this.isBrowser) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        }
    }
}
