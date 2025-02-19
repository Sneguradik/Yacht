import { Component, Input, EventEmitter, Output, ElementRef, HostListener, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ResponsiveService } from '@app/services/responsive.service';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';

@Component({
  selector: 'app-article-editor-topic',
  templateUrl: './article-editor-topic.component.html',
  styleUrls: ['./article-editor-topic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleEditorTopicComponent implements OnChanges {
  @Input() public article: IArticleViewFull;
  @Input() public allTopics: ITopicView[] = [];

  @Output() public readonly topicsChange: EventEmitter<number[]> = new EventEmitter<number[]>();
  @Output() public readonly topicsSaveReq: EventEmitter<number[]> = new EventEmitter<number[]>();

  public open = false;
  public selected: ITopicView;

  constructor(private readonly ref: ElementRef, public readonly responsive: ResponsiveService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.allTopics && this.article && changes.allTopics.currentValue !== changes.allTopics.previousValue) {
      this.setSelected(this.article.topics[0]);
    }
  }

  @HostListener('document:click', ['$event']) public onClick(event: Event): void {
    if (!this.ref.nativeElement.contains(event.target)) {
      if (this.open) {
        this.open = false;
        this.topicsSaveReq.emit(this.article.topics);
      }
    }
  }

  private setSelected(topic: number): void {
    this.selected = this.allTopics.find((_: ITopicView) => _.meta.id === topic);
  }

  public toggleDropdown(): void {
    if (this.open) {
      this.topicsSaveReq.emit(this.article.topics);
    }
    this.open = !this.open;
  }

  public onChange(topic: ITopicView, value: boolean): void {
    if (value && !this.article.topics.find((it: number) => it === topic.meta.id) && this.article.topics.length < 4) {
      this.topicsChange.emit((this.article.topics = this.article.topics.concat(topic.meta.id)));
    } else if (!value && this.article.topics.find((it: number) => it === topic.meta.id)) {
      this.topicsChange.emit((this.article.topics = this.article.topics.filter((it: number) => it !== topic.meta.id)));
    }
    if (this.article.topics.length === 0) {
      this.selected = null;
    } else {
      this.setSelected(this.article.topics[0]);
    }
  }

  public setMainTopic(topicId: number): void {
    if ((this.article.topics.includes(topicId) && this.article.topics.length <= 4)
      || (!this.article.topics.includes(topicId) && this.article.topics.length < 4)) {
      this.topicsChange.emit((this.article.topics = [topicId, ...this.article.topics.filter((id: number) => topicId !== id)]));
      this.setSelected(topicId);
    }
  }
}
