import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { JobPreviewComponent } from './job-preview.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { UserInfoModule } from '@shared/modules/user-info/user-info.module';

@NgModule({
  declarations: [JobPreviewComponent],
  imports: [
    CommonModule,
    UserInfoModule,
    SharedComponentsModule,
    SharedUiModule,
    SharedPipesModule,
    RouterModule,
    CommonDirectivesModule,
    TranslateModule.forChild()
  ],
  exports: [JobPreviewComponent],
})
export class JobPreviewModule { }
