import { Component, OnInit, OnDestroy } from '@angular/core';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { UsersService } from '@api/routes/users.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CompaniesService } from '@api/routes/companies.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil, map, tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-user-info-page',
  templateUrl: './user-info-page.component.html',
  styleUrls: ['./user-info-page.component.scss']
})
export class UserInfoPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public authorInfo: IUserViewFull = null;
  public members: IUserView[] = [];

  public memberPage = 0;
  public memberMaxPages: number;
  public isFetchingPage: boolean;

  constructor(
    private readonly usersService: UsersService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly companiesService: CompaniesService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    this.activatedRoute.paramMap.pipe(
      map((pramMap: ParamMap) => {
        const id = pramMap.get('id');
        return /^\d+$/.test(id) ? parseInt(id, 10) : id;
      }),
      switchMap((id: string | number) => this.usersService.getSingle$(id)),
      tap((user: IUserViewFull) => (this.authorInfo = user)),
      switchMap((user: IUserViewFull) => this.getMembers(user)),
    ).subscribe();
  }

  private getMembers(user: IUserViewFull, page: number = 0): Observable<IUserView[]> {
    this.isFetchingPage = true;
    return this.companiesService.members$(user.meta.id, page).pipe(
      tap((response: IPageResponse<IUserView>) => {
        this.memberPage = page;
        this.memberMaxPages = response.totalPages;
        this.isFetchingPage = false;
      }),
      map((response: IPageResponse<IUserView>) => response.content),
      tap((members: IUserView[]) => {
        this.members = [...this.members, ...members];
      }),
    );
  }

  public onShowMoreMembers(): void {
    if (!this.isFetchingPage && this.memberPage + 1 < this.memberMaxPages) {
      this.getMembers(this.authorInfo, this.memberPage + 1).pipe(takeUntil(this.ngOnDestroy$)).subscribe();
    }
  }

  public goTo(url: string): void {
    window.open(url, '_blank');
  }
}
