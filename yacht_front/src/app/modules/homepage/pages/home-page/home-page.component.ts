import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { FeedComponent } from '@shared/classes/feed-component.class';
import { FeedService } from '@api/routes/feed.service';
import { TopicsService } from '@api/routes/topics.service';
import { HomepageService } from '@shared/services/homepage.service';
import { FeedSourceEnum } from '@shared/enums/feed-source.enum';
import { IFeedParams } from '@api/schemas/feed/feed-params.interface';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ActivatedRoute, Params } from '@angular/router';
import { AdministrationService } from '@api/routes/administration.service';
import { AdvertisementService } from '@api/routes/advertisement.service';
import { PlatformService } from '@shared/services/platform.service';
import { ResponsiveService } from '@app/services/responsive.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent extends FeedComponent implements OnInit, OnDestroy {
  public readonly pageable: PageableContent<[IArticleView, ITopicView], IFeedParams> =
    new PageableContent<[IArticleView, ITopicView], IFeedParams>(this.fetch$.bind(this));

  constructor(
    administrationService: AdministrationService,
    protected readonly feedService: FeedService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly topicsService: TopicsService,
    protected readonly advertisementService: AdvertisementService,
    protected readonly platformService: PlatformService,
    private readonly homepageService: HomepageService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    public readonly responsive: ResponsiveService,
    protected readonly translateService: TranslateService
  ) {
    super(feedService, topicsService, administrationService, activatedRoute, advertisementService, platformService);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({
        article: false,
        trending: true,
        navigation: true,
        live: true,
        showSidebar: true
      });
    });
    super.ngOnInit();

    this.homepageService.feedSource$.next(FeedSourceEnum.PERSONAL);
    this.activatedRoute.queryParams.pipe(
      switchMap((params: Params) =>
        this.pageable.setOptionsWithReset$(params.sub ? params : { sub: ['AUTHOR', 'TOPIC'] })),
      takeUntil(this.ngOnDestroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.homepageService.feedSource$.next(FeedSourceEnum.NONE);
    super.ngOnDestroy();
  }

  public onHide(article: IArticleView): void {
    this.pageable.content.splice(
      this.pageable.content.findIndex((item: [IArticleView, ITopicView]) => item[0].meta.id === article.meta.id),
      1,
    );
  }
}
