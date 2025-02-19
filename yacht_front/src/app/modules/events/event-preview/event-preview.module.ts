import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPreviewComponent } from './event-preview.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { UserInfoModule } from '@shared/modules/user-info/user-info.module';

@NgModule({
  declarations: [EventPreviewComponent],
  imports: [
    CommonModule,
    SvgModule,
    RouterModule,
    SharedPipesModule,
    SharedComponentsModule,
    UserInfoModule,
    CommonDirectivesModule,
    SharedUiModule,
    TranslateModule.forChild(),
  ],
  exports: [EventPreviewComponent],
})
export class EventPreviewModule {}
