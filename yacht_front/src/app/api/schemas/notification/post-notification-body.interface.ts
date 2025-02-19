import { IUserNotificationBody } from './user-notification-body.interface';
import { IShortPostNotificationBody } from './short-post-notification-body.interface';


export interface IPostNotificationBody extends IShortPostNotificationBody {
  owner: IUserNotificationBody;
}
