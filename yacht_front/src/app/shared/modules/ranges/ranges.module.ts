import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangesComponent } from './ranges.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SvgModule } from '../svg/svg.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [RangesComponent],
  exports: [RangesComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    SvgModule,
    TranslateModule.forChild()
  ]
})
export class RangesModule { }
