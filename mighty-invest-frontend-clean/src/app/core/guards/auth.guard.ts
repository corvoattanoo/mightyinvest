import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


// A Guard is a piece of logic that runs before a route is activated. In 
// auth.guard.ts, we check if the user is logged in. If not, they are kicked back to the login page.

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if(authService.isLoggedIn()){
        return true;
    }else{
        // router.navigate(['/login']);
        // return false;
        return router.createUrlTree(['/login']); // daha garanti
    }
}