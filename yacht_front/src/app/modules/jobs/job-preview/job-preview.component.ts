import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { ShowcasesService } from '@api/routes/showcases.service';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { formatMoney } from '@shared/utils/money-format';
import { takeUntil } from 'rxjs/operators';
import { JobsService } from '@api/routes/jobs.service';
import { JobCurrencyEnum } from '@api/schemas/job/job-currency.enum';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';
import { ICreatedObject } from '@api/schemas/object/created-object.interface';

@Component({
  selector: 'app-job-preview',
  templateUrl: './job-preview.component.html',
  styleUrls: ['./job-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobPreviewComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public job: IJobView;
  @Input() public isOwner: boolean;

  @Output() public readonly gone: EventEmitter<void> = new EventEmitter<void>();
  @Output() public readonly goneBookmarked: EventEmitter<[IJobView, string]> = new EventEmitter<[IJobView, string]>();

  public readonly publicationStageEnum: typeof PublicationStageEnum = PublicationStageEnum;

  public get salary(): string {
    const result = [];
    if (this.job.info.minSalary) {
      result.push('от', formatMoney(+this.job.info.minSalary, JobCurrencyEnum[this.job.info.currency]));
    }
    if (this.job.info.maxSalary) {
      result.push('до', formatMoney(+this.job.info.maxSalary, JobCurrencyEnum[this.job.info.currency]));
    }

    return result.join(' ');
  }

  constructor(
    private readonly sessionService: SessionService,
    private readonly jobsService: JobsService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly showcaseService: ShowcasesService,
    public readonly userDropdown: UserDropdownService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.sessionService.user$.pipe(takeUntil(this.ngOnDestroy$)).subscribe((user: IUserViewFull) => {
      this.isOwner = user && user.meta.id === this.job.company.meta.id;
      this.changeDetectorRef.markForCheck();
    });
  }

  public hide(): void {
    this.jobsService.hide$(this.job.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(this.gone);
  }

  public publish(value: boolean): void {
    if (value) {
      this.jobsService.publish$(this.job.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.job.info.publicationStage = PublicationStageEnum.PUBLISHED;
        this.changeDetectorRef.markForCheck();
      });
    } else {
      this.jobsService.withdraw$(this.job.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.job.info.publicationStage = PublicationStageEnum.DRAFT;
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  public delete(): void {
    this.jobsService.delete$(this.job.meta.id).pipe(takeUntil(this.ngOnDestroy$)).subscribe(this.gone);
  }

  public showcase(): void {
    this.jobsService.showcase$(this.job.meta.id).pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((_: ICreatedObject) => this.showcaseService.navigate$(_));
  }

  public toggleBookmark(): void {
    if (this.sessionService.loggedIn$.value) {
      this.jobsService.bookmark$(this.job.meta.id, this.job.bookmarks.you).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
        this.job.bookmarks.you = !this.job.bookmarks.you;
        this.job.bookmarks.count += this.job.bookmarks.you ? 1 : -1;
        this.changeDetectorRef.markForCheck();
        if (!this.job.bookmarks.you) {
          this.goneBookmarked.next([this.job, 'job']);
        }
      });
    } else {
      this.userDropdown.setShowDropdown(true);
    }
  }
}
