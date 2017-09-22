import { Component } from '@angular/core';
import { BackendService } from '../../../services/backend.service';

@Component({
  selector: 'users-card',
  templateUrl: './users-card.component.html',
  styleUrls: ['./users-card.component.scss']
})
export class UsersCardComponent {
  loading = true;
  trialUsers: number;
  pendingUsers: number;
  invitationUsers: number;
  freeUsers: number;
  premiumUsers: number;
  registeredUsers: number;
  confirmedUsers: number;

  constructor(private backend: BackendService) {
    this.backend.userCounts()
    .then((counts) => {
      this.trialUsers = counts.trial;
      this.pendingUsers = counts.pending;
      this.invitationUsers = counts.invitation;
      this.freeUsers = counts.free;
      this.premiumUsers = counts.premium;
      this.registeredUsers = counts.registered;
      this.confirmedUsers = counts.confirmed;
    });
  }
}
