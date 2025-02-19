import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { FeedService } from '@api/routes/feed.service';
import { TopicsService } from '@api/routes/topics.service';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { fetchArticlesWithTopics$ } from '@shared/functions/fetch-articles-with-topics.function';
import { merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-results-page',
  templateUrl: './search-results-page.component.html',
  styleUrls: ['./search-results-page.component.scss']
})
export class SearchResultsPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly query: FormControl = new FormControl();
  public readonly pageable: PageableContent<[IArticleView, ITopicView], string> =
    new PageableContent<[IArticleView, ITopicView], string>(this.fetch$.bind(this));

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly feedService: FeedService,
    private readonly topicsService: TopicsService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    const urlQuery$: Observable<any> = this.activatedRoute.queryParams.pipe(map((p: Params) => p['q'] || ''));
    urlQuery$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((q: any) => this.query.setValue(q));
    const inputQuery$: Observable<any> = this.query.valueChanges;
    const query$ = merge(urlQuery$, inputQuery$);
    query$.pipe(
      filter((_: any) => !!_),
      distinctUntilChanged(),
      debounceTime(750),
      switchMap((q: any) => this.pageable.setOptionsWithReset$(q)),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
  }

  private fetch$(page: number, query: string): Observable<IPageResponse<[IArticleView, ITopicView]>> {
    return this.feedService.feedRequest$({
      page,
      query,
    }).pipe(switchMap((_: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(_, this.topicsService)));
  }
}
