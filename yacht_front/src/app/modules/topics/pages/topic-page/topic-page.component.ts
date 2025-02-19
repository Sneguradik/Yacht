import { Component, OnInit, OnDestroy } from '@angular/core';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { Observable, BehaviorSubject, of, combineLatest, ReplaySubject } from 'rxjs';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { TopicsService } from '@api/routes/topics.service';
import { SessionService } from '@app/services/session.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FeedService } from '@api/routes/feed.service';
import { takeUntil, map, catchError, switchMap, tap, filter } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { fetchArticlesWithTopics$ } from '@shared/functions/fetch-articles-with-topics.function';
import { DynamicMetaTagsService } from '@layout/dynamic-meta-tags/dynamic-meta-tags.service';
import { environment } from '@env';
import { HeaderStatsSyncService } from '@layout/shared/services/header-stats-sync.service';
import { PlatformService } from '@shared/services/platform.service';

enum BarItemEnum {
  PUBLICATIONS = 'publications',
  FAVORITES = 'favorites',
  INFO = 'info',
}

type PageableOptions = [number, IUserViewFull | null, BarItemEnum];

@Component({
  selector: 'app-topic-page',
  templateUrl: './topic-page.component.html',
  styleUrls: ['./topic-page.component.scss']
})
export class TopicPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly pageable: PageableContent<[IArticleView, ITopicView], PageableOptions> =
    new PageableContent<[IArticleView, ITopicView], PageableOptions>(this.fetch$.bind(this));
  public readonly barItem$: BehaviorSubject<BarItemEnum> = new BehaviorSubject<BarItemEnum>(BarItemEnum.PUBLICATIONS);
  public readonly barItems: typeof BarItemEnum = BarItemEnum;
  public readonly id$: ReplaySubject<number | string> = new ReplaySubject<number | string>(1);

  public topic: ITopicViewFull;
  public promotedCount$: Observable<number>;
  public idNum$: Observable<number>;

  constructor(
    private readonly topicsService: TopicsService,
    private readonly sessionService: SessionService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly feedService: FeedService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly dynamicMetaTagsService: DynamicMetaTagsService,
    private readonly router: Router,
    private readonly headerStatsSyncService: HeaderStatsSyncService,
    private readonly platformService: PlatformService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });
    this.initOptions();
    this.headerStatsSyncService.subEvent$.pipe(
      filter(([type, id, ]: ['topic' | 'company', number, boolean]) => type === 'topic' && id === this.topic.meta.id),
      tap(([, , status]: ['topic' | 'company', number, boolean]) => this.topic.subscribers.you = status),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();

    if (this.platformService.isServer) {
      this.pageable.content = this.activatedRoute.snapshot.data.feed;
    }
  }

  ngOnDestroy(): void {
    this.dynamicMetaTagsService.setToDefault();
    super.ngOnDestroy();
  }

  private initOptions(): void {
    this.topic = this.activatedRoute.snapshot.data.data;
    this.activatedRoute.paramMap.pipe(
      map((_: ParamMap) => _.get('id')),
      takeUntil(this.ngOnDestroy$),
    ).subscribe(this.id$);
    this.idNum$ = this.id$.pipe(
      switchMap((id: string | number) => this.topicsService.getOne$(id)),
      tap((_: ITopicViewFull) => this.topic = _),
      map((_: any) => _.meta.id),
      catchError(() => of(null))
    );
    this.promotedCount$ = this.idNum$.pipe(switchMap((id: number) => this.feedService.count$({ list: 'default', topic: id })));

    const options$ = combineLatest([this.idNum$, this.sessionService.user$, this.barItem$]);

    options$.pipe(
      switchMap((opts: [number, IUserViewFull, BarItemEnum]) => this.pageable.setOptionsWithReset$(opts)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();

    this.getMainData();
  }

  private fetch$(page: number, options: PageableOptions): Observable<IPageResponse<[IArticleView, ITopicView]>> {
    return options
      ? this.feedService.feedRequest$({
          page,
          topic: options[0],
          list: options[2] === 'favorites' ? 'default' : undefined,
        }).pipe(switchMap((_: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(_, this.topicsService)))
      : of({ page: -1, total: 1, totalPages: 1, content: [] });
  }

  private getMainData(): void {
    this.dynamicMetaTagsService.metaInfo$.next({
      title: this.topic.info.name,
      tags: [
        { property: 'og:title', content: this.topic.info.name },
        { name: 'description', content: this.topic.info.description },
        { property: 'og:description', content: this.topic.info.description },
        { property: 'og:image', content: this.topic.info.picture },
        { property: 'og:url', content: environment.url + this.router.url },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Diskurs.Media' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: this.topic.info.name },
        { name: 'twitter:description', content: this.topic.info.description },
        { name: 'twitter:image', content: this.topic.info.picture }
      ]
    });
  }

  public subFunc(topic: ITopicViewFull): void {
    if (topic.hidden) {
      this.topicsService.hide$(topic.meta.id, true).subscribe();
    }
    this.topicsService.subscribe$(
      topic.meta.id,
      topic.subscribers.you
    ).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      topic.subscribers.you = !topic.subscribers.you;
      this.headerStatsSyncService.subEvent$.next(['topic', topic.meta.id, topic.subscribers.you]);
    });
  }

  public switchBar(barItem: BarItemEnum): void {
    this.barItem$.next(barItem);
  }
}
