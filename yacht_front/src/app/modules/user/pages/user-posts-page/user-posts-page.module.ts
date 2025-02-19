import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserPostsPageRoutingModule } from './user-posts-page-routing.module';
import { UserPostsPageComponent } from './user-posts-page.component';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { UserHeaderModule } from '@modules/user/user-header/user-header.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { FeedModule } from '@shared/modules/feed/feed.module';


@NgModule({
  declarations: [UserPostsPageComponent],
  imports: [
    CommonModule,
    UserPostsPageRoutingModule,
    RangesModule,
    UserHeaderModule,
    SharedComponentsModule,
    FeedModule
  ]
})
export class UserPostsPageModule { }
