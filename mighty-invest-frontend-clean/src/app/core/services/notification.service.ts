import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
    id: number;
    type: 'success' | 'info' | 'sentiment' | 'warning' | 'buy' | 'sell';
    title: string;
    message: string;
    timeStamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    // BehaviorSubject sayesinde yeni abone olan bileşenler en son listeyi kaçırmaz
    private notificationsSource = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSource.asObservable();

    private list: Notification[] = [];
    private isPulseStarted = false;
    private shownAlerts = new Set<string>(); // Daha önce gösterilen sinyalleri burada tutuyoruz

    private history: Notification[] = [];
    private historySource = new BehaviorSubject<Notification[]>([]);
    history$ = this.historySource.asObservable();

    // --- Carousel (Döngü) Ayarları ---
    private alertsPool: any[] = [];
    private currentPoolIndex = 0;
    private carouselInterval: any;
    constructor(private http: HttpClient) { }

    show(notif: Omit<Notification, 'id' | 'timeStamp'>) {
        const id = Date.now();
        const newNotif: Notification = {
            ...notif,
            id,
            timeStamp: new Date()
        };
        this.list = [newNotif];
        this.notificationsSource.next([...this.list]);
        //history 
        this.history = [newNotif, ...this.history].slice(0, 15); //son 15 bildirim
        this.historySource.next([...this.history]);

        setTimeout(() => this.remove(id), 15000);
    }

    private fetchInterval: any;

    startRealPulse() {
        if (this.isPulseStarted) return; // Çift çalışmayı engelle
        this.isPulseStarted = true;

        console.log(' RealPulse bildirim akışı başlatıldı');
        this.fetchAlerts();

        this.fetchInterval = setInterval(() => {
            this.fetchAlerts();
        }, 30000);
        this.startCarouselLoop();
    }

    stopPulse() {
        if (this.fetchInterval) clearInterval(this.fetchInterval);
        if (this.carouselInterval) clearInterval(this.carouselInterval);
        this.isPulseStarted = false;
        this.alertsPool = [];
        console.log(' RealPulse bildirim akışı durduruldu');
    }

    private startCarouselLoop() {
        if (this.carouselInterval) clearInterval(this.carouselInterval);

        this.carouselInterval = setInterval(() => {
            if (this.alertsPool.length > 0) {
                const alert = this.alertsPool[this.currentPoolIndex];

                this.show({
                    type: 'sentiment',
                    title: `SIGNAL: ${alert.ticker}`,
                    message: alert.top_signal,

                });

                this.currentPoolIndex = (this.currentPoolIndex + 1) % this.alertsPool.length;
            }
        }, 15000);
    }

    private fetchAlerts() {
        this.http.get<any[]>(`${environment.apiUrl}/alerts/live`).subscribe({
            next: (alerts) => {
                if (alerts && alerts.length > 0) {
                    this.alertsPool = alerts; // Havuzu güncelle
                    console.log('✅ Sinyal Havuzu Güncellendi:', this.alertsPool.length, 'adet sinyal var.');
                }
            },
            error: (err) => console.error(' Sinyal çekme hatası:', err)
        });
    }

    remove(id: number) {
        this.list = this.list.filter(n => n.id !== id);
        this.notificationsSource.next([...this.list]);
    }
}