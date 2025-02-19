package com.skolopendra.yacht.features.article

import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.io.Serializable
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "article_promotion_list_item")
class ArticlePromotionListItem(
        @EmbeddedId
        val id: ArticlePromotionListItemId,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("articleId")
        @JoinColumn(name = "article_id", referencedColumnName = "id")
        val article: Article,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "list_id", referencedColumnName = "id")
        @MapsId("listId")
        val promotionList: ArticlePromotionList
) : Serializable {
    constructor(article: Article, promotionList: ArticlePromotionList) : this(ArticlePromotionListItemId(article.id, promotionList.id), article = article, promotionList = promotionList)
}
