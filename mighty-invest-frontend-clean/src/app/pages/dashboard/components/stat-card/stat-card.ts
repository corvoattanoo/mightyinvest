import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stat-card.html',
    styleUrl: './stat-card.css',
})
export class StatCardComponent {
    @Input() title: string = '';
    @Input() value: string = '';
    @Input() percentage: string = '';
    @Input() trend: 'up' | 'down' = 'up';
    @Input() icon: string = 'payments';
}
