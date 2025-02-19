import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IUserWithRoleShort } from '@api/schemas/dashboard/user-with-role-short.interface';
import { AdministrationService } from '@api/routes/administration.service';
import { UsersService } from '@api/routes/users.service';
import { rolesFilters } from './roles-filters.const';
import { ROLES_NAVS } from './roles-navs.const';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { ITabsNavItem } from '@modules/dashboard/shared/ui/dashboard-tabs/tabs-nav-item.interface';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-roles-management-page',
  templateUrl: './roles-management-page.component.html',
  styleUrls: ['./roles-management-page.component.scss'],
})
export class RolesManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly navs: ITabsNavItem[] = ROLES_NAVS;
  public readonly filters: ISelectItem[] = rolesFilters(this.translateService);

  public selectedNav: ITabsNavItem = this.navs[0];
  public selectedFilter: ISelectItem = this.filters[3];

  public users: BehaviorSubject<IUserWithRoleShort[]> = new BehaviorSubject<IUserWithRoleShort[]>([]);

  public page = 0;
  public total = 1;
  public contentLoading = false;

  constructor(
    private readonly administrationService: AdministrationService,
    private readonly translateService: TranslateService,
    private readonly usersService: UsersService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: false, navigation: false, live: false, showSidebar: false });
    });
    this.getUsers();
  }

  public selectNav(nav: ITabsNavItem): void {
    this.selectedNav = nav;
    this.clearUsers();
    this.getUsers();
  }

  public getUsers(): void {
    if ((this.users.getValue() === [] || (this.total === 0 || this.page + 1 <= this.total)) && !this.contentLoading) {
      this.contentLoading = true;
      let role = '';
      switch (this.selectedNav.id) {
        case 0:
          role = 'ROLE_SUPERUSER';
          break;
        case 1:
          role = 'ROLE_CHIEF_EDITOR';
          break;
        case 2:
          role = 'ROLE_SALES';
          break;
        default:
          role = 'ROLE_SUPERUSER';
          break;
      }
      this.administrationService.getUsersByRoleWithQuery$(this.page, role, this.selectedFilter.payload)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe((users: IPageResponse<IUserWithRoleShort>) => {
        this.users.next([...this.users.getValue(), ...users.content]);
        this.total = users.totalPages;
        this.page++;
        this.contentLoading = false;
      });
    }
  }

  private clearUsers(): void {
    this.users.next([]);
    this.page = 0;
  }

  public refresh(filter?: ISelectItem): void {
    if (filter) {
      this.selectedFilter = filter;
    }
    this.clearUsers();
    this.getUsers();
  }

  public setUserRole(id: number, role: string, status: boolean): void {
    this.usersService.setUserRole$(id, role, status).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
  }
}
