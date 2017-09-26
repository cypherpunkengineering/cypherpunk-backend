import { NgModule } from '@angular/core';
import { UsersComponent } from './users.component';
import { SharedModule } from '../../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
  imports: [
    SharedModule,
    UsersRoutingModule
  ],
  declarations: [ UsersComponent ]
})
export class UsersModule { }
