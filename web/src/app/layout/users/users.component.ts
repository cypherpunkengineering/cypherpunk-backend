import { Component } from '@angular/core';
import { BackendService } from '../../services/backend.service';

@Component({
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  userPages: Object = {};
  userPage: any[] = [];
  currentPage: number = 0;
  direction: string;
  hasMore: boolean;

  constructor(private backend: BackendService) {
    this.getNewPage();
  }

  next() {
    // try to fetch page from memory
    let thisPage = this.userPages[this.currentPage + 1];

    // new page exists in memory
    if (thisPage) {
      this.currentPage = this.currentPage + 1;
      this.userPage = this.userPages[this.currentPage];
    }
    // get new page from backend
    else if (this.hasMore){
      return this.getNewPage({
        created_at: new Date(this.userPage[24].created_at).getTime(),
        last_id: this.userPage[24].id
      });
    }
    // no more pages on backend
    else { return; }
  }

  previous() {
    this.currentPage = this.currentPage - 1;
    if (this.currentPage <= 1) { this.currentPage = 1; }
    this.userPage = this.userPages[this.currentPage];
  }

  getNewPage(query?) {
    return this.backend.users(query)
    .then((data) => {
      this.userPage = data.users;
      this.hasMore = data.hasMore;

      // increment total number of pages, since at end of pages
      this.currentPage = this.currentPage + 1;

      // add page to memory
      this.userPages[this.currentPage] = data.users;
    });
  }

}
