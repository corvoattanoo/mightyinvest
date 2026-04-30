import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { Component } from '@angular/core';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout';
import { MarketsComponent } from './pages/markets/markets';
import { NewsComponent } from './pages/news/news';
import { PortfolioComponent } from './pages/portfolio/portfolio';
import { LandingComponent } from './pages/landing/landing';
import { VerifyEmailComponent } from './pages/verify-email/verify-email';
export const routes: Routes = [
    // 1. Giriş Sayfası (Landing Page)
    { path: '', component: LandingComponent },

    // 2. GUEST (Ziyaretçi) Rotaları - AuthLayout kullanır
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'verify-email', component: VerifyEmailComponent}
        ]
    },

    // 3. MEMBER (Üye) Rotaları - MainLayout kullanır (BAĞIMSIZ - Şimdilik Market ve News her yere açık)
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'news', component: NewsComponent },
            { path: 'markets', component: MarketsComponent },
        ]
    },

    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'portfolio', component: PortfolioComponent },
        ]
    },

    // 4. WILDCARD (Joker) Rota - HER ZAMAN EN SONDA OLMALI!
    { path: '**', redirectTo: 'login' },
];
