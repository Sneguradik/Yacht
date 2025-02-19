import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JobPageComponent } from './job-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { JobPageRoutingModule } from './job-page-routing.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { JobPageUnwrapComponent } from './job-page-unwrap.component';
import { UserInfoModule } from '@shared/modules/user-info/user-info.module';

@NgModule({
  declarations: [
    JobPageUnwrapComponent,
    JobPageComponent
  ],
  imports: [
    CommonModule,
    JobPageRoutingModule,
    SharedComponentsModule,
    UserInfoModule,
    SharedUiModule,
    CommonDirectivesModule,
    SharedPipesModule,
    TranslateModule.forChild(),
  ],
  exports: [
    JobPageUnwrapComponent
  ],
})
export class JobPageModule { }
