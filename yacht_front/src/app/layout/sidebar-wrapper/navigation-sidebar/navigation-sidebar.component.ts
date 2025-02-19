import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, OperatorFunction, EMPTY, of, combineLatest } from 'rxjs';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { ICompanyView } from '@api/schemas/company/company-view.interface';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { map, takeUntil, switchAll, switchMap, mergeMap, tap } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { FeedService } from '@api/routes/feed.service';
import { SessionService } from '@app/services/session.service';
import { UsersService } from '@api/routes/users.service';
import { CompaniesService } from '@api/routes/companies.service';
import { TopicsService } from '@api/routes/topics.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { ITagView } from '@api/schemas/tags/tag-view.interface';
import { TagsService } from '@api/routes/tags.service';
import { TagOrderEnum } from '@api/schemas/tags/tag-order.enum';
import { IUnread } from '@api/schemas/feed/unread.interface';
import { UserOrderEnum } from '@api/schemas/user/user-order.enum';
import { TopicOrderEnum } from '@api/schemas/topic/topic-order.enum.interface';
import { IWithUnread } from './with-unread.interface';
import { ExpandBoxTemplateEnum } from '@shared/ui/expand-box/expand-box-template.enum';
import { UnreadFilterEnum } from '@api/schemas/feed/unread-filter.enum';
import { HeaderStatsSyncService } from '@layout/shared/services/header-stats-sync.service';

const MAX_ITEMS_COUNT = 15;

@Component({
  selector: 'app-navigation-sidebar',
  templateUrl: './navigation-sidebar.component.html',
  styleUrls: ['./navigation-sidebar.component.scss']
})
export class NavigationSidebarComponent extends AbstractComponent implements OnDestroy, OnInit {
  public readonly expandBoxTemplateEnum: typeof ExpandBoxTemplateEnum = ExpandBoxTemplateEnum;

  public topics: ITopicView[] = [];
  public tags$: Observable<ITagView[]>;
  public companies: ICompanyView[] = [];
  public authors$: Observable<(IUserView & IWithUnread)[]>;

  constructor(
    private readonly topicService: TopicsService,
    private readonly companyService: CompaniesService,
    private readonly userService: UsersService,
    private readonly feedService: FeedService,
    private readonly tagService: TagsService,
    private readonly userDropdownService: UserDropdownService,
    private readonly headerStatsSyncService: HeaderStatsSyncService,
    public readonly sessionService: SessionService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setData();
  }

  private setData(): void {
    const feedService = this.feedService;
    function unreadAuthorMap<T extends IUserView | ICompanyView>(loggedIn: boolean):
      OperatorFunction<IPageResponse<T>, (T & IWithUnread)[]> {
      return map((response: IPageResponse<T>) => {
        return response.content.map((user: T) => ({
          ...user,
          unread$: loggedIn ? feedService.countUnread$(
            UnreadFilterEnum.MY_AUTHOR, user.meta.id
          ).pipe(map((x: IUnread) => x.count)) : EMPTY,
        }));
      });
    }

    this.authors$ = this.headerStatsSyncService.articlesCountSyncEvent$.pipe(
      mergeMap(() => this.sessionService.loggedIn$),
      map((loggedIn: boolean) =>
        this.userService.get$(0, { sub: loggedIn || undefined, order: UserOrderEnum.LAST_POST_TIME })
          .pipe(unreadAuthorMap(loggedIn))
      ),
      switchAll(),
    );
    this.tags$ = this.tagService.get$(0, { order: TagOrderEnum.RECENT_POSTS }).pipe(
      map((response: IPageResponse<ITagView>) => response.content),
    );

    this.getCompanies();
    this.getTopics();

    this.headerStatsSyncService.subEvent$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(
      ([type, id, status]: ['topic' | 'company', number, boolean]) => {
        if (type === 'company') {
          const company: ICompanyView = this.companies.find((comp: ICompanyView) => comp.meta.id === id);
          if (company) {
            company.subscribers.you = status;
          }
        }
        if (type === 'topic') {
          const topic: ITopicView = this.topics.find((top: ITopicView) => top.meta.id === id);
          if (topic) {
            topic.subscribers.you = status;
          }
        }
      }
    );
  }

