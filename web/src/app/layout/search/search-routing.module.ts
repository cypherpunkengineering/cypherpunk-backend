import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { AuthGuard } from 'app/services/auth-guard.service';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'search', component: SearchComponent, canActivate: [AuthGuard] }
    ])
  ]
})
export class SearchRoutingModule { }
