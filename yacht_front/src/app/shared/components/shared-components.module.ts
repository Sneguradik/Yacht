import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { WysiwygEditorComponent } from './wysiwyg-editor/wysiwyg-editor.component';
import { PaginationComponent } from './pagination/pagination.component';
import { CommentSectionComponent } from './comment-section/comment-section.component';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { CommentEditorComponent } from './comment-section/comment-editor/comment-editor.component';
import { CommentComponent } from './comment-section/comment/comment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { ActionMenuCommentComponent } from './action-menu/action-menu-comment/action-menu-comment.component';
import { VotingComponent } from './voting/voting.component';
import { TranslateModule } from '@ngx-translate/core';
import { ShareComponent } from './share/share.component';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { ActionMenuArticleComponent } from './action-menu/action-menu-article/action-menu-article.component';
import { AdBannerComponent } from './ad-banner/ad-banner.component';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { ActionMenuEventComponent } from './action-menu/action-menu-event/action-menu-event.component';
import { ContactCompactListComponent } from './contact-compact-list/contact-compact-list.component';
import { ActionMenuJobComponent } from './action-menu/action-menu-job/action-menu-job.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ActionMenuTagComponent } from './action-menu/action-menu-tag/action-menu-tag.component';
import { ActionMenuTopicComponent } from './action-menu/action-menu-topic/action-menu-topic.component';
import { ActionMenuUserComponent } from './action-menu/action-menu-user/action-menu-user.component';
import { RangesModule } from '@shared/modules/ranges/ranges.module';
import { FiltersModule } from '@shared/modules/filters/filters.module';



@NgModule({
  declarations: [
    WysiwygEditorComponent,
    CommentSectionComponent,
    CommentEditorComponent,
    CommentComponent,
    ActionMenuCommentComponent,
    VotingComponent,
    ShareComponent,
    ContactCompactListComponent,
    ActionMenuJobComponent,
    ActionMenuArticleComponent,
    ActionMenuEventComponent,
    AdBannerComponent,
    PaginationComponent,
    FileUploadComponent,
    ActionMenuTagComponent,
    ActionMenuTopicComponent,
    ActionMenuUserComponent
  ],
  exports: [
    WysiwygEditorComponent,
    SvgModule,
    ActionMenuJobComponent,
    CommentSectionComponent,
    CommentEditorComponent,
    CommentComponent,
    ActionMenuEventComponent,
    ContactCompactListComponent,
    ActionMenuCommentComponent,
    VotingComponent,
    ShareComponent,
    ActionMenuArticleComponent,
    AdBannerComponent,
    SharedPipesModule,
    PaginationComponent,
    FileUploadComponent,
    ActionMenuTagComponent,
    ActionMenuTopicComponent,
    ActionMenuUserComponent
  ],
  imports: [
    SvgModule,
    CommonModule,
    CKEditorModule,
    SharedUiModule,
    RouterModule,
    SharedPipesModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    CommonDirectivesModule,
    SvgModule,
    RangesModule,
    FiltersModule
  ]
})
export class SharedComponentsModule { }
