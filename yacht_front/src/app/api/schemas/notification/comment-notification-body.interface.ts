import { IUserNotificationBody } from './user-notification-body.interface';
import { ICommentViewFeed } from '../comment/comment-view-feed.interface';


export interface ICommentNotificationBody {
  id: number;
  owner: IUserNotificationBody;
  context: {
    id: number;
    title: string;
  };
  comment: ICommentViewFeed;
}
