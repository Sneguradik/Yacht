export interface INotificationOrigin {
    id: number;
    createdAt: number;
    read: boolean;
    hidden: boolean;
    type:
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
      | 'comment_mention';
    body: string;
}
