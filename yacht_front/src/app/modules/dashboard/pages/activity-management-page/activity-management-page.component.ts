import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardConstants } from '@modules/dashboard/shared/classes/dashboard-constants.class';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { AdministrationService } from '@api/routes/administration.service';
import { IActivityView } from '@api/schemas/dashboard/activity-view.interface';
import { IRangeParams } from '@modules/dashboard/shared/ui/dashboard-range/range-params.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-activity-management-page',
  templateUrl: './activity-management-page.component.html',
  styleUrls: ['./activity-management-page.component.scss'],
})
export class ActivityManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public stat$: BehaviorSubject<IActivityView> = new BehaviorSubject<IActivityView>(DashboardConstants.ActivityConstant);
  public range$: BehaviorSubject<IRangeParams> = new BehaviorSubject<IRangeParams>(DashboardConstants.RangeParamsConstant);

  constructor(
    private readonly administrationService: AdministrationService,
    private readonly sidebarWrapperService: SidebarWrapperService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$.next({ article: false, trending: false, navigation: false, live: false, showSidebar: false });
    });
    this.getStats();
  }

  public getStats(): void {
    const range = this.range$.getValue();
    if (range.checkbox) {
      this.administrationService.getActivity$(range.before, range.after)
          .pipe(takeUntil(this.ngOnDestroy$))
          .subscribe((res: IActivityView) => this.stat$.next(res));
    } else {
        this.administrationService.getActivity$()
            .pipe(takeUntil(this.ngOnDestroy$))
            .subscribe((res: IActivityView) => this.stat$.next(res));
    }
  }
}
