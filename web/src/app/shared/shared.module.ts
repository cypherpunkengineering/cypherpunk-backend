import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NavigationComponent } from './navigation/navigation.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UsersCardComponent } from './cards/users/users-card.component';
import { ModalComponent } from './modal/modal.component';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  declarations: [
    NavigationComponent,
    SidebarComponent,
    UsersCardComponent,
    ModalComponent,
    LoadingComponent
  ],
  providers: [ ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavigationComponent,
    SidebarComponent,
    UsersCardComponent,
    ModalComponent,
    LoadingComponent
  ]
})
export class SharedModule { }
