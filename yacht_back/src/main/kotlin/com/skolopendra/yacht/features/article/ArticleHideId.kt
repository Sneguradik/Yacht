package com.skolopendra.yacht.features.article

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class ArticleHideId(
        var userId: Long,
        var articleId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is ArticleHideId) return false
        return articleId == other.articleId && userId == other.userId
    }

    override fun hashCode(): Int {
        return Objects.hash(userId, articleId)
    }
}