import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, fromEvent } from 'rxjs';
import { ArticlesService } from '@api/routes/articles.service';
import { SessionService } from '@app/services/session.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil, distinctUntilChanged, mergeMap, first } from 'rxjs/operators';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { ResponsiveService } from '@app/services/responsive.service';
import { PlatformService } from '@shared/services/platform.service';
import { IMenuState } from '@layout/shared/interfaces/menu-state.interface';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { toggleFn } from '@layout/shared/functions/toggle-fn.function';
import { NotificationsService } from '@api/routes/notifications.service';
import { NotificationUpdateService } from '@shared/services/notification-update.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { INotification } from '@api/schemas/notification/notification.interface';
import { ViewportScroller } from '@angular/common';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  styles: [
    `:host {
      display: block;
      height: 100%;
      width: 100%;
    }`
  ]
})
export class HeaderComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('query', { static: true }) private query: ElementRef;
  @ViewChild('userMenu', { static: true }) private userMenu: ElementRef;
  @ViewChild('searchBox', { static: true }) private searchBox: ElementRef;
  @ViewChild('noteDropdown', { static: true }) private noteDropdown: ElementRef;

  public searchBoxFocus = false;

  // USER MENU
  public userMenuState: IMenuState = { shown: false, sub: null };

  // SEARCH MENU
  public searchState: IMenuState = { shown: false, sub: null };
  public search: string;

  public noteState: IMenuState = { shown: false, sub: null };
  public noteToggle: any = this.platformService.isBrowser
    ? toggleFn(this.noteState, () => {
        return this.noteDropdown;
      }, takeUntil(this.ngOnDestroy$), () => {
        this.notificationUpdateService.notifications$.pipe(
          first(),
          mergeMap((res: INotification[]) =>
            forkJoin(res.filter((notify: INotification) => !notify.read).map(
              (notify: INotification) => this.notificationsService.markRead$(notify.id)
            )
          )), takeUntil(this.ngOnDestroy$)
        ).subscribe(() => this.notificationUpdateService.update());
      })
    : () => {};

  constructor(
    private readonly router: Router,
    private readonly articleService: ArticlesService,
    private readonly userDropdownService: UserDropdownService,
    public readonly session: SessionService,
    public readonly responsive: ResponsiveService,
    public readonly notificationsService: NotificationsService,
    public readonly userDropdown: UserDropdownService,
    public readonly notificationUpdateService: NotificationUpdateService,
    public readonly platformService: PlatformService,
    public viewportScroller: ViewportScroller
  ) {
    super();
    this.session.loggedIn$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.userDropdownService.setShowDropdown(false);
    });
  }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      document.addEventListener('click', (event: Event) => {
        if (this.searchBoxFocus && !this.searchBox.nativeElement.contains(event.target)) {
          this.searchBoxFocus = false;
        }
      });
      this.subscribeToDropdownChanges();
      this.router.events.pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: RouterEvent) => {
        if (_ instanceof NavigationEnd) {
          this.search = '';
        }
      });
    }

    this.session.user$.pipe(
      distinctUntilChanged((a: IUserViewFull, b: IUserViewFull) => (!a && !b) || (a && b && a.meta.id === b.meta.id)),
      takeUntil(this.ngOnDestroy$),
    ).subscribe((_: IUserViewFull) => {
      _ !== null ? this.notificationUpdateService.subOnNotifications(_.meta.id) : this.notificationUpdateService.disconnect();
    });
  }

  private subscribeToDropdownChanges(): void {
    this.userDropdownService
      .getShowDropdown()
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((shown: boolean) => {
        this.userMenuState = {
          ...this.userMenuState,
          shown,
        };
        if (!shown && this.userMenuState.sub) {
          this.userMenuState.sub.unsubscribe();
        } else if (shown) {
          requestAnimationFrame(() => {
            this.userMenuState.sub = fromEvent(document, 'click').pipe(takeUntil(this.ngOnDestroy$)).subscribe((e: Event) => {
              if (!this.userMenu.nativeElement.contains(e.target)) {
                this.userDropdownService.setShowDropdown(false);
              }
            });
          });
        }
      });
  }

  public toggleUserMenu(): void {
    this.userDropdownService.setShowDropdown(!this.userMenuState.shown);
  }

  public createDraftAndEdit(): void {
    if (this.session.loggedIn$.value) {
      this.articleService.create$().pipe(takeUntil(this.ngOnDestroy$))
        .subscribe((id: number) => this.router.navigate(['/news', id, 'edit']));
    } else {
      this.userDropdownService.setShowDropdown(true);
    }
  }

  public startSearch(): void {
    if (!this.searchBoxFocus) {
      this.searchBoxFocus = true;
      requestAnimationFrame(() => {
        this.query.nativeElement.focus();
        this.query.nativeElement?.setSelectionRange(0, 999);
      });
    }
  }

  public scrollToTopAndNavigate(): void {
    this.router.navigateByUrl('/all');
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
