import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '@api/routes/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '@app/services/session.service';
import { Observable, combineLatest, ReplaySubject } from 'rxjs';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { takeUntil, map, filter, switchMap, tap, mergeMap } from 'rxjs/operators';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { FeedService } from '@api/routes/feed.service';
import { CompaniesService } from '@api/routes/companies.service';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { NotificationUpdateService } from '@shared/services/notification-update.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { DynamicMetaTagsService } from '@layout/dynamic-meta-tags/dynamic-meta-tags.service';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { environment } from '@env';
import { idMap } from '@shared/utils/id-map.operator';
import { EventsService } from '@api/routes/events.service';
import { JobsService } from '@api/routes/jobs.service';
import { IEventView } from '@api/schemas/event/event-view.interface';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { HeaderStatsSyncService } from '@layout/shared/services/header-stats-sync.service';
import { Select } from '@ngxs/store';
import { USER_STATS_STATE_TOKEN } from '@app/store/user-stats/user-stats.state';
import { IUserStatsState } from '@app/store/user-stats/interfaces/user-stats-state.interface';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Select(USER_STATS_STATE_TOKEN) public stats$: Observable<IUserStatsState>;

  public readonly commentCount$: ReplaySubject<number> = new ReplaySubject<number>(1);
  public readonly draftCount$: ReplaySubject<number> = new ReplaySubject<number>(1);
  public readonly promotedCount$: ReplaySubject<number> = new ReplaySubject<number>(1);
  public readonly isMe$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public user$: Observable<IUserViewFull>;
  public me$: Observable<boolean>;
  public idOrName$: Observable<string | number>;
  public id$: Observable<number>;

  public authorInfo: IUserViewFull;
  public isMe: boolean;
  public url: string;

  public unreadCount = 0;

  public eventCount$: Observable<number>;
  public jobCount$: Observable<number>;

  constructor(
    protected readonly usersService: UsersService,
    protected readonly sessionService: SessionService,
    private readonly feedService: FeedService,
    private readonly companiesService: CompaniesService,
    private readonly dynamicMetaTagsService: DynamicMetaTagsService,
    private readonly eventsService: EventsService,
    private readonly jobsService: JobsService,
    public readonly headerStatsSyncService: HeaderStatsSyncService,
    public readonly router: Router,
    public readonly perms: PermissionService,
    public readonly notificationUpdateService: NotificationUpdateService,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.setCoreParams();
    this.setParams();
    this.getMainData();
  }

  ngOnDestroy(): void {
    this.dynamicMetaTagsService.setToDefault();
    super.ngOnDestroy();
  }

  private setCoreParams(): void {
    this.idOrName$ = this.activatedRoute.paramMap.pipe(
      tap(() => {
        const urlArray: string[] = this.router.url.split('/');
        this.url = '/' + urlArray[1] + '/' + urlArray[2];
      }),
      idMap()
    );
    this.user$ = this.idOrName$.pipe(mergeMap((id: string | number) => this.usersService.getSingle$(id)), tap(() => this.getMainData()));
    this.id$ = this.user$.pipe(map((user: IUserViewFull) => user.meta.id));
    this.me$ = combineLatest([this.idOrName$, this.sessionService.user$]).pipe(
      map(([id, user]: [string | number, IUserViewFull]) => {
        return (user && id === 'me') || id === user.info.username || id === user.meta.id;
      }),
    );
  }

  private setParams(): void {
    this.id$.pipe(
      switchMap((id: number) => this.usersService.commentCount$(id)),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(this.commentCount$);
    const pageId$ = combineLatest([this.sessionService.user$, this.id$]);
    pageId$.pipe(
      filter(([me, id]: [IUserViewFull, number]) => me.meta.id === id),
      switchMap(([, id]: [any, number]) => this.feedService.count$({ author: id, stage: [PublicationStageEnum.DRAFT] })),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(this.draftCount$);
    this.id$.pipe(
      switchMap((author: number) => combineLatest([
        this.feedService.count$({ bookmark: true, bookmarked: author }),
        this.eventsService.getBookmarked$(author, 0),
        this.jobsService.getBookmarked$(author, 0)
      ])),
      map(([articles, events, jobs]: [number, IPageResponse<IEventView>, IPageResponse<IJobView>]) =>
        articles + events.total + jobs.total),
      takeUntil(this.ngOnDestroy$)
    ).subscribe(this.promotedCount$);
    this.user$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((user: IUserViewFull) => {
      this.authorInfo = user;
      this.isMe = this.sessionService.loggedIn$.value && user.meta.id === this.sessionService.userId;
      if (user.info.company) {
        this.headerStatsSyncService.subEvent$.pipe(
          filter(([type, id, ]: ['topic' | 'company', number, boolean]) => type === 'company' && id === this.authorInfo.meta.id),
          tap(([, , status]: ['topic' | 'company', number, boolean]) => this.authorInfo = {
            ...this.authorInfo,
            subscribers: {
              ...this.authorInfo.subscribers,
              you: status,
            }
          }),
          takeUntil(this.ngOnDestroy$)
        ).subscribe();
      }
      if (user.info.company.isCompany || user.roles?.includes('ROLE_SUPERUSER')) {
        this.jobCount$ = this.companiesService.jobCountNew$(user.meta.id);
        this.eventCount$ = this.companiesService.eventCount$(user.meta.id);
      } else {
        this.jobCount$ = null;
        this.eventCount$ = null;
      }
      if (this.isMe) {
        this.notificationUpdateService.update();
      }
    });
    combineLatest([this.user$, this.sessionService.user$]).pipe(
      map(([page, user]: [IUserViewFull, IUserViewFull]) => page?.meta.id === user?.meta.id),
      takeUntil(this.ngOnDestroy$)
    ).subscribe((isMe: boolean) => {
      this.isMe$.next(isMe);
    });
  }

  private getMainData(): void {
    const user: IUserView = this.activatedRoute.snapshot.data.data;
    this.dynamicMetaTagsService.metaInfo$.next({
      title: user.info.username,
      tags: [
        { property: 'og:title', content: user.info.username },
        { name: 'description', content: user.info.bio },
        { property: 'og:description', content: user.info.bio },
        { property: 'og:image', content: user.info.picture },
        { property: 'og:url', content: environment.url + this.router.url },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Diskurs.Media' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: user.info.username },
        { name: 'twitter:description', content: user.info.bio },
        { name: 'twitter:image', content: user.info.picture }
      ]
    });
  }

  public subFunc(): void {
    this.usersService.subscribe$(this.authorInfo.meta.id, this.authorInfo.subscribers.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
    this.authorInfo = {
      ...this.authorInfo,
      subscribers: {
        ...this.authorInfo.subscribers,
        you: !this.authorInfo.subscribers.you,
      },
    };
    if (this.authorInfo.info.company.isCompany) {
      this.headerStatsSyncService.subEvent$.next(['company', this.authorInfo.meta.id, this.authorInfo.subscribers.you]);
    }
  }
}
