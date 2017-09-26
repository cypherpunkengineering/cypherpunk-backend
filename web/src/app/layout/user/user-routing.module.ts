import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserComponent } from './user.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'users/:id', component: UserComponent }
    ])
  ]
})
export class UserRoutingModule { }
