import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '@app/services/session.service';
import { FeedService } from '@api/routes/feed.service';
import { UsersService } from '@api/routes/users.service';
import { TopicsService } from '@api/routes/topics.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IArticleView } from '@api/schemas/article/article-view.interface';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { EventsService } from '@api/routes/events.service';
import { JobsService } from '@api/routes/jobs.service';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { Observable, combineLatest, of } from 'rxjs';
import { idMap } from '@shared/utils/id-map.operator';
import { switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { fetchArticlesWithTopics$ } from '@shared/functions/fetch-articles-with-topics.function';
import { IPromotedItems } from './promoted-item.interface';
import { PromotedViewItemTypeEnum } from './promoted-view-item-type.enum';
import { IPromotedViewItem } from './promoted-view-item.interface';
import { IUserPostListRouteData } from './user-post-list-route-data.interface';


@Component({
  selector: 'app-user-promoted-page',
  templateUrl: './user-promoted-page.component.html',
  styleUrls: ['./user-promoted-page.component.scss']
})
export class UserPromotedPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly promotedViewItemTypeEnum: typeof PromotedViewItemTypeEnum = PromotedViewItemTypeEnum;

  public pinned: [IArticleView, ITopicView] = null;
  public items: IPromotedViewItem[] = [];
  public options: [IUserPostListRouteData, IUserViewFull, number];
  public data: IPromotedItems = {
    articles: null,
    events: null,
    jobs: null
  };
  public page = 0;
  public id: number;
  public isFetching = false;
  public isMe: boolean;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly sessionService: SessionService,
    private readonly feedService: FeedService,
    private readonly usersService: UsersService,
    private readonly topicsService: TopicsService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly eventsService: EventsService,
    private readonly jobsService: JobsService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({
        article: false,
        trending: true,
        navigation: true,
        live: false,
        showSidebar: true
      });
    });

    const id$: Observable<number> = this.activatedRoute.paramMap.pipe(
      idMap(),
      switchMap((id: string | number) => this.usersService.getSingle$(id)),
      map((user: IUserViewFull) => user.meta.id),
      tap((id: number) => this.id = id),
      takeUntil(this.ngOnDestroy$),
    );

    combineLatest([id$, this.sessionService.userId$]).pipe(
      takeUntil(this.ngOnDestroy$)
    ).subscribe(([currentId, sessionId]: [number, number]) => {
      this.isMe = currentId === sessionId;
    });

    combineLatest([this.activatedRoute.data as Observable<IUserPostListRouteData>, this.sessionService.user$, id$]).pipe(
      takeUntil(this.ngOnDestroy$)
    ).subscribe((options: [IUserPostListRouteData, IUserViewFull, number]) => {
      this.items = [];
      this.options = options;
      this.options[0].query.bookmarked = this.options[2];
      this.fetchContent();
    });
  }

  @HostListener('window:scroll', []) public onScroll(): void {
    if (window.innerHeight + window.scrollY + 20 >= document.body.offsetHeight) {
      this.fetchContent();
    }
  }

  private fetchContent(): void {
    if (!this.isFetching) {
      this.isFetching = true;
      const fetch: any[] = [];
      if (this.page === 0 || this.data?.articles?.totalPages > this.page) {
        fetch.push(this.feedService.feedRequest$({ ...this.options[0].query, page: this.page }).pipe(
          switchMap((res: IPageResponse<IArticleView>) => fetchArticlesWithTopics$(res, this.topicsService))
        ));
      } else {
        fetch.push(of(null));
      }
      if (this.page === 0 || this.data?.events?.totalPages > this.page) {
        fetch.push(this.eventsService.getBookmarked$(this.id, this.page));
      } else {
        fetch.push(of(null));
      }
      if (this.page === 0 || this.data?.jobs?.totalPages > this.page) {
        fetch.push(this.jobsService.getBookmarked$(this.id, this.page));
      } else {
        fetch.push(of(null));
      }
      combineLatest(fetch).pipe(takeUntil(this.ngOnDestroy$))
        .subscribe(([articles, events, jobs]: [
          IPageResponse<[IArticleView, ITopicView]>,
          IPageResponse<IEventView>,
          IPageResponse<IJobView>
        ]) => {
          if (articles) {
            this.assignPageable('articles', articles);
          }
          if (events) {
            this.assignPageable('events', events);
          }
          if (jobs) {
            this.assignPageable('jobs', jobs);
          }
          if (jobs || events || articles) {
            this.updateItems();
          }
          this.page++;
          this.isFetching = false;
      });
    }
  }

  private sortItems(items: IPromotedViewItem[]): IPromotedViewItem[] {
    // tslint:disable:max-line-length
    return items.sort((a: IPromotedViewItem, b: IPromotedViewItem) => {
      if ((a.type === PromotedViewItemTypeEnum.ARTICLE ? a.item[0].status.publishedAt : (a.item as IJobView | IEventView).info.publishedAt)
        < (b.type === PromotedViewItemTypeEnum.ARTICLE ? b.item[0].status.publishedAt : (b.item as IJobView | IEventView).info.publishedAt)) { return 1; }
      if ((a.type === PromotedViewItemTypeEnum.ARTICLE ? a.item[0].status.publishedAt : (a.item as IJobView | IEventView).info.publishedAt)
        > (b.type === PromotedViewItemTypeEnum.ARTICLE ? b.item[0].status.publishedAt : (b.item as IJobView | IEventView).info.publishedAt)) { return -1; }
      return 0;
    });
    // tslint:enable:max-line-length
  }

  private assignPageable(key: string, data: IPageResponse<any>): void {
    if (this.data[key]) {
      this.data[key].content.push(...data.content);
      this.data[key].page = data.page;
      this.data[key].total = data.total;
      this.data[key].totalPages = data.totalPages;
    } else {
      this.data[key] = data;
    }
  }

  public updateItems(): void {
    let items: IPromotedViewItem[] = [];
    if (this.data.articles.content[0] && this.data.articles.content[0][0].pinned) {
      this.pinned = this.data.articles.content[0];
      this.data.articles.content.splice(this.data.articles.content.indexOf(this.data.articles.content[0]), 1);
    }
    this.data.articles.content.forEach((element: [IArticleView, ITopicView]) => {
      items.push({ item: element, type: PromotedViewItemTypeEnum.ARTICLE });
    });
    this.data.events.content.forEach((element: IEventView) => {
      items.push({ item: element, type: PromotedViewItemTypeEnum.EVENT });
    });
    this.data.jobs.content.forEach((element: IJobView) => {
      items.push({ item: element, type: PromotedViewItemTypeEnum.JOB });
    });
    items = this.sortItems(items);
    this.items = items;
  }

  public remove(item: any, type: string): void {
    this.data[type].content.splice(this.data[type].content.indexOf(item), 1);
    this.updateItems();
  }

  public removeBookmarked(item: IArticleView | IEventView | IJobView, type: 'article' | 'job' | 'event'): void {
    if  (this.isMe) {
      if  (type === 'article') {
        this.items.splice(this.items.findIndex(
          (itemIter: IPromotedViewItem) => itemIter.type === PromotedViewItemTypeEnum.ARTICLE && itemIter.item[0].meta.id === item.meta.id
        ), 1);
      }
      if  (type === 'job') {
        this.items.splice(this.items.findIndex(
          (itemIter: IPromotedViewItem) => itemIter.type === PromotedViewItemTypeEnum.JOB && (itemIter.item as any).meta.id === item.meta.id
        ), 1);
      }
      if  (type === 'event') {
        this.items.splice(this.items.findIndex(
          (itemIter: IPromotedViewItem) => itemIter.type === PromotedViewItemTypeEnum.EVENT
            && (itemIter.item as any).meta.id === item.meta.id
        ), 1);
      }
    }
  }
}
