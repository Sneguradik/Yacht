import { ICommentNotificationBody } from './comment-notification-body.interface';


export interface IReplyNotificationBody {
  parent: ICommentNotificationBody;
  reply: ICommentNotificationBody;
}
