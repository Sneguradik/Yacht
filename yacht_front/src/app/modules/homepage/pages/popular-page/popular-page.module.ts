import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopularPageRoutingModule } from './popular-page-routing.module';
import { PopularPageComponent } from './popular-page.component';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { ShortJobListModule } from '@shared/modules/short-job-list/short-job-list.module';
import { ShortEventListModule } from '@shared/modules/short-event-list/short-event-list.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [PopularPageComponent],
  imports: [
    CommonModule,
    PopularPageRoutingModule,
    FeedModule,
    SharedPipesModule,
    SharedComponentsModule,
    SvgModule,
    ShortJobListModule,
    ShortEventListModule,
    TranslateModule,
  ]
})
export class PopularPageModule { }
