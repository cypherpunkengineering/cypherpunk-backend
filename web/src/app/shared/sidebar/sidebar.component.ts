import { Router, NavigationEnd } from '@angular/router';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  showDropDown: boolean;

  constructor(private router: Router) {}

  navigate(page: string) {
    this.router.navigate(['/' + page])
  }

}
