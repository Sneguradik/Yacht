import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { filtersTopics } from './filters-topics.function';
import { rangesTopics } from './ranges-topics.function';
import { ITopicView } from '@api/schemas/topic/topic-view.interface';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { ITopicQuery } from '@api/schemas/topic/topic-query.interface';
import { FilterEnum } from '@shared/enums/filter.enum';
import { RangeEnum } from '@shared/enums/range.enum';
import { TopicsService } from '@api/routes/topics.service';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { TranslateService } from '@ngx-translate/core';
import { ResponsiveService } from '@app/services/responsive.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { debounce, filter, takeUntil } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { extractQuery } from '@shared/functions/extract-query.function';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-topic-list-page',
  templateUrl: './topic-list-page.component.html',
  styleUrls: ['./topic-list-page.component.scss']
})
export class TopicListPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  private readonly onRangeOrFilter$: Subject<number> = new Subject<number>();

  private query: string;

  public readonly filters: IToggleItem<FilterEnum, ITopicQuery>[] = filtersTopics(this.translateService);
  public readonly ranges: IToggleItem<RangeEnum, ITopicQuery>[] = rangesTopics(this.translateService);
  public readonly loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public activeFilter: number = null;
  public activeRange: number = null;
  public topics: ITopicView[] = [];
  public selectedFilter: IToggleItem;
  public selectedRange: IToggleItem = this.ranges[7];
  public itm: string;

  public currentPage = -1;
  public totalPages = 1;
  public isLoading = false;

  constructor(
    private readonly topicsService: TopicsService,
    private readonly sessionService: SessionService,
    private readonly userDropdownService: UserDropdownService,
    private readonly translateService: TranslateService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    public readonly responsive: ResponsiveService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.subscribeToLoggedIn();
    this.onRangeOrFilter$
      .pipe(
        debounce(() => this.isLoading$.pipe(
          filter((_: boolean) => !_))),
        takeUntil(this.ngOnDestroy$))
      .subscribe(() => this.reset());
    this.isLoading$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: boolean) => this.isLoading = _);
    this.responsive.lt.medium.pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: boolean) => _
      ? this.itm = this.translateService.instant('COMMON.TOPICS')
      : this.itm = this.translateService.instant('COMMON.MAIN_TOPICS')
    );
  }

  private subscribeToLoggedIn(): void {
    this.sessionService.loggedIn$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((loggedIn: boolean) => {
      this.loggedIn$.next(loggedIn);
    });
  }

  public fetchNextPage(): void {
    if (!this.isLoading && this.currentPage < this.totalPages - 1) {
      this.isLoading$.next(true);
      this.currentPage += 1;
      this.topicsService.get$(this.currentPage, {
        query: this.query || undefined,
        ...extractQuery(this.selectedRange),
        ...extractQuery(this.selectedFilter),
      }).pipe(takeUntil(this.ngOnDestroy$)).subscribe((response: IPageResponse<ITopicView>) => {
        this.topics.push(...response.content);
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.isLoading$.next(false);
      });
    }
  }

  public reset(): void {
    this.currentPage = -1;
    this.totalPages = 1;
    this.topics = [];
    this.fetchNextPage();
  }

  public handleSearch(query: string): void {
    this.query = query;
    if (!this.isLoading) {
      this.reset();
    }
  }

  public handleSubscribe(item: ITopicView): void {
    if (this.loggedIn$.value) {
      item.subscribers.you = !item.subscribers.you;
      this.topicsService.subscribe$(item.meta.id, !item.subscribers.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public filterEvent(filterEvent: IToggleItem): void {
    this.selectedFilter = filterEvent;
    this.activeFilter = filterEvent?.id;
    this.selectedRange = null;
    this.activeRange = null;
    this.onRangeOrFilter$.next(0);
  }

  public rangeEvent(range: IToggleItem): void {
    this.selectedRange = range;
    this.activeRange = range?.id;
    this.selectedFilter = null;
    this.activeFilter = null;
    this.onRangeOrFilter$.next(0);
  }

  public removeFromArray(topicInput: ITopicView): void {
    this.topics = this.topics.filter((topic: ITopicView) => topic.meta.id !== topicInput.meta.id);
  }
}
