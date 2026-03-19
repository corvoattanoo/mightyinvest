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
export const routes: Routes = [
    // 1. Boş gelirse login'e yönlendir (En üstte olması iyidir)
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // 2. GUEST (Ziyaretçi) Rotaları - AuthLayout kullanır
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent }
        ]
    },

    // 3. MEMBER (Üye) Rotaları - MainLayout kullanır
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            {path : 'news', component: NewsComponent},
            {path: 'portfolio', component: PortfolioComponent},
            {path: 'markets', component: MarketsComponent}
            // Gelecekte portfolio buraya gelecek
        ]
    },

    // 4. WILDCARD (Joker) Rota - HER ZAMAN EN SONDA OLMALI!
    { path: '**', redirectTo: 'login' },
];
