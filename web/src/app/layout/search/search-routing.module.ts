import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'search', component: SearchComponent }
    ])
  ]
})
export class SearchRoutingModule { }
