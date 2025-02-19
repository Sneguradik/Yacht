import { Component, OnInit } from '@angular/core';
import { AbstractComponent } from './abstract-component.class';
import { Subject, BehaviorSubject } from 'rxjs';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { IUserQuery } from '@api/schemas/user/user-query.interface';
import { filtersAuthors } from '@modules/content-overview/pages/author-list-page/filters-authors.function';
import { rangesAuthors } from '@modules/content-overview/pages/author-list-page/ranges-authors.function';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  template: ''
})
export abstract class AbstractUserListComponent extends AbstractComponent implements OnInit {
  protected readonly onRangeOrFilter$: Subject<number> = new Subject<number>();
  protected query: string;

  public readonly isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public activeFilter: number = null;
  public selectedFilter: IToggleItem;
  public filters: IToggleItem<never, IUserQuery>[] = filtersAuthors(this.translateService);
  public ranges: IToggleItem<never, IUserQuery>[] = rangesAuthors(this.translateService);
  public selectedRange: IToggleItem = this.ranges[5];
  public activeRange: number = this.selectedRange.id;

  public currentPage = -1;
  public totalPages = 1;
  public isLoading = false;

  constructor(protected readonly translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.onRangeOrFilter$.pipe(
      takeUntil(this.ngOnDestroy$)
    ).subscribe(() => this.reset());

    this.isLoading$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: boolean) => this.isLoading = _);
  }

  public abstract fetchNextPage(): void;

  public abstract reset(): void;

  public handleSearch(query: string): void {
    this.query = query;
    if (!this.isLoading) {
      this.reset();
    }
  }

  public filterEvent(filterItem: IToggleItem): void {
    this.selectedFilter = filterItem;
    this.activeFilter = filterItem?.id;

    this.selectedRange = null;
    this.activeRange = null;
    this.onRangeOrFilter$.next(0);
  }

  public rangeEvent(range: IToggleItem): void {
    this.selectedRange = range;
    this.activeRange = range?.id;
    this.selectedFilter = null;
    this.activeFilter = null;
    this.onRangeOrFilter$.next(0);
  }
}
