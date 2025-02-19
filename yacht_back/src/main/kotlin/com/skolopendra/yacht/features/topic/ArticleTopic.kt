package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.features.article.Article
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.io.Serializable
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "article_topic")
class ArticleTopic(
        @EmbeddedId
        val id: ArticleTopicId,

        @ManyToOne(fetch = FetchType.LAZY)
        @MapsId("articleId")
        var article: Article,

        @ManyToOne(fetch = FetchType.LAZY)
        @MapsId("topicId")
        var topic: Topic,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Column(name = "rank")
        var rank: Short
) : Serializable {
        constructor(article: Article, topic: Topic, rank: Short) : this(ArticleTopicId(article.id, topic.id), article, topic, rank = rank)
}
