import { Component, OnInit, OnDestroy } from '@angular/core';
import { IRatingData } from '@api/schemas/dashboard/ratings-data.interface';
import { AdministrationService } from '@api/routes/administration.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';

@Component({
  selector: 'app-ratings-management-page',
  templateUrl: './ratings-management-page.component.html',
  styleUrls: ['./ratings-management-page.component.scss'],
})
export class RatingsManagementPageComponent extends AbstractComponent implements OnInit, OnDestroy {
  public data: IRatingData;
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

  private getData(): void {
    this.administrationService.getRatings$().pipe(takeUntil(this.ngOnDestroy$)).subscribe((_: IRatingData) => {
      this.data = _;
    });
  }

  public postDataReq(): void {
    this.administrationService.postRatings$(this.data).pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
      this.saved = true;
      setTimeout(() => {
        this.saved = false;
      }, 5000);
    });
  }
}
