import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from 'app/services/auth-guard.service';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'cp', component: DashboardComponent, canActivate: [AuthGuard] }
    ])
  ]
})
export class DashboardRoutingModule { }
