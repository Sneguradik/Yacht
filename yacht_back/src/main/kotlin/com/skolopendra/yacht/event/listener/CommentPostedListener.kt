package com.skolopendra.yacht.event.listener

import com.skolopendra.yacht.event.CommentPostedEvent
import com.skolopendra.yacht.event.notification.CommentBody
import com.skolopendra.yacht.event.notification.ReplyBody
import com.skolopendra.yacht.features.article.BookmarkRepository
import com.skolopendra.yacht.features.article.comment.CommentWatchRepository
import com.skolopendra.yacht.service.NotificationService
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Component

@Component
class CommentPostedListener(
        val service: NotificationService,
        val bookmarks: BookmarkRepository,
        val watches: CommentWatchRepository
) : ApplicationListener<CommentPostedEvent> {
    companion object {
        const val BOOKMARKED_POST_COMMENT = "bookmark_comment"
        const val AUTHORED_POST_COMMENT = "post_comment"
        const val REPLY = "comment_reply"
        const val WATCHED_COMMENT_REPLY = "watched_comment_reply"
    }

    override fun onApplicationEvent(event: CommentPostedEvent) {
        // Comment on bookmarked article
        bookmarkNotifications(event)
        // Comment on owned article
        authorCommentNotifications(event)
        // Reply to your comment
        commentReply(event)
        // Reply to watched comment
        notifyWatchers(event)
    }

    private fun notifyWatchers(event: CommentPostedEvent) {
        val parent = event.source.parentComment ?: return
        val watchers = watches.findByComment(parent)
        val body = ReplyBody(reply = CommentBody(event.source), parent = CommentBody(parent))
        for (watcher in watchers) {
            if (watcher.id.userId != event.source.author.id)
                service.sendNotification(watcher.user, WATCHED_COMMENT_REPLY, body)
        }
    }

    private fun bookmarkNotifications(event: CommentPostedEvent) {
        val marks = bookmarks.findByArticle(event.source.article)
        val body = CommentBody(event.source)
        for (mark in marks) {
            // TODO: Optimize this
            if (mark.user.id != event.source.author.id)
                service.sendNotification(mark.user, BOOKMARKED_POST_COMMENT, body)
        }
    }

    private fun authorCommentNotifications(event: CommentPostedEvent) {
        if (event.source.author.id != event.source.article.author.id)
            service.sendNotification(event.source.article.author, AUTHORED_POST_COMMENT, CommentBody(event.source))
    }

    private fun commentReply(event: CommentPostedEvent) {
        if (event.source.parentComment != null && event.source.parentComment.author.id != event.source.author.id)
            service.sendNotification(event.source.parentComment.author, REPLY, CommentBody(event.source))
    }
}