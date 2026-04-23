import {  ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponent implements OnInit, OnDestroy{
  notifications: Notification[] = [];
  private sub?: Subscription;

  constructor(private notificationService: NotificationService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    // 1. Akışı servisin kendisinden başlat (eğer başlamamışsa içeride kontrol ediyor zaten)
    this.notificationService.startRealPulse();
    // Servisimizden gelen bildirim akışına abone oluyoruz
    this.sub = this.notificationService.notifications$.subscribe(list => {
      this.notifications = list;
      this.cdRef.detectChanges();
    });
  }

  remove(id: number){
    this.notificationService.remove(id);
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();

  }
}
