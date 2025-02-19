package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "article_hide")
class ArticleHide(
        @EmbeddedId
        val id: ArticleHideId,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("userId")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("articleId")
        val article: Article
) {
    constructor(user: User, article: Article) : this(ArticleHideId(user.id, article.id), user = user, article = article)
}
