import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Interceptors are functions that allow you to intercept and modify HTTP requests and responses.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();
    const router = inject(Router);

    const handleUnauthorized = (err: any) => {
        console.warn('Interceptor hatayı yakaladı, fırlatıyor:', err.status);
        
        if (err.status === 401 && !req.url.includes('/login') && !req.url.includes('/register')) {
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
        // Also catch 401 on authenticated requests (e.g. expired token)
        return next(authReq).pipe(catchError(handleUnauthorized));
    }

    return next(req).pipe(catchError(handleUnauthorized));
}