import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';

import { LoginModule } from '../layout/login/login.module';
import { DashboardModule } from '../layout/dashboard/dashboard.module';

import { AuthService } from '../services/auth.service';
import { BackendService } from '../services/backend.service';
import { GlobalsService } from '../services/globals.service';
import { SessionService } from '../services/session.service';


@NgModule({
  declarations: [ AppComponent ],
  imports: [
    HttpModule,
    SharedModule,
    BrowserModule,
    LoginModule,
    DashboardModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    SessionService,
    BackendService,
    GlobalsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
