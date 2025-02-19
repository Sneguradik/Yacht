import { ICommentNotificationBody } from './comment-notification-body.interface';

export interface IFullCommentNotificationBody extends ICommentNotificationBody {
  html: string;
}
