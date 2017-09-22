import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NavigationComponent } from './navigation/navigation.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UsersCardComponent } from './cards/users/users-card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  declarations: [
    NavigationComponent,
    SidebarComponent,
    UsersCardComponent
  ],
  providers: [ ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavigationComponent,
    SidebarComponent,
    UsersCardComponent
  ]
})
export class SharedModule { }
