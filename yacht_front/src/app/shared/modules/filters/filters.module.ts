import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersComponent } from './filters.component';



@NgModule({
  declarations: [FiltersComponent],
  exports: [FiltersComponent],
  imports: [
    CommonModule
  ]
})
export class FiltersModule { }
