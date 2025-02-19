import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserJobsPageRoutingModule } from './user-jobs-page-routing.module';
import { UserJobsPageComponent } from './user-jobs-page.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { JobPreviewModule } from '@modules/jobs/job-preview/job-preview.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';


@NgModule({
  declarations: [UserJobsPageComponent],
  imports: [
    CommonModule,
    UserJobsPageRoutingModule,
    SharedUiModule,
    JobPreviewModule,
    SharedComponentsModule
  ]
})
export class UserJobsPageModule { }
