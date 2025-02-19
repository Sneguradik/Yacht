import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserPromotedPageRoutingModule } from './user-promoted-page-routing.module';
import { UserPromotedPageComponent } from './user-promoted-page.component';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { UserHeaderModule } from '@modules/user/user-header/user-header.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { EventPreviewModule } from '@modules/events/event-preview/event-preview.module';
import { JobPreviewModule } from '@modules/jobs/job-preview/job-preview.module';


@NgModule({
  declarations: [UserPromotedPageComponent],
  imports: [
    CommonModule,
    UserPromotedPageRoutingModule,
    RangesModule,
    UserHeaderModule,
    SharedComponentsModule,
    FeedModule,
    EventPreviewModule,
    JobPreviewModule
  ]
})
export class UserPromotedPageModule { }
