import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'cp', component: DashboardComponent }
    ])
  ]
})
export class DashboardRoutingModule { }
