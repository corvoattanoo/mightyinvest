import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-premium-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cancel.html',
  styleUrl: './cancel.css',
})
export class PremiumCancelComponent {}
