import { Component } from '@angular/core';
import { BackendService } from '../../services/backend.service';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  searchTerm: string;
  searchResults: any[] = [];
  searchSelection: string = 'email';

  constructor(private backend: BackendService) { }

  getTransactions() {
    let query = {};
    if (this.searchSelection === 'email') {
      query['email'] = this.searchTerm;
    }
    else if (this.searchSelection === 'transaction_id') {
      query['transactionId'] = this.searchTerm;
    }
    else { return; }

    return this.backend.userSearch(query)
    .then((data) => { this.searchResults = data.results; })
    .catch((e) => {
      console.log(e);
      alert ('Error! Invalid search');
    });
  }

  clear() {
    this.searchTerm = '';
    this.searchResults = [];
  }
}
