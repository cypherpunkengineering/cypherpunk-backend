import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'users', component: UsersComponent }
    ])
  ]
})
export class UsersRoutingModule { }
