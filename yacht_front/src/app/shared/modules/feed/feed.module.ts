import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedArticleViewComponent } from './feed-article-view/feed-article-view.component';
import { RouterModule } from '@angular/router';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { SvgModule } from '../svg/svg.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [FeedArticleViewComponent],
  exports: [FeedArticleViewComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedPipesModule,
    SharedUiModule,
    SharedComponentsModule,
    SvgModule,
    CommonDirectivesModule,
    TranslateModule.forChild()
  ]
})
export class FeedModule { }
