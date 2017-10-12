import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
  user: any;
  now = new Date();
  showDeactivatedModal = false;

  constructor(private route: ActivatedRoute, private backend: BackendService) {
    this.route.params.subscribe(params => {
      this.getUser(params['id']);
    });
  }

  resetPassword() {
    return this.backend.adminReset(this.user.id, {})
    .then((data) => { alert('Reset Password Email Sent!'); });
  }

  deactivate() {
    this.showDeactivatedModal = false;
    return this.backend.deactivate(this.user.id, {})
    .then(() =>  { this.user.deactivated = true; })
    .then(() => { alert('User has been deactivated'); })
  }

  getUser(id) {
    return this.backend.user(id)
    .then((data) => { this.user = data; });
  }
}
