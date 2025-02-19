import { IFeedParams } from '@api/schemas/feed/feed-params.interface';
import { Observable } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { switchMap, takeUntil } from 'rxjs/operators';
import { FeedService } from '@api/routes/feed.service';
import { TopicsService } from '@api/routes/topics.service';
import { AbstractComponent } from './abstract-component.class';
import { fetchArticlesWithTopics$ } from '@shared/functions/fetch-articles-with-topics.function';
import { IEventsJobsControl } from '@api/schemas/dashboard/events-jobs-control.interface';
import { AdministrationService } from '@api/routes/administration.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { IBannerPageableContent } from '@modules/dashboard/pages/ads-management-page/banner-pageable-content.interface';
import { AdvertisementService } from '@api/routes/advertisement.service';
import { BannerPlaceEnum } from '@api/schemas/advertisement/banner-place.enum';
import { IBannerReturnView } from '@api/schemas/advertisement/banner-return-view.interface';
import { PlatformService } from '@shared/services/platform.service';

@Component({
    template: ''
})
export abstract class FeedComponent extends AbstractComponent implements OnInit {

    @ViewChild('adElem1', { static: false }) private adElem1: ElementRef;
    @ViewChild('adElem2', { static: false }) private adElem2: ElementRef;
    @ViewChild('adElem3', { static: false }) private adElem3: ElementRef;

    public ads: IBannerPageableContent[];
    public adNums: number[] = [0, 0, 0];
    public adViewedProps: boolean[] = [false, false, false];

    public eventsJobs: IEventsJobsControl;
    public feed = false;
    public publications = false;

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

    constructor(
      protected readonly feedService: FeedService,
      protected readonly topicsService: TopicsService,
      protected readonly administrationService: AdministrationService,
      protected readonly activatedRoute: ActivatedRoute,
      protected readonly advertisementService: AdvertisementService,
      protected readonly platformService: PlatformService
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
        this.administrationService.getEventsJobs$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IEventsJobsControl) => {
            this.eventsJobs = _;
        });
        this.activatedRoute.url.pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: UrlSegment[]) => {
            if (_.toString() === '') {
                this.feed = true;
            } else if (_.toString() === 'all') {
                this.publications = true;
            }
        });
        if (this.platformService.isBrowser) {
            this.getAd();
        }
    }

    protected fetch$(page: number, options: IFeedParams): Observable<IPageResponse<[IArticleView, ITopicView]>> {
        return this.feedService.feedRequest$({ ...options, page })
          .pipe(switchMap((article: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(article, this.topicsService)));
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
}
