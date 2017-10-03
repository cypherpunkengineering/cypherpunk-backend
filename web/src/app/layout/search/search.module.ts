import { NgModule } from '@angular/core';
import { SearchComponent } from './search.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchRoutingModule } from './search-routing.module';

@NgModule({
  imports: [
    SharedModule,
    SearchRoutingModule
  ],
  declarations: [ SearchComponent ]
})
export class SearchModule { }