  private getRecentTopics$(loggedIn: boolean, count: number): Observable<ITopicView[]> {
    const pages$ = combineLatest(
      new Array(Math.ceil(count / 10))
        .fill(0)
        .map((_: number, page: number) =>
          this.topicService.get$(page, { sub: loggedIn ? false : undefined, order: TopicOrderEnum.LAST_POST_TIME })));

    return pages$.pipe(
      map((topics: IPageResponse<ITopicView>[]) =>
        topics.reduce((acc: ITopicView[], val: IPageResponse<ITopicView>) => acc.concat(val.content), []).slice(0, count)),
    );
  }

  private getTopics(): void {
    let loggedIn = false;
    let subbedTopics = [];

    this.sessionService.loggedIn$.pipe(
      tap((data: boolean) => loggedIn = data),
      switchMap(() => loggedIn
        ? this.topicService.get$(0, { sub: true, order: TopicOrderEnum.LAST_POST_TIME })
        : of({ content: [] } as IPageResponse<ITopicView>)),
      map((page: IPageResponse<ITopicView>) => page.content),
      tap((data: ITopicView[]) => subbedTopics = data),
      switchMap((topics: ITopicView[]) => this.getRecentTopics$(loggedIn, MAX_ITEMS_COUNT - topics.length)),
      map((topics: ITopicView[]) => subbedTopics.concat(topics))
    ).subscribe((topics: ITopicView[]) => this.topics = topics);
  }

  private getRecentCompanies$(loggedIn: boolean, count: number): Observable<ICompanyView[]> {
    const pages$ = combineLatest(
      new Array(Math.ceil(count / 10))
        .fill(0)
        .map((_: number, page: number) =>
          this.companyService.get$(page, { sub: loggedIn ? false : undefined, order: UserOrderEnum.LAST_POST_TIME })));

    return pages$.pipe(
      map((topics: IPageResponse<ICompanyView>[]) =>
        topics.reduce((acc: ICompanyView[], val: IPageResponse<ICompanyView>) => acc.concat(...val.content), []).slice(0, count)),
    );
  }

  private getCompanies(): void {
    let loggedIn = false;
    let subbedCompanies = [];

    this.sessionService.loggedIn$.pipe(
      tap((data: boolean) => loggedIn = data),
      switchMap(() => loggedIn
        ? this.companyService.get$(0, { sub: true, order: UserOrderEnum.LAST_POST_TIME })
        : of({ content: [] } as IPageResponse<ICompanyView>)),
      map((page: IPageResponse<ICompanyView>) => page.content),
      tap((data: ICompanyView[]) => subbedCompanies = data),
      switchMap((companies: ICompanyView[]) => this.getRecentCompanies$(loggedIn, MAX_ITEMS_COUNT - companies.length)),
      map((companies: ICompanyView[]) => subbedCompanies.concat(companies))
    ).subscribe((companies: ICompanyView[]) => this.companies = companies);
  }

  public handleSubscribe(item: ITopicView): void {
    if (this.sessionService.loggedIn$.value) {
      this.topicService.subscribe$(item.meta.id, item.subscribers.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        item.subscribers.you = !item.subscribers.you;
        this.headerStatsSyncService.subEvent$.next(['topic', item.meta.id, item.subscribers.you]);
      });
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public handleCompanySubscribe(item: ICompanyView): void {
    if (this.sessionService.loggedIn$.value) {
      this.companyService.subscribe$(item.meta.id, item.subscribers.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        item.subscribers.you = !item.subscribers.you;
        this.headerStatsSyncService.subEvent$.next(['company', item.meta.id, item.subscribers.you]);
      });
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public handleFeedConfiguration(): void {
    if (!this.sessionService.loggedIn$.value) {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public scrollTop(): void {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
}
