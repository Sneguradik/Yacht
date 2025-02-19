import { IUserNotificationBody } from './user-notification-body.interface';
import { ICommentNotificationBody } from './comment-notification-body.interface';
import { IPostNotificationBody } from './post-notification-body.interface';
import { IShortPostNotificationBody } from './short-post-notification-body.interface';
import { IReportNotificationBody } from './report-notification-body.interface';
import { IReplyNotificationBody } from './reply-notification-body.interface';
import { IFullCommentNotificationBody } from './full-comment-notification-body.interface';


export interface INotification {
    id: number;
    createdAt: number;
    read: boolean;
    type:
      | 'editor_message'
      | 'account_banned'
      | 'account_unbanned'
      | 'new_subscriber'
      | 'comment_reply'
      | 'post_comment'
      | 'bookmark_comment'
      | 'mod_post_blocked'
      | 'mod_post_unblocked'
      | 'mod_post_published'
      | 'mod_post_withdrawn'
      | 'post_deleted'
      | 'mod_post_deleted'
      | 'post_submitted'
      | 'content_report'
      | 'watched_comment_reply'
      | 'comment_mention'
      | 'post_drafted'
      | 'post_reviewing';
    body:
      | IUserNotificationBody
      | ICommentNotificationBody
      | IPostNotificationBody
      | IShortPostNotificationBody
      | IReportNotificationBody
      | IReplyNotificationBody
      | IFullCommentNotificationBody
      | {};
}
