import { Component, OnInit } from '@angular/core';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { FeedService } from '@api/routes/feed.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { Observable } from 'rxjs';
import { ExpandBoxTemplateEnum } from '@shared/ui/expand-box/expand-box-template.enum';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-trending-sidebar',
  templateUrl: './trending-sidebar.component.html',
  styleUrls: ['./trending-sidebar.component.scss']
})
export class TrendingSidebarComponent extends AbstractComponent implements OnInit {
  public readonly expandBoxTemplateEnum: typeof ExpandBoxTemplateEnum = ExpandBoxTemplateEnum;

  public news: IArticleView[] = [];
  public discussed: IArticleView[] = [];
  public todayReading: IArticleView[] = [];

  constructor(
    private readonly feedService: FeedService,
    private readonly router: Router,
    private readonly viewportScroller: ViewportScroller,
    public readonly translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    const news$: Observable<IPageResponse<IArticleView>> = this.feedService.news$().pipe(takeUntil(this.ngOnDestroy$));
    const discussed$: Observable<IPageResponse<IArticleView>> = this.feedService.discussed$().pipe(takeUntil(this.ngOnDestroy$));
    const viewed$: Observable<IPageResponse<IArticleView>> = this.feedService.viewed$().pipe(takeUntil(this.ngOnDestroy$));

    this.getNews(news$, 'news');
    this.getNews(discussed$, 'discussed');
    this.getNews(viewed$, 'viewed');
  }

  private getNews(news$: Observable<IPageResponse<IArticleView>>, type: string): void {
    news$.subscribe((r: IPageResponse<IArticleView>) => {
      const res: IArticleView[] = r.content.map((item: IArticleView) => ({
        ...item,
        info: {
          ...item.info,
          title: item.info.title || (type === 'news' ? this.translate.instant('COMMON.NEWS_NAME') : this.translate.instant('COMMON.POST_NAME')),
        },
      }));
      switch (type) {
        case 'news':
          this.news = res;
          break;
        case 'discussed':
          this.discussed = res;
          break;
        case 'viewed':
          this.todayReading = res;
          break;
      }
    });
  }

  public changeLang(lang: string): void {
    this.translate.use(lang).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      location.reload();
    });
  }

  public scrollToTopAndNavigate(): void {
    this.router.navigateByUrl('/all');
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
