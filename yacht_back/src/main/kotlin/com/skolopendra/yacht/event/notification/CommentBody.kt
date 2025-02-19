package com.skolopendra.yacht.event.notification

import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.article.comment.Comment

open class CommentBody(
        comment: Comment,
        val id: Long = comment.id,
        val context: Context = Context(comment.article),
        val owner: UserBody = UserBody(comment.author)
) : INotification {
    class Context(
            article: Article,
            val id: Long = article.id,
            val title: String? = article.title
    )
}