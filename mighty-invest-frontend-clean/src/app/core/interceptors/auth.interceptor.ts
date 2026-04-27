import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Interceptors are functions that allow you to intercept and modify HTTP requests and responses.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Döngüyü kırmak için ağır olan AuthService yerine hafif olan TokenService'i inject ediyoruz.
    const tokenService = inject(TokenService);
    const token = tokenService.getToken();
    const router = inject(Router);
    const injector = inject(Injector); // Lazy loading için injector

    const handleUnauthorized = (err: any) => {
        console.warn('Interceptor hatayı yakaladı, fırlatıyor:', err.status);

        if (err.status === 401 && !req.url.includes('/login') && !req.url.includes('/register') && !req.url.includes('/logout')) {
            // AuthService'i sadece ihtiyaç duyduğumuzda (401 durumunda) inject ediyoruz.
            const authService = injector.get(AuthService);
            authService.logout();
            router.navigate(['/login']);
        }
        return throwError(() => err);
    };

    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            }
        });
        return next(authReq).pipe(catchError(handleUnauthorized));
    }

    return next(req).pipe(catchError(handleUnauthorized));
}