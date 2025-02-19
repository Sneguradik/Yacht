import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JobPreviewModule } from '../job-preview/job-preview.module';
import { AllJobsComponent } from './all-jobs.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { AllJobsRoutingModule } from './all-jobs-routing.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { RangesModule } from '@shared/modules/ranges/ranges.module';

@NgModule({
  declarations: [AllJobsComponent, JobsListComponent],
  imports: [
    CommonModule,
    AllJobsRoutingModule,
    JobPreviewModule,
    CommonDirectivesModule,
    TranslateModule,
    SharedComponentsModule,
    SharedUiModule,
    RangesModule
  ],
  exports: [AllJobsComponent],
})
export class AllJobsModule {}
