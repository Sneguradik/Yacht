import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgComponent } from './svg/svg.component';



@NgModule({
  declarations: [SvgComponent],
  exports: [SvgComponent],
  imports: [
    CommonModule
  ]
})
export class SvgModule { }
