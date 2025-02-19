import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageComponent } from './home-page.component';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { ShortJobListModule } from '@shared/modules/short-job-list/short-job-list.module';
import { ShortEventListModule } from '@shared/modules/short-event-list/short-event-list.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [HomePageComponent],
  imports: [
    CommonModule,
    HomePageRoutingModule,
    SharedComponentsModule,
    FeedModule,
    SvgModule,
    ShortJobListModule,
    ShortEventListModule,
    TranslateModule.forChild()
  ]
})
export class HomePageModule { }
