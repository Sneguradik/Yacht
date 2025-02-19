import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdministrationService } from '@api/routes/administration.service';
import { IEventsJobsControl } from '@api/schemas/dashboard/events-jobs-control.interface';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-events-jobs-management-page',
  templateUrl: './events-jobs-management-page.component.html',
  styleUrls: ['./events-jobs-management-page.component.scss'],
})
export class EventsJobsManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public data$: BehaviorSubject<IEventsJobsControl> = new BehaviorSubject<IEventsJobsControl>(null);
  public saved = false;

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
    this.getData();
  }

  public getData(): void {
    this.administrationService.getEventsJobs$()
        .pipe(takeUntil(this.ngOnDestroy$))
        .subscribe((controls: IEventsJobsControl) => this.data$.next(controls));
  }

  public postData(): void {
    this.administrationService.postEventsJobs$(this.data$.getValue()).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.saved = true;
      setTimeout(() => {
        this.saved = false;
      }, 5000);
    });
  }
}
