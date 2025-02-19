import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopicPageRoutingModule } from './topic-page-routing.module';
import { TopicPageComponent } from './topic-page.component';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { TranslateModule } from '@ngx-translate/core';
import { InfoHeaderModule } from '@shared/ui/info-header/info-header.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';


@NgModule({
  declarations: [TopicPageComponent],
  imports: [
    CommonModule,
    TopicPageRoutingModule,
    SvgModule,
    SharedPipesModule,
    SharedUiModule,
    TranslateModule.forChild(),
    InfoHeaderModule,
    SharedComponentsModule,
    FeedModule,
    CommonDirectivesModule
  ]
})
export class TopicPageModule { }
