interface INotificationType {
    icon: string;
    name: string;
}
const ALERT: INotificationType = {
    icon: 'bell',
    name: 'COMMON.NOTIFICATION',
};
const COMMENT: INotificationType = {
    icon: 'messages',
    name: 'COMMON.COMMENTS__',
};
const MESSAGE: INotificationType = {
    icon: 'comment',
    name: 'COMMON.MESSAGE',
};
const POST: INotificationType = {
    icon: 'edit',
    name: 'COMMON.PUBLICATION',
};

export const TYPE_MAP: { [type: string]: { type: INotificationType; message: string; custom?: boolean } } = {
    new_subscriber: { type: ALERT, message: 'COMMON.NEW_SUBSCRIBER' },
    content_report: { type: ALERT, message: 'COMMON.A_COMPLIANT_FROM_USER', custom: true },
    bookmark_comment: { type: COMMENT, message: 'COMMON.NEW_COMMENT_FROM_BOOKMARK' },
    post_comment: { type: COMMENT, message: 'COMMON.NEW_COMMENT_PUBLICATION' },
    comment_mention: { type: COMMENT, message: 'COMMON.NEW_MEANING' },
    comment_reply: { type: COMMENT, message: 'COMMON.NEW_REPLY_COMMENT' },
    watched_comment_reply: { type: COMMENT, message: 'COMMON.NEW_REPLY_COMMENT_' },
    post_submitted: {type: POST, message: 'COMMON.USER_SENT_MODERATION'},
    mod_post_blocked: {
        type: ALERT,
        message: 'COMMON.POST_BLOCKED_ALERT'
    },
    post_reviewing: { type: POST, message: 'COMMON.PUBLICATION_MODERATING'},
    post_drafted: { type: POST, message: 'COMMON.PUBLICATION_MODERATING_FAILED'},
    account_banned: { type: MESSAGE, message: 'COMMON.YOUR_PROFILE_BANNED', custom: true },
    account_unbanned: { type: MESSAGE, message: 'COMMON.HURRAY_FUNCTIONALITY', custom: true },
    mod_post_unblocked: { type: POST, message: 'COMMON.PUBLICATION_UNBLOCKED' },
    mod_post_published: { type: POST, message: 'COMMON.PUBLICATION_PUBLISHED_' },
    mod_post_withdrawn: {
        type: ALERT,
        message: 'COMMON.PUBLICATION_DRAFTED_'
    },
    post_deleted: { type: POST, message: 'COMMON.THE_PUBLICATION_WAS_DELETED' },
    mod_post_deleted: { type: ALERT, message: 'COMMON.PUBLICATION_DELETED_' },
    editor_message: { type: POST, message: 'COMMON.EDITOR_MESSAGE' }
};
