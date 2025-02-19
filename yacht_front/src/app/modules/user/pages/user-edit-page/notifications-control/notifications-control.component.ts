import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';
import { INotSetting } from '@api/schemas/notification/not-setting.interface';
import { INotificationControl } from './notification-control.interface';
import { SessionService } from '@app/services/session.service';
import { NOTIFICATION_PARAMS } from './notification-params.const';
import { INotificationControlItem } from '@modules/user/pages/user-edit-page/notifications-control/notification-control-item.interface';

@Component({
  selector: 'app-notifications-control',
  templateUrl: './notifications-control.component.html',
  styleUrls: ['./notifications-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsControlComponent implements OnInit, OnChanges {
  @Input() public data: INotSetting[] = [];
  @Input() public userRoles: string[];

  @Output() public readonly settings: EventEmitter<INotSetting[]> = new EventEmitter<INotSetting[]>();

  public params: INotificationControl;

  public get isEditor(): boolean {
    return this.userRoles.includes('ROLE_CHIEF_EDITOR') || this.userRoles.includes('ROLE_SUPERUSER');
  }

  constructor(public readonly session: SessionService) {
    this.params = NOTIFICATION_PARAMS;
  }

  ngOnInit(): void {
    this.parseData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.parseData();
    }
  }

  private parseData(): void {
    if (this.data) {
      Object.values(this.params).forEach((value: INotificationControlItem[]) => {
        value.forEach((notify: INotificationControlItem) => {
          const filteredNotify = this.data.find((item: INotSetting) => item.type === notify.type);
          notify.active = filteredNotify ? filteredNotify.active : notify.active;
        });
      });
    }
  }

  public change(notify: any): void {
    if (notify.disabled) {
      return;
    }

    const notifications: INotSetting[] = [...this.params.comment, ...this.params.publication, ...this.params.system]
      .map((item: INotificationControlItem) => item.type ? { type: item.type, active: item.active } : null)
      .filter(Boolean);

    const selectedNotify = notifications.find((item: INotSetting) => item.type === notify.type);
    selectedNotify.active = !selectedNotify.active;
    this.settings.emit(notifications);
  }

}
