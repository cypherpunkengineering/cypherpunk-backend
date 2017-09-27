import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommunicationComponent } from './communication.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'communication', component: CommunicationComponent }
    ])
  ]
})
export class CommunicationRoutingModule { }
