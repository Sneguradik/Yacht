import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil, map, switchMap, filter } from 'rxjs/operators';
import { TagsService } from '@api/routes/tags.service';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { FeedService } from '@api/routes/feed.service';
import { fetchArticlesWithTopics$ } from '@shared/functions/fetch-articles-with-topics.function';
import { TopicsService } from '@api/routes/topics.service';
import { SessionService } from '@app/services/session.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { notFound } from '@shared/utils/not-found.operator';
import { PlatformService } from '@shared/services/platform.service';

@Component({
  selector: 'app-tag-page',
  templateUrl: './tag-page.component.html',
  styleUrls: ['./tag-page.component.scss']
})
export class TagPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  private readonly id$: ReplaySubject<number> = new ReplaySubject<number>(1);

  public readonly tag$: ReplaySubject<ITagView> = new ReplaySubject<ITagView>();
  public readonly pageable: PageableContent<[IArticleView, ITopicView], [number, IUserViewFull]> =
    new PageableContent<[IArticleView, ITopicView], [number, IUserViewFull]>(this.fetch$.bind(this));

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly tagsService: TagsService,
    private readonly feedService: FeedService,
    private readonly topicsService: TopicsService,
    private readonly sessionService: SessionService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly platformService: PlatformService,
    public readonly router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.activatedRoute.paramMap.pipe(
      map((_: ParamMap) => +_.get('id')),
      takeUntil(this.ngOnDestroy$),
    ).subscribe(this.id$);

    this.id$.pipe(
      switchMap((id: number) => this.tagsService.getSingle$(id)),
      notFound(this.router),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(this.tag$);

    const options$: Observable<[number, IUserViewFull]> = combineLatest([this.id$, this.sessionService.user$]);

    options$.pipe(
      switchMap((opts: [number, IUserViewFull]) => this.pageable.setOptionsWithReset$(opts)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();

    options$.pipe(
      filter((_: [number, IUserViewFull]) => !!_[1]),
      switchMap(([id]: [number, IUserViewFull]) => this.tagsService.markAsViewed$(id)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();

    if (this.platformService.isServer) {
      this.pageable.content = this.activatedRoute.snapshot.data.feed;
    }
  }

  public fetch$(page: number, options: [number, IUserViewFull]): Observable<IPageResponse<[IArticleView, ITopicView]>> {
    return this.feedService.feedRequest$({ page, tag: options ? options[0] : undefined }).pipe(
      switchMap((_: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(_, this.topicsService)),
      takeUntil(this.ngOnDestroy$),
    );
  }
}
