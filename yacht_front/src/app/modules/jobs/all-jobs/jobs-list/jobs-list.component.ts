import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounce, filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { IJobQuery } from '@api/schemas/job/job-query.interface';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { jobsRanges } from './jobs-ranges.const';
import { JobsService } from '@api/routes/jobs.service';
import { extractQuery } from '@shared/functions/extract-query.function';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss'],
})
export class JobsListComponent extends AbstractComponent implements OnInit, OnDestroy {
  public jobs: IJobView[] = [];
  private query: string;
  private onRange$: Subject<number> = new Subject();

  public readonly ranges: IToggleItem<never, IJobQuery>[] = jobsRanges(this.translateService);
  public readonly isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public selectedRange: IToggleItem = this.ranges[2];
  public currentPage = -1;
  public totalPages = 1;
  public isLoading = false;
  public activeRange: number = this.selectedRange.id;

  constructor(
    private readonly jobsService: JobsService,
    private readonly translateService: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.onRange$
      .pipe(
        debounce(() => this.isLoading$.pipe(filter((_: boolean) => !_))),
        takeUntil(this.ngOnDestroy$))
      .subscribe(() => this.reset());
    this.isLoading$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: boolean) => (this.isLoading = _));
  }

  public fetchNextPage(): void {
    if (!this.isLoading && this.currentPage < this.totalPages - 1) {
      this.isLoading$.next(true);
      this.currentPage += 1;
      this.jobsService.get$(this.currentPage, {
        query: this.query || undefined,
        ...extractQuery(this.selectedRange),
      }).pipe(takeUntil(this.ngOnDestroy$)).subscribe((response: IPageResponse<IJobView>) => {
        this.jobs.push(...response.content);
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.isLoading$.next(false);
      });
    }
  }

  public reset(): void {
    this.currentPage = -1;
    this.totalPages = 1;
    this.jobs = [];
    this.fetchNextPage();
  }

  public remove(job: IJobView): void {
    this.jobs.splice(this.jobs.indexOf(job), 1);
  }

  public rangeEvent(range: IToggleItem): void {
    this.selectedRange = range;
    this.onRange$.next(0);
  }
}
