package com.skolopendra.yacht.event

import com.skolopendra.yacht.features.article.comment.Comment
import org.springframework.context.ApplicationEvent

class CommentPostedEvent(val source: Comment) : ApplicationEvent(source)