import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { AuthGuard } from 'app/services/auth-guard.service';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'users/:id', component: UserComponent, canActivate: [AuthGuard] }
    ])
  ]
})
export class UserRoutingModule { }
