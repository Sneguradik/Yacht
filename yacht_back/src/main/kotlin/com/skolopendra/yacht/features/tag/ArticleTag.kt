package com.skolopendra.yacht.features.tag

import com.skolopendra.yacht.features.article.Article
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.io.Serializable
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "article_tag")
class ArticleTag(
        @EmbeddedId
        val id: ArticleTagId,

        @ManyToOne(fetch = FetchType.LAZY)
        @MapsId("articleId")
        val article: Article,

        @ManyToOne(fetch = FetchType.LAZY)
        @MapsId("tagId")
        val tag: Tag,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Column(name = "rank")
        var rank: Short
) : Serializable {
        constructor(article: Article, tag: Tag, rank: Short) : this(ArticleTagId(article.id, tag.id), article, tag, rank = rank)
}
