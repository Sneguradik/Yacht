import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FeedService } from '@api/routes/feed.service';
import { TopicsService } from '@api/routes/topics.service';
import { HomepageService } from '@shared/services/homepage.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { FeedSourceEnum } from '@shared/enums/feed-source.enum';
import { Observable, Subject, of, throwError, concat, EMPTY, combineLatest } from 'rxjs';
import { PopularFeedItem } from './popular-feed-item.class';
import {
  map,
  distinct,
  mergeScan,
  switchAll,
  debounce,
  startWith,
  takeUntil,
  pairwise,
  switchMap,
  mergeMap
} from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { FeedOrderEnum } from '@api/schemas/feed/feed-order.enum';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { fetchArticlesWithTopics$ } from '@shared/functions/fetch-articles-with-topics.function';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ActivatedRoute, UrlSegment, Router } from '@angular/router';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IEventsJobsControl } from '@api/schemas/dashboard/events-jobs-control.interface';
import { AdministrationService } from '@api/routes/administration.service';
import { IBannerPageableContent } from '@modules/dashboard/pages/ads-management-page/banner-pageable-content.interface';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';
import { AdvertisementService } from '@api/routes/advertisement.service';
import { PlatformService } from '@shared/services/platform.service';
import { ResponsiveService } from '@app/services/responsive.service';

