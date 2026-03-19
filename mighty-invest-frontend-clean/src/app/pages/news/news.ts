import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-news',
  imports: [CommonModule, RouterModule],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class NewsComponent {

}
