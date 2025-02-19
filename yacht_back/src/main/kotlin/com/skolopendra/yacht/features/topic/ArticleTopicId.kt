package com.skolopendra.yacht.features.topic

import java.io.Serializable
import java.util.*
import javax.persistence.Column
import javax.persistence.Embeddable

@Embeddable
class ArticleTopicId(
        @Column(name = "article_id")
        val articleId: Long,

        @Column(name = "topic_id")
        val topicId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is ArticleTopicId) return false
        return articleId == other.articleId && topicId == other.topicId
    }

    override fun hashCode(): Int {
        return Objects.hash(articleId, topicId)
    }
}