import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllPageRoutingModule } from './all-page-routing.module';
import { AllPageComponent } from './all-page.component';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { ShortEventListModule } from '@shared/modules/short-event-list/short-event-list.module';
import { ShortJobListModule } from '@shared/modules/short-job-list/short-job-list.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [AllPageComponent],
  imports: [
    CommonModule,
    AllPageRoutingModule,
    SharedComponentsModule,
    FeedModule,
    SvgModule,
    ShortEventListModule,
    ShortJobListModule,
    TranslateModule.forChild()
  ]
})
export class AllPageModule { }
