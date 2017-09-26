import { NgModule } from '@angular/core';
import { UserComponent } from './user.component';
import { SharedModule } from '../../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule
  ],
  declarations: [ UserComponent ]
})
export class UserModule { }
