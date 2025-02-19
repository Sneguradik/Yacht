import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewsEditPageRoutingModule } from './news-edit-page-routing.module';
import { NewsEditPageComponent } from './news-edit-page.component';
import { ArticleEditorComponent } from './article-editor/article-editor.component';
import { ArticleEditorPreviewComponent } from './article-editor-preview/article-editor-preview.component';
import { ArticleRepublishComponent } from './article-republish/article-republish.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AutosizeModule } from 'ngx-autosize';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { ArticleEditorTopicComponent } from './article-editor/article-editor-topic/article-editor-topic.component';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TagAssignComponent } from './article-editor/tag-assign/tag-assign.component';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { CommonDirectivesModule } from '@shared/directives/directives.module';


@NgModule({
  declarations: [
    NewsEditPageComponent,
    ArticleEditorComponent,
    ArticleEditorPreviewComponent,
    ArticleRepublishComponent,
    ArticleEditorTopicComponent,
    TagAssignComponent
  ],
  imports: [
    CommonModule,
    NewsEditPageRoutingModule,
    FormsModule,
    CommonDirectivesModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    AutosizeModule,
    SharedUiModule,
    SharedComponentsModule,
    SharedPipesModule,
    NgScrollbarModule,
    SvgModule
  ]
})
export class NewsEditPageModule { }
