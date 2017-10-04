import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'cp-nav',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  showDropDown: boolean;

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.signout()
    .then(() => { window.location.href = "/"; });
  }
}
