import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserHeaderComponent } from './user-header.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { InfoHeaderModule } from '@shared/ui/info-header/info-header.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';



@NgModule({
  declarations: [UserHeaderComponent],
  exports: [UserHeaderComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    SharedPipesModule,
    InfoHeaderModule,
    TranslateModule.forChild(),
    RouterModule,
    SvgModule,
    SharedComponentsModule
  ]
})
export class UserHeaderModule { }
