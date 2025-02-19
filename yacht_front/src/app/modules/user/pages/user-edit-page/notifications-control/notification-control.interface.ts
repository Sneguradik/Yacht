import { INotificationControlItem } from '@modules/user/pages/user-edit-page/notifications-control/notification-control-item.interface';

export interface INotificationControl {
  system: INotificationControlItem[];
  comment: INotificationControlItem[];
  publication: INotificationControlItem[];
}
