import { NgModule } from '@angular/core';
import { CommunicationComponent } from './communication.component';
import { SharedModule } from '../../shared/shared.module';
import { CommunicationRoutingModule } from './communication-routing.module';

@NgModule({
  imports: [
    SharedModule,
    CommunicationRoutingModule
  ],
  declarations: [ CommunicationComponent ]
})
export class CommunicationModule { }
