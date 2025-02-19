import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewsPageRoutingModule } from './news-page-routing.module';
import { ArticleComponent } from './article/article.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { NewsPageComponent } from './news-page.component';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { ArticleReactionsComponent } from './article/article-reactions/article-reactions.component';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { FeedModule } from '@shared/modules/feed/feed.module';
import { ShortEventListModule } from '@shared/modules/short-event-list/short-event-list.module';
import { ShortJobListModule } from '@shared/modules/short-job-list/short-job-list.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [ArticleComponent, NewsPageComponent, ArticleReactionsComponent],
  imports: [
    CommonModule,
    NewsPageRoutingModule,
    CommonDirectivesModule,
    SharedUiModule,
    SharedPipesModule,
    SharedComponentsModule,
    SvgModule,
    FeedModule,
    ShortEventListModule,
    ShortJobListModule,
    TranslateModule
  ]
})
export class NewsPageModule { }
