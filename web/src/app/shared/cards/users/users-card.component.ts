import { Component } from '@angular/core';
import { BackendService } from '../../../services/backend.service';

@Component({
  selector: 'users-card',
  templateUrl: './users-card.component.html',
  styleUrls: ['./users-card.component.scss']
})
export class UsersCardComponent {
  loading = true;
  users: any;

  constructor(private backend: BackendService) {
    this.backend.userCounts()
    .then((data) => { this.users = data; });
  }
}
