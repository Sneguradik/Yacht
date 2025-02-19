import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { IFeedNavDropdown } from './feed-nav-item/feed-nav-dropdown.interface';
import { feedDropdownConstant } from './feed-dropdown.const';
import { Observable, of } from 'rxjs';
import { FeedSourceEnum } from '@shared/enums/feed-source.enum';
import { FeedService } from '@api/routes/feed.service';
import { map, takeUntil, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { SessionService } from '@app/services/session.service';
import { HomepageService } from '@shared/services/homepage.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { UnreadFilterEnum } from '@api/schemas/feed/unread-filter.enum';
import { HeaderStatsSyncService } from '@layout/shared/services/header-stats-sync.service';

@Component({
  selector: 'app-feed-nav',
  templateUrl: './feed-nav.component.html',
  styleUrls: ['./feed-nav.component.scss']
})
export class FeedNavComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public isSecondHeader = false;

  public readonly personalDropdownConf: IFeedNavDropdown = feedDropdownConstant.personalDropdownConf;
  public readonly popularDropdownConf: IFeedNavDropdown = feedDropdownConstant.popularDropdownConf;
  public readonly feedSourceEnum: typeof FeedSourceEnum = FeedSourceEnum;

  public unreadPersonal$: Observable<number>;
  public unreadPopular$: Observable<number>;

  public feedSource$: Observable<FeedSourceEnum>;

  public readonly handleClick: CallableFunction = () => {
    if (!this.session.loggedIn$.value) {
      this.userDropdownService.setShowDropdown(true);
    }
  }


  constructor(
    private readonly feedService: FeedService,
    private readonly session: SessionService,
    private readonly userDropdownService: UserDropdownService,
    public readonly homepageService: HomepageService,
    private readonly headerStatSyncService: HeaderStatsSyncService
  ) {
    super();
  }

  ngOnInit(): void {
    const user$ = this.session.user$.pipe(
      distinctUntilChanged((a: IUserViewFull, b: IUserViewFull) => (!a && !b) || (a && b && a.meta.id === b.meta.id)),
      takeUntil(this.ngOnDestroy$),
    );

    this.unreadPersonal$ = this.headerStatSyncService.articlesCountSyncEvent$.pipe(
      mergeMap(() => user$),
      mergeMap((user: IUserViewFull) =>
        (user ? this.feedService.countUnread$(UnreadFilterEnum.SUB) : of(null))),
      map((res: any) => (res ? res.count : null)),
      takeUntil(this.ngOnDestroy$),
    );

    this.unreadPopular$ = this.headerStatSyncService.articlesCountSyncEvent$.pipe(
      mergeMap(() => user$),
      mergeMap((user: IUserViewFull) => (user ? this.feedService.countUnread$() : of(null))),
      map((_: any) => (_ ? _.count : null)),
      takeUntil(this.ngOnDestroy$),
    );
  }
}
