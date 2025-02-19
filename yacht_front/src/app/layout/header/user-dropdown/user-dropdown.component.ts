import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '@app/services/session.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { takeUntil, filter } from 'rxjs/operators';
import { PermissionService } from '@app/services/permission/permission.service';
import { UserDropdownRouteEnum } from './user-dropdown-route.enum';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { Select, Store } from '@ngxs/store';
import { USER_STATS_STATE_TOKEN } from '@app/store/user-stats/user-stats.state';
import { IUserStatsState } from '@app/store/user-stats/interfaces/user-stats-state.interface';
import { UpdateProperty } from '@app/store/user-stats/actions/update-property.action';
import { EUserStatsProperty } from '@app/store/user-stats/enums/user-stats-property.enum';


@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})
export class UserDropdownComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Output() public readonly toggle: EventEmitter<void> = new EventEmitter<void>();

  @Select(USER_STATS_STATE_TOKEN) public data$: Observable<IUserStatsState>;

  public readonly userDropdownRouteEnum: typeof UserDropdownRouteEnum = UserDropdownRouteEnum;

  public isCompany: boolean;
  public currentRoute: UserDropdownRouteEnum;
  public isAdmin = false;
  public isEditor = false;
  public id: string | number;

  constructor(
    private readonly router: Router,
    private readonly permission: PermissionService,
    private readonly store: Store,
    public readonly session: SessionService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getData();
    this.setCurrentRoute();
    this.setUser();
  }

  private setCurrentRoute(): void {
    switch (this.router.url) {
      case '/topics':
      case '/authors':
      case '/companies':
      case '/publications':
      case '/drafts':
      case '/comments':
      case '/settings':
        this.currentRoute = UserDropdownRouteEnum[this.router.url.substring(1).toUpperCase()];
        break;
      case '/user/me/promoted':
        this.currentRoute = UserDropdownRouteEnum.PROMOTED;
        break;
    }
  }

  private setUser(): void {
    this.session.user$.pipe(filter((user: IUserViewFull) => !!user), takeUntil(this.ngOnDestroy$)).subscribe((user: IUserViewFull) => {
      this.id = user.info.username ? user.info.username : user.meta.id;
      this.isCompany = user && user.info.company && user.info.company.isCompany;
    });

    this.permission.hasAnyRole$('ROLE_SUPERUSER').pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: boolean) => {
      this.isAdmin = _;
    });

    this.permission.hasAnyRole$('ROLE_CHIEF_EDITOR').pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: boolean) => {
      this.isEditor = _;
    });
  }

  private getData(): void {
    Object.keys(EUserStatsProperty).forEach((key: string) => {
      this.store.dispatch(new UpdateProperty(EUserStatsProperty[key]));
    });
  }

  public logout(): void {
    this.session.clear();
    if (environment.blocker) {
      this.router.navigate(['/blocker']);
    }
  }
}
