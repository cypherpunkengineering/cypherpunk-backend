import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import { AuthGuard } from 'app/services/auth-guard.service';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard] }
    ])
  ]
})
export class UsersRoutingModule { }
