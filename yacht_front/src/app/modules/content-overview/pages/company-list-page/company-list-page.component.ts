import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractUserListComponent } from '@shared/classes/abstract-user-list-component';
import { CompaniesService } from '@api/routes/companies.service';
import { SessionService } from '@app/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { ICompanyView } from '@api/schemas/company/company-view.interface';
import { extractQuery } from '@shared/functions/extract-query.function';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-company-list-page',
  templateUrl: './company-list-page.component.html',
  styleUrls: ['./company-list-page.component.scss']
})
export class CompanyListPageComponent extends AbstractUserListComponent implements OnInit, OnDestroy {
  public companies: ICompanyView[] = [];

  constructor(
    protected readonly translateService: TranslateService,
    private readonly sidebarWrapperService: SidebarWrapperService,
    private readonly companiesService: CompaniesService,
    private readonly sessionService: SessionService
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
      this.companiesService.get$(this.currentPage, {
        query: this.query || undefined,
        ...extractQuery(this.selectedRange),
        ...extractQuery(this.selectedFilter),
      }).pipe(takeUntil(this.ngOnDestroy$)).subscribe((response: IPageResponse<ICompanyView>) => {
        const handledItems = response.content.filter((item: ICompanyView) => item.meta.id !== this.sessionService.userId);
        this.companies.push(...handledItems);
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.isLoading$.next(false);
      });
    }
  }

  public remove(id: number): void {
    this.companies = this.companies.filter((company: ICompanyView) => company.meta.id !== id);
  }

  public reset(): void {
    this.currentPage = -1;
    this.totalPages = 1;
    this.companies = [];
    this.fetchNextPage();
  }
}
