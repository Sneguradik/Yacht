import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';

@Component({
  selector: 'app-article-editor-preview',
  templateUrl: './article-editor-preview.component.html',
  styleUrls: ['../article-editor-shared-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleEditorPreviewComponent {
  @Input() public article: IArticleView;
  @Input() public topic: ITopicView;

  constructor() { }
}
