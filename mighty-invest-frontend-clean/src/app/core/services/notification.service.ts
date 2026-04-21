import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Bildirim tipini belirleyen arayüz.
 * success: Başarılı işlemler (Örn: Alım-Satım)
 * info: Genel bilgilendirme
 * warning: Uyarılar
 * sentiment: Duygu analizi sinyalleri (Özellikle parlayan efektler için)
 */
export interface Notification {
  
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
}
