package com.skolopendra.yacht.event.notification

import com.skolopendra.yacht.features.article.comment.Comment

class FullCommentBody(
        comment: Comment,
        val html: String = comment.renderedHtml
) : CommentBody(comment)