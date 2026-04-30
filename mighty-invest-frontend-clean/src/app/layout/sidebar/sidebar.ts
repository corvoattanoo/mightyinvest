import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit{

  isMarketsPage = false;

  constructor(private Router: Router) { }

  ngOnInit(): void {
    // sayfa ilk yuklendiginde kontrol et
    this.checkRoute(this.Router.url);
  }

  checkRoute(url: string){
    this.isMarketsPage = url.includes('/markets');
  }

}

