import { Component, OnInit, OnDestroy } from '@angular/core';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { TopicsService } from '@api/routes/topics.service';
import { TagsService } from '@api/routes/tags.service';
import { DynamicMetaTagsService } from '@layout/dynamic-meta-tags/dynamic-meta-tags.service';
import { environment } from '@env';
import { PlatformService } from '@shared/services/platform.service';
import { SessionService } from '@app/services/session.service';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { ICommentViewArticle } from '@api/schemas/comment/comment-view-article.interface';
import { ArticlesService } from '@api/routes/articles.service';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { IEventsJobsControl } from '@api/schemas/dashboard/events-jobs-control.interface';
import { AdministrationService } from '@api/routes/administration.service';
import { FeedService } from '@api/routes/feed.service';
import { ISidebarWrapperParams } from '@layout/sidebar-wrapper/sidebar-wrapper-params.interface';
import { HeaderStatsSyncService } from '@layout/shared/services/header-stats-sync.service';

@Component({
  selector: 'app-news-page',
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.scss']
})
export class NewsPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  public readonly bannerPlaceEnum: typeof BannerPlaceEnum = BannerPlaceEnum;

  public data$: BehaviorSubject<IArticleViewFull> = new BehaviorSubject<IArticleViewFull>(null);
  public topics: ITopicView[] = [];
  public tags: ITagView[] = [];
  public user: IUserViewFull;
  public isLogged: boolean;
  public comments: ICommentViewArticle[];
  public isBrowser: boolean;

  public companyArticles: IArticleViewFull[] = [];
  public companyTopics$: Observable<ITopicView[]>[] = [];
  public eventsJobs: IEventsJobsControl;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly topicsService: TopicsService,
    private readonly tagsService: TagsService,
    private readonly dynamicMetaTagsService: DynamicMetaTagsService,
    private readonly platformService: PlatformService,
    private readonly sessionService: SessionService,
    private readonly articlesService: ArticlesService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly administrationService: AdministrationService,
    private readonly feedService: FeedService,
    private readonly headerStatSyncService: HeaderStatsSyncService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isBrowser = this.platformService.isBrowser;
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({
        article: true,
        articleData: this.route.snapshot.data.data,
        trending: true,
        navigation: false,
        live: false,
        showSidebar: true
      });

      this.sidebarWrapperService.params$.pipe(
        filter((params: ISidebarWrapperParams) => !!params.article),
        takeUntil(this.ngOnDestroy$)
      ).subscribe((wrapperParams: ISidebarWrapperParams) => {
        this.data$.next({ ...wrapperParams.articleData });
      });
    });

    this.getMainData();
    if (this.isBrowser) {
      this.headerStatSyncService.articlesCountSyncEvent$.next();
      this.getAllData();
    }

    this.administrationService.getEventsJobs$().subscribe((jobEvents: IEventsJobsControl) => this.eventsJobs = jobEvents);

    const user$ = this.sessionService.user$;
    const isLogged$ = this.sessionService.loggedIn$;
    const comments$ = this.articlesService.commentsForArticle$(this.route.snapshot.data.data.meta.id);

    combineLatest([user$, isLogged$, comments$])
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(([user, isLogged, comments]: [IUserViewFull, boolean, ICommentViewArticle[]]) => {
        this.user = user;
        this.isLogged = isLogged;
        this.comments = comments;
    });

    if (!this.sub) {
      this.sub = this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          this.ngOnDestroy();
          if (this.router.url.includes('/news/') && !this.router.url.includes('/edit')) {
            this.ngOnInit();
          } else {
            this.sub.unsubscribe();
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.dynamicMetaTagsService.setToDefault();
    super.ngOnDestroy();
  }

  private getAllData(): void {
    const articles = this.data$.getValue();
    this.topicsService.getMultiple$(articles?.topics || [])
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((list: ITopicView[]) => {
      this.topics = list;
    });
    this.tagsService.getMultiple$(articles?.tags || [])
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((list: ITagView[]) => {
      this.tags = list;
    });
    const dataBuff: IArticleViewFull = articles;
    this.data$.next({ ...articles, info: {} as any, html: '' });
    requestAnimationFrame(() => {
      this.data$.next({ ...dataBuff });
      window.scroll(0, 0);
    });
    this.getCompaniesArticles();
  }

  private getMainData(): void {
    this.data$.next(this.route.snapshot.data.data);
    const data = this.data$.getValue();
    this.dynamicMetaTagsService.metaInfo$.next({
      title: data.info.title,
      tags: [
        { property: 'og:title', content: data.info.title },
        { name: 'description', content: data.info.summary },
        { property: 'og:description', content: data.info.summary },
        { property: 'og:image', content: data.info.cover },
        { property: 'og:url', content: environment.url + this.router.url },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Diskurs.Media' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: data.info.title },
        { name: 'twitter:description', content: data.info.summary },
        { name: 'twitter:image', content: data.info.cover }
      ]
    });
  }

  private getCompaniesArticles(): void {
    this.companyArticles = [];
    this.feedService.feedRequest$({ company: true }).subscribe((feeds: any) => {
      for (const feed of feeds.content) {
        if (feed.meta.id !== this.data$.getValue().meta.id) {
          this.companyArticles.push(feed);
          this.companyTopics$.push(feed.topics?.length > 0 ? this.topicsService.getMultiple$([feed.topics[0]]) : null);
        }
        if (this.companyArticles.length === 3) {
          break;
        }
      }
    });
  }

  public addComment(): void {
    const articles = this.data$.getValue();
    this.data$.next({...articles, commentCount: ++articles.commentCount});
    this.sidebarWrapperService.params$.next(
      {
        ...this.sidebarWrapperService.params$.getValue(),
        articleData: this.data$.getValue()
      });
  }

  public addWatch(): void {
    const articles = this.data$.getValue();
    this.data$.next({...articles, views: {...articles.views, count: ++articles.views.count}});
  }

  public updateBookmark(bookmarked: boolean): void {
    this.sidebarWrapperService.params$.next({
      ...this.sidebarWrapperService.params$.value,
      articleData: {
        ...this.sidebarWrapperService.params$.value.articleData,
        bookmarks: {
          ...this.sidebarWrapperService.params$.value.articleData.bookmarks,
          count: this.sidebarWrapperService.params$.value.articleData.bookmarks.count + (bookmarked ? 1 : -1),
          you: bookmarked
        }
      }
    });
  }
}