@Component({
  selector: 'app-popular-page',
  templateUrl: './popular-page.component.html',
  styleUrls: ['./popular-page.component.scss']
})
export class PopularPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('adElem1', { static: false }) private adElem1: ElementRef;
  @ViewChild('adElem2', { static: false }) private adElem2: ElementRef;
  @ViewChild('adElem3', { static: false }) private adElem3: ElementRef;

  private before$: Observable<number>;
  private range$: Observable<number>;
  private count = 0;
  private choice = false;

  public readonly pageable = new PageableContent<PopularFeedItem, [number, number]>(this.fetch$.bind(this));
  public readonly pageAttempt$: Subject<void> = new Subject<void>();

  public eventsJobs: IEventsJobsControl;

  public ads: IBannerPageableContent[];
  public adNums: number[] = [0, 0, 0];
  public adViewedProps: boolean[] = [false, false, false];

  constructor(
    protected readonly feedService: FeedService,
    protected readonly topicsService: TopicsService,
    protected readonly advertisementService: AdvertisementService,
    protected readonly platformService: PlatformService,
    private readonly administrationService: AdministrationService,
    private readonly homepageService: HomepageService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    public readonly responsive: ResponsiveService
  ) {
    super();
    this.ads = [
      {
        content: [],
        currentPage: 0,
        totalPages: 1,
        contentLoading: false,
      },
      {
        content: [],
        currentPage: 0,
        totalPages: 1,
        contentLoading: false,
      },
      {
        content: [],
        currentPage: 0,
        totalPages: 1,
        contentLoading: false,
      },
    ];
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: true, showSidebar: true });
    });
    this.administrationService.getEventsJobs$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IEventsJobsControl) => {
      this.eventsJobs = _;
    });
    this.homepageService.feedSource$.next(FeedSourceEnum.POPULAR);
    this.setRange();
    if (this.platformService.isBrowser) {
      this.getAd();
    }
  }

  @HostListener('window:scroll', ['$event']) public onScroll(): void {
    if (!this.adViewedProps[0] && this.ads[0].content[0] && this.adElem1) {
      this.adViewed(0);
    }
    if (!this.adViewedProps[1] && this.ads[1].content[0] && this.adElem2) {
      this.adViewed(1);
    }
    if (!this.adViewedProps[2] && this.ads[2].content[0] && this.adElem3) {
      this.adViewed(2);
    }
  }

  private setRange(): void {
    this.range$ = this.activatedRoute.url.pipe(
      map((url: UrlSegment[]) => {
        this.choice = url[0].path === 'editorschoice';
        return url[0] ? this.getRange(url[0].path) : null;
      }),
    );

    this.before$ = this.range$.pipe(
      map((range: number) => {
        return this.findRange$(Date.now(), range).pipe(
          mergeMap((start: number) => {
            return concat(
              of(start),
              this.pageAttempt$.pipe(
                distinct(() => 1, this.pageable.end$),
                mergeScan((acc: number) => {
                  return this.choice ? null : this.feedService.count$({ before: acc - range }).pipe(
                    mergeMap((count: number) => {
                      return count === 0 ? EMPTY : this.findRange$(acc - range, range);
                    }),
                  );
                }, start),
              ),
            );
          }),
        );
      }),
      switchAll(),
    );

    combineLatest([
      this.before$,
      this.range$.pipe(debounce(() => this.before$))
    ]).pipe(
      startWith(null as [number, number]),
      pairwise(),
      mergeMap(([a, b]: [[number, number], [number, number]]) => {
        this.homepageService.feedSource$.next(FeedSourceEnum.POPULAR);
        return this.pageable.setOptionsWithReset$(b, !a || !a[1] || a[1] !== b[1]);
      }),
      takeUntil(this.ngOnDestroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.homepageService.feedSource$.next(FeedSourceEnum.NONE);
    super.ngOnDestroy();
  }

  private findRange$(before: number, range: number): Observable<number> {
    return this.feedService.count$({ before, after: before - range }).pipe(
      switchMap((count: number) => {
        return count === 0 && (range && range > 0) ? this.findRange$(before - range, range) : of(before);
      }),
      takeUntil(this.ngOnDestroy$)
    );
  }

  private getRange(name: string): number {
    const DAY: number = 1000 * 60 * 60 * 24;
    switch (name) {
      case 'year':
        return DAY * 365;
      case 'month':
        return DAY * 30;
      case 'week':
        return DAY * 7;
      case 'three-days':
        return DAY * 3;
      case 'day':
        return DAY;
      default:
        return null;
    }
  }

  private fetch$(page: number, options: [number, number]): Observable<IPageResponse<PopularFeedItem>> {
    let result: Observable<any>;
    if (options) {
      const [before, range]: [number, number] = options;
      const after: number = Number.isFinite(range) ? (before - range) : undefined;

      result = this.feedService.feedRequest$({
        page, before, after, order: !this.choice ? FeedOrderEnum.RATING : undefined, list: this.choice ? 'default' : undefined
      }).pipe(
        mergeMap((aPage: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(aPage, this.topicsService)),
        map((response: IPageResponse<[IArticleView, ITopicView]>) => {
          const prefix = response.page === 0 && after ? [new PopularFeedItem(null, { before, after })] : [];
          return response.page === 0 && response.total === 0
            ? { ...response, content: [...prefix, new PopularFeedItem(null, null, true)] }
            : {
              ...response,
              content: prefix.concat(response.content.map((c: [IArticleView, ITopicView]) =>
                new PopularFeedItem(c, null, null, this.counter()))),
            };
        }),
      );
    } else {
      result = throwError(Symbol('NO_CONTENT'));
    }
    return result;
  }

  public getAd(): void {
    this.fetchAd(0);
    this.fetchAd(1);
    this.fetchAd(2);
  }

  public fetchAd(elem: number): void {
    if ((this.ads[elem].content === [] || this.ads[elem].currentPage + 1 <= this.ads[elem].totalPages)
      && !this.ads[elem].contentLoading) {
      this.ads[elem].contentLoading = true;
      this.advertisementService.get$(
        this.ads[elem].currentPage,
        elem === 0 ? BannerPlaceEnum.FEED1 : elem === 1 ? BannerPlaceEnum.FEED2 : BannerPlaceEnum.FEED3
      ).pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IPageResponse<IBannerReturnView>) => {
        this.ads[elem].content.push(..._.content);
        this.ads[elem].totalPages = _.totalPages;
        this.ads[elem].currentPage++;
        this.ads[elem].contentLoading = false;
        if (this.ads[elem].currentPage + 1 <= this.ads[elem].totalPages) {
          this.getAd();
        } else {
          if (this.ads[elem].content[0]) {
            if (!localStorage.getItem('ad-feed' + elem)) {
              localStorage.setItem('ad-feed' + elem, '1');
              this.adNums[elem] = 0;
            } else {
              this.adNums[elem] = Number(localStorage.getItem('ad-feed' + elem)) - 1;
              if (this.adNums[elem] + 1 < this.ads[elem].content.length) {
                this.adNums[elem]++;
              } else {
                this.adNums[elem] = 0;
              }
              localStorage.setItem('ad-feed' + elem, this.adNums[elem] + 1 + '');
            }
          }
        }
      });
    }
  }

  public adViewed(elem: number): void {
    let rect: any;
    switch (elem) {
      case 0:
        rect = this.adElem1.nativeElement.getBoundingClientRect();
        break;
      case 1:
        rect = this.adElem2.nativeElement.getBoundingClientRect();
        break;
      case 2:
        rect = this.adElem3.nativeElement.getBoundingClientRect();
        break;
    }
    const viewHeight: number = Math.max(document.documentElement.clientHeight, window.innerHeight);
    if (!(rect.bottom < 0 || rect.top - viewHeight >= 0) && !this.adViewedProps[elem]) {
      this.advertisementService.view$(this.ads[elem].content[this.adNums[elem]].id)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe();
      this.adViewedProps[elem] = true;
    }
  }

  public adClicked(elem: number): void {
    this.advertisementService.click$(this.ads[elem].content[this.adNums[elem]].id)
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(() => {
        window.open(this.ads[elem].content[this.adNums[elem]].url, '_blank');
    });
  }

  public counter(): number {
    return this.count++;
  }

  public onHide(article: IArticleView, promote?: boolean): void {
    if (promote && this.router.url.includes('editorschoice') || !promote) {
      this.pageable.content.splice(
        this.pageable.content.findIndex((item: PopularFeedItem) => item.isArticle() && item.articleView[0].meta.id === article.meta.id),
        1,
      );
    }
  }

  public findIndex(item: PopularFeedItem): number {
    if (item.isArticle()) {
      return this.pageable.content.filter(
        (iter: PopularFeedItem) => iter.isArticle()
      ).findIndex((iter: PopularFeedItem) => iter.articleView[0].meta.id === item.articleView[0].meta.id) + 1;
    }
    return -1;
  }
}
