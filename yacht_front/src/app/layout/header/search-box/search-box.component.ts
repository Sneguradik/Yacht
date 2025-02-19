import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IArticleViewBase } from '@api/schemas/article/article-view-base.interface';
import { TopicsService } from '@api/routes/topics.service';
import { ITopicViewBase } from '@api/schemas/topic/topic-view-base.interface';
import { ISearchResult } from './search-result.interfave';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { FeedService } from '@api/routes/feed.service';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public query: string;

  // tslint:disable-next-line:no-output-native
  @Output() public readonly close: EventEmitter<void> = new EventEmitter<void>();

  private readonly search$: Subject<string> = new Subject<string>();

  public result: ISearchResult[] = null;
  public totalResults = 0;

  constructor(
    private readonly topicService: TopicsService,
    private readonly feedService: FeedService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.result = [];
    this.totalResults = 0;
    if (!changes.query.isFirstChange() && changes.query.currentValue) {
      this.search$.next(changes.query.currentValue);
    }
  }

  private subscribeToSearch(): void {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((search: string) => forkJoin([this.feedService.search$(search), this.topicService.search$(search)])),
      takeUntil(this.ngOnDestroy$),
    ).subscribe(([articlesSearchResult, topicsSearchResult]: [IPageResponse<IArticleViewBase>, IPageResponse<ITopicViewBase>]) => {
      this.totalResults = articlesSearchResult.total;
      this.result = [];
      this.result.push(
        ...topicsSearchResult.content.map((topic: ITopicViewBase) => ({
          text: topic.info.name,
          routerLink: ['/topics', topic.meta.id],
          image: topic.info.picture,
          topic: true,
        })).slice(0, 3),
      );
      this.result.push(
        ...articlesSearchResult.content.map((article: IArticleViewBase) => ({
          text: article.info.title,
          routerLink: ['/news', article.meta.id],
          topic: false,
        })).slice(0, 5),
      );
    });
  }
}
