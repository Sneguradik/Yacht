import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoHeaderComponent } from './info-header.component';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslateModule } from '@ngx-translate/core';
import { SharedUiModule } from '../shared-ui.module';



@NgModule({
  declarations: [InfoHeaderComponent],
  exports: [InfoHeaderComponent],
  imports: [
    CommonModule,
    SvgModule,
    NgScrollbarModule,
    TranslateModule.forChild(),
    SharedUiModule
  ]
})
export class InfoHeaderModule { }
