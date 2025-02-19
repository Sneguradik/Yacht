package com.skolopendra.yacht.features.tag

import java.io.Serializable
import java.util.*
import javax.persistence.Column
import javax.persistence.Embeddable

@Embeddable
class ArticleTagId(
        @Column(name = "article_id")
        val articleId: Long,

        @Column(name = "tag_id")
        val tagId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is ArticleTagId) return false
        return articleId == other.articleId && tagId == other.tagId
    }

    override fun hashCode(): Int {
        return Objects.hash(articleId, tagId)
    }
}