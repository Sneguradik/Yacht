package com.skolopendra.yacht.event.notification

import com.skolopendra.yacht.features.article.Article

class PostBody(
        article: Article,
        val id: Long = article.id,
        val info: Info = Info(article),
        val owner: UserBody = UserBody(article.author)
) : INotification {
    class Info(
            article: Article,
            val title: String? = article.title,
            val topics: List<Topic?> = article.topics.map {
                Topic(
                        it.topic.id,
                        it.topic.name,
                        it.rank
                )
            }.sortedBy { it.rank }
    )

    data class Topic(
            val id: Long,
            val name: String,
            val rank: Short
    )
}