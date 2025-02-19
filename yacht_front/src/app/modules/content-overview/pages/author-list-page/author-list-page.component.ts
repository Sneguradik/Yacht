import { Component, OnInit, OnDestroy } from '@angular/core';
import { IUserView } from '@api/schemas/user/user-view.interface';
import { UsersService } from '@api/routes/users.service';
import { SessionService } from '@app/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { extractQuery } from '@shared/functions/extract-query.function';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { AbstractUserListComponent } from '@shared/classes/abstract-user-list-component';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { takeUntil } from 'rxjs/operators';
import { IUserQuery } from '@api/schemas/user/user-query.interface';

@Component({
  selector: 'app-author-list-page',
  templateUrl: './author-list-page.component.html',
  styleUrls: ['./author-list-page.component.scss']
})
export class AuthorListPageComponent extends AbstractUserListComponent implements OnInit, OnDestroy {
  public authors: IUserView[] = [];

  constructor(
    protected readonly translateService: TranslateService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super(translateService);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: true, navigation: true, live: false, showSidebar: true });
    });

    super.ngOnInit();
  }

  public fetchNextPage(): void {
    if (!this.isLoading && this.currentPage < this.totalPages - 1) {
      this.isLoading$.next(true);
      this.currentPage += 1;
      const params: IUserQuery = {
        ...extractQuery(this.selectedRange),
        ...extractQuery(this.selectedFilter)
      };
      if (this.query) {
        params.query = this.query;
      }
      this.usersService.get$(this.currentPage, params)
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe((response: IPageResponse<IUserView>) => {
        const handledItems = response.content.filter((item: IUserView) => item.meta.id !== this.sessionService.userId);
        this.authors.push(...handledItems);
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.isLoading$.next(false);
      });
    }
  }

  public remove(id: number): void {
    this.authors = this.authors.filter((author: IUserView) => author.meta.id !== id);
  }

  public reset(): void {
    this.currentPage = -1;
    this.totalPages = 1;
    this.authors = [];
    this.fetchNextPage();
  }
}
