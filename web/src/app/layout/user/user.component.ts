import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../../services/backend.service';

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
  user: any;

  constructor(private route: ActivatedRoute, private backend: BackendService) {
    this.route.params.subscribe(params => {
      this.getUser(params['id']);
    });
  }

  getUser(id) {
    return this.backend.user(id)
    .then((data) => { this.user = data; });
  }
}
