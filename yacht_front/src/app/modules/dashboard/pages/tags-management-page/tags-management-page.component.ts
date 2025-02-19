import { Component, OnInit, OnDestroy } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { DashboardConstants } from '@modules/dashboard/shared/classes/dashboard-constants.class';
import { PageableContent } from '@shared/classes/pageable-conetnt.class';
import { ITagDashboardView } from '@api/schemas/dashboard/tag-dashboard-view.interface';
import { ITagsStatistic } from '@api/schemas/dashboard/tags-statistics.interface';
import { TagsService } from '@api/routes/tags.service';
import { AdministrationService } from '@api/routes/administration.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { TAGS_NAVS } from './tags-navs.const';
import { tagsFilters } from './tags-filters.interface';
import { ITotalTags } from './total-tags.interface';
import { takeUntil } from 'rxjs/operators';
import { ITabsNavItem } from '@modules/dashboard/shared/ui/dashboard-tabs/tabs-nav-item.interface';
import { ISelectItem } from '@modules/dashboard/shared/ui/dashboard-select/select-item.interface';
import { IRangeParams } from '@modules/dashboard/shared/ui/dashboard-range/range-params.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { BehaviorSubject } from 'rxjs';
import { IStatTags } from '@modules/dashboard/pages/tags-management-page/components/statistic-tags-block/stat-tags.interface';

@Component({
  selector: 'app-tags-management-page',
  templateUrl: './tags-management-page.component.html',
  styleUrls: ['./tags-management-page.component.scss'],
})
export class TagsManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public readonly navs: ITabsNavItem[] = TAGS_NAVS;
  public readonly filters: ISelectItem[] = tagsFilters(this.translateService);

  public selectedNav: ITabsNavItem = this.navs[0];
  public selectedFilter: ISelectItem = this.filters[3];

  public tags$: BehaviorSubject<ITagDashboardView[]> = new BehaviorSubject<ITagDashboardView[]>([]);
  public tagsPage = 0;
  public allTags$: BehaviorSubject<ITotalTags> = new BehaviorSubject<ITotalTags>({
    total: null,
    pages: null
  });

  public stat$: BehaviorSubject<IStatTags> = new BehaviorSubject<IStatTags>(DashboardConstants.TagsStatConstant);
  public range$: BehaviorSubject<IRangeParams> = new BehaviorSubject<IRangeParams>(DashboardConstants.RangeParamsConstant);

  public contentLoading = false;

  constructor(
    private readonly tagsService: TagsService,
    private readonly administrationService: AdministrationService,
    private readonly translateService: TranslateService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: false, navigation: false, live: false, showSidebar: false });
    });
    this.getTags();
    this.getStats();
  }

  public selectNav(nav: ITabsNavItem): void {
    this.selectedNav = nav;
    if (nav.id === 1) {
      this.getStats();
    } else {
      this.clearTags();
      this.getTags();
    }
  }

  public selectFilter(filter: ISelectItem): void {
    this.selectedFilter = filter;
  }

  public refresh(filter?: ISelectItem): void {
    if (filter) {
      this.selectedFilter = filter;
    }
    this.clearTags();
    this.getTags();
  }

  public getTags(): void {
    const allTags = this.allTags$.getValue();
    if ((allTags.total === null || this.tagsPage + 1 <= allTags.pages) && !this.contentLoading) {
      this.contentLoading = true;
      this.administrationService.getTags$(this.tagsPage, this.selectedFilter.payload)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe((tags: PageableContent<ITagDashboardView> | any) => {
        this.allTags$.next({
          total: tags.total,
          pages: tags.totalPages,
        });
        this.tags$.next([...this.tags$.getValue(), ...tags.content]);
        this.tagsPage++;
        this.contentLoading = false;
      });
    }
  }

  public clearTags(): void {
    this.tags$.next([]);
    this.tagsPage = 0;
    this.getTags();
  }

  public deleteTag(id: number): void {
    this.tagsService.delete$(id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() =>
      this.tags$.next(this.tags$.getValue().filter((tag: ITagDashboardView) => tag.meta.id !== id))
    );
  }

  public getStats(): void {
    const range = this.range$.getValue();
    if (range.checkbox) {
      this.administrationService.getStats$(range.before, range.after)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe((res: ITagsStatistic) => this.stat$.next(res.count));
    } else {
      this.administrationService.getStats$()
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe((res: ITagsStatistic) => {
            this.stat$.next(res.count);
          });
    }
  }
}
