import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '**', redirectTo: '/signin', pathMatch: 'full' }
    ])
  ],
})
export class AppRoutingModule { }
