import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserViewComponent } from './user-view.component';
import { SvgModule } from '../svg/svg.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';

@NgModule({
  declarations: [UserViewComponent],
  imports: [
    CommonModule,
    SvgModule,
    SharedPipesModule,
    SharedUiModule,
    RouterModule,
    CommonDirectivesModule,
    TranslateModule.forChild(),
    SharedComponentsModule
  ],
  exports: [UserViewComponent],
})
export class UserViewModule {}
