import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICommentViewFeed } from '@api/schemas/comment/comment-view-feed.interface';
import { Observable, Subject } from 'rxjs';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { UsersService } from '@api/routes/users.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { takeUntil, map, first, switchMap, tap } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { ECommentsRange } from '@shared/enums/comments-range.enum';
import { TranslateService } from '@ngx-translate/core';
import { extractQuery } from '@shared/functions/extract-query.function';

@Component({
  selector: 'app-user-comments-page',
  templateUrl: './user-comments-page.component.html',
  styleUrls: ['./user-comments-page.component.scss']
})
export class UserCommentsPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  private readonly onFilter$: Subject<number> = new Subject<number>();

  public readonly ranges: IToggleItem<ECommentsRange, { order: ECommentsRange }>[] = [
    {
      id: 0,
      text: this.translateService.instant('COMMON.BY_ORDER'),
      query: () => ({
        order: ECommentsRange.CREATED
      })
    },
    {
      id: 1,
      text: this.translateService.instant('COMMON.POPULAR_FIRST'),
      query: () => ({
        order: ECommentsRange.RATING
      })
    }
  ];

  public activeRange = 0;
  public selectedRange: IToggleItem = this.ranges[0];
  public userComments: ICommentViewFeed[] = [];
  public maxPages = 0;
  public page = 0;
  public isLoadingNextPage = false;
  public user$: Observable<IUserViewFull>;
  public id$: Observable<number>;
  public user: IUserViewFull;

  constructor(
    private readonly usersService: UsersService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly translateService: TranslateService,
    public readonly router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.onFilter$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => this.reset());

    const idOrName$: Observable<string | number> = this.activatedRoute.paramMap.pipe(
      map((paramMap: ParamMap) => {
        const id = paramMap.get('id');
        return /^\d+$/.test(id) ? parseInt(id, 10) : id;
      })
    );
    this.user$ = idOrName$.pipe(
      switchMap((id: string | number) => this.usersService.getSingle$(id)),
      tap((user: IUserViewFull) => this.user = user)
    );
    this.id$ = this.user$.pipe(map((user: IUserViewFull) => user.meta.id));
  }

  public appendPage(page: number): void {
    if (!this.isLoadingNextPage) {
      this.isLoadingNextPage = true;
      this.id$.pipe(
        first(),
        switchMap((author: number) => this.usersService.comments$(page, author, { ...extractQuery(this.selectedRange) })),
        takeUntil(this.ngOnDestroy$)
      ).subscribe((response: IPageResponse<ICommentViewFeed>) => {
        this.isLoadingNextPage = false;
        this.page = response.page;
        this.maxPages = response.totalPages;
        this.userComments.push(...response.content.filter((comment: ICommentViewFeed) => !comment.meta.deletedAt));
      });
    }
  }

  public rangeEvent(range: IToggleItem): void {
    this.selectedRange = range;
    this.activeRange = range?.id;
    this.onFilter$.next(0);
  }

  public reset(): void {
    this.page = 0;
    this.maxPages = 1;
    this.userComments = [];
    this.appendPage(this.page);
  }
}
