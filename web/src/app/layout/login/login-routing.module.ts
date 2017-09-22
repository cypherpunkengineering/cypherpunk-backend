import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'signin', component: LoginComponent }
    ])
  ]
})
export class LoginRoutingModule { }
