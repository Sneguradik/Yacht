import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDraftsPageRoutingModule } from './user-drafts-page-routing.module';
import { UserDraftsPageComponent } from './user-drafts-page.component';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { UserHeaderModule } from '@modules/user/user-header/user-header.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { FeedModule } from '@shared/modules/feed/feed.module';


@NgModule({
  declarations: [UserDraftsPageComponent],
  imports: [
    CommonModule,
    UserDraftsPageRoutingModule,
    RangesModule,
    UserHeaderModule,
    SharedComponentsModule,
    FeedModule
  ]
})
export class UserDraftsPageModule { }
