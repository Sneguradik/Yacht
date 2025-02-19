import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { FeedSourceEnum } from '@shared/enums/feed-source.enum';
import { IFeedParams } from '@api/schemas/feed/feed-params.interface';
import { FeedOrderEnum } from '@api/schemas/feed/feed-order.enum';
import { HomepageService } from '@shared/services/homepage.service';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { FeedService } from '@api/routes/feed.service';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { TopicsService } from '@api/routes/topics.service';
import { FeedComponent } from '@shared/classes/feed-component.class';
import { ActivatedRoute } from '@angular/router';
import { AdministrationService } from '@api/routes/administration.service';
import { AdvertisementService } from '@api/routes/advertisement.service';
import { PlatformService } from '@shared/services/platform.service';
import { ResponsiveService } from '@app/services/responsive.service';
import { TranslateService } from '@ngx-translate/core';
import { SocialLoginService } from '@layout/shared/services/social-login/social-login.service';

@Component({
  selector: 'app-all-page',
  templateUrl: './all-page.component.html',
  styleUrls: ['./all-page.component.scss']
})
export class AllPageComponent extends FeedComponent implements OnInit, OnDestroy {
  public readonly pageable: PageableContent<[IArticleView, ITopicView], IFeedParams> =
    new PageableContent<[IArticleView, ITopicView], IFeedParams>(this.fetch$.bind(this));

  constructor(
    activatedRoute: ActivatedRoute,
    administrationService: AdministrationService,
    protected readonly feedService: FeedService,
    protected readonly topicsService: TopicsService,
    protected readonly advertisementService: AdvertisementService,
    protected readonly platformService: PlatformService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly homepageService: HomepageService,
    public readonly responsive: ResponsiveService,
    protected readonly translateService: TranslateService,
    private readonly socialLoginService: SocialLoginService
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

    this.homepageService.feedSource$.next(FeedSourceEnum.ALL);
    this.pageable.setOptionsWithReset$({ order: FeedOrderEnum.TIME });

    if (this.platformService.isServer) {
      this.pageable.content = this.activatedRoute.snapshot.data.feed;
    }

    if (globalThis.window && window.location.hash.includes('tgAuthResult')) {
      this.socialLoginService.loginWithTg();
    }
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
