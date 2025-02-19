import { Component, OnInit } from '@angular/core';
import { INotification } from '@api/schemas/notification/notification.interface';
import { NOTIFICATIONS_RANGES } from './notifications-ranges.const';
import { IToggleItem } from '@shared/interfaces/toggle-item.interface';
import { NotificationsService } from '@api/routes/notifications.service';
import { IPageResponse } from '@api/schemas/page/page-response.interface';
import { NotificationUpdateService } from '@shared/services/notification-update.service';
import { SidebarWrapperService } from '@layout/sidebar-wrapper/sidebar-wrapper.service';
import { AbstractComponent } from '@shared/classes/abstract-component.class';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-notifications-page',
  templateUrl: './user-notifications-page.component.html',
  styleUrls: ['./user-notifications-page.component.scss']
})
export class UserNotificationsPageComponent extends AbstractComponent implements OnInit {
  public readonly ranges: IToggleItem<never, { order: string }>[] = NOTIFICATIONS_RANGES;

  public maxPages = 0;
  public page = 0;
  public isLoadingNextPage = false;
  public notifications: INotification[] = [];

  public selectedRange: IToggleItem = this.ranges[0];
  public activeRange = 0;

  constructor(private readonly notificationsService: NotificationsService,
              private readonly sidebarWrapperService: SidebarWrapperService,
              public readonly notificationUpdateService: NotificationUpdateService
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.sidebarWrapperService.params$
        .next({
          article: false,
          trending: true,
          navigation: true,
          live: false,
          showSidebar: true
        });
    });
  }

  public appendPage(page: number): void {
    this.isLoadingNextPage = true;
    this.notificationsService.get$(page, this.selectedRange ? this.selectedRange.payload : null)
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((response: IPageResponse<INotification>) => {
      this.isLoadingNextPage = false;
      this.page = response.page;
      this.maxPages = response.totalPages;
      this.notificationUpdateService.add(response.content as any);
    });
  }

  public rangeEvent(range: IToggleItem): void {
    this.selectedRange = range;
    this.activeRange = range.id;
    this.notificationUpdateService.clear();
    this.notificationUpdateService.updateCount();
    this.appendPage(0);
  }
}
