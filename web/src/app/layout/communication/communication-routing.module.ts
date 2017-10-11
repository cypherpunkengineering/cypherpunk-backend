import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommunicationComponent } from './communication.component';
import { AuthGuard } from 'app/services/auth-guard.service';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'communication', component: CommunicationComponent, canActivate: [AuthGuard] }
    ])
  ]
})
export class CommunicationRoutingModule { }
