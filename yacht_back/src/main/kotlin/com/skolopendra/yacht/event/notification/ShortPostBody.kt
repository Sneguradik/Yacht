package com.skolopendra.yacht.event.notification

import com.skolopendra.yacht.features.article.Article

class ShortPostBody(
        article: Article,
        val id: Long = article.id,
        val info: Info = Info(article)
) : INotification {
    class Info(
            article: Article,
            val title: String? = article.title
    )
}