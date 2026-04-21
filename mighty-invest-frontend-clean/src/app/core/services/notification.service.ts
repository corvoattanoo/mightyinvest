import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
    id: number;
    type: 'success' | 'info' | 'sentiment' | 'warning';
    title: string;
    message: string;
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

    constructor(private http: HttpClient) { }

    show(notif: Omit<Notification, 'id'>) {
        const id = Date.now();
        this.list.push({ ...notif, id });
        this.notificationsSource.next([...this.list]);

        // Bildirimi 6 saniye sonra listeden kaldır
        setTimeout(() => this.remove(id), 6000);
    }

    startRealPulse() {
        if (this.isPulseStarted) return; // Çift çalışmayı engelle
        this.isPulseStarted = true;

        console.log('🚀 RealPulse bildirim akışı başlatıldı');
        this.fetchAlerts();

        // Her 30 saniyede bir yeni sinyal kontrolü
        setInterval(() => {
            this.fetchAlerts();
        }, 30000);
    }

    private fetchAlerts() {
        console.log('📡 Backendden canlı sinyaller çekiliyor...');
        this.http.get<any[]>(`${environment.apiUrl}/alerts/live`).subscribe({
            next: (alerts) => {
                console.log('✅ Gelen Sinyaller:', alerts);
                if (alerts && alerts.length > 0) {
                    // Sadece daha önce gösterilmemiş (Set içinde olmayan) sinyalleri filtrele
                    const newAlerts = alerts.filter(a => !this.shownAlerts.has(a.ticker));
                    
                    if (newAlerts.length > 0) {
                        console.log(`✨ ${newAlerts.length} yeni sinyal bulundu, sırayla gösteriliyor...`);
                        
                        // Sinyalleri 3'er saniye arayla ekrana bas
                        newAlerts.forEach((alert, index) => {
                            setTimeout(() => {
                                this.shownAlerts.add(alert.ticker); // Gösterildi olarak işaretle
                                this.show({
                                    type: 'sentiment',
                                    title: `SIGNAL: ${alert.ticker}`,
                                    message: alert.top_signal
                                });

                                // Hafızanın şişmemesi için 100 sinyalden sonrasını temizle
                                if (this.shownAlerts.size > 100) {
                                    const firstKey = this.shownAlerts.values().next().value;
                                    if (firstKey) this.shownAlerts.delete(firstKey);
                                }
                            }, index * 3000);
                        });
                    } else {
                        console.log('ℹ️ Yeni farklı bir sinyal bulunamadı.');
                    }
                }
            },
            error: (err) => {
                console.error('❌ Sinyal çekme hatası:', err);
            }
        });
    }

    remove(id: number) {
        this.list = this.list.filter(n => n.id !== id);
        this.notificationsSource.next([...this.list]);
    }
}