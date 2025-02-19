import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IJobView } from '@api/schemas/job/job-view.interface';
import { ResponsiveService } from '@app/services/responsive.service';
import { SessionService } from '@app/services/session.service';
import { UserDropdownService } from '@layout/shared/services/user-dropdown.service';
import { Observable } from 'rxjs';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { JobsService } from '@api/routes/jobs.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { JobOrderEnum } from '@api/schemas/job/job-order.enum';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent extends AbstractComponent implements OnInit, OnDestroy {
  @Input() public page = 0;
  @Input() public offBG = false;

  public jobs: IJobView[] = [];
  public expanded = false;

  public responsive$: Observable<boolean>;

  constructor(
    private readonly jobsService: JobsService,
    private readonly responsive: ResponsiveService,
    public readonly sessionService: SessionService,
    public readonly userDropdown: UserDropdownService,
    public readonly translate: TranslateService
  ) { super(); }

  ngOnInit(): void {
    this.getJobs();
    this.responsive$ = this.responsive.lt.medium;
  }

  public getJobs(): void {
    this.jobsService.get$(this.page, { order: JobOrderEnum.LAST_POST_TIME }).pipe(
      takeUntil(this.ngOnDestroy$)
    ).subscribe((_: IPageResponse<IJobView>) => {
      this.jobs = _.content;
    });
  }

  public toggleExpand(): void {
    this.expanded = !this.expanded;
  }
}
