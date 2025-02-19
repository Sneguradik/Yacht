package com.skolopendra.yacht.features.article

import java.io.Serializable
import javax.persistence.Embeddable

@Embeddable
data class ArticlePromotionListItemId(
        var articleId: Long,
        var listId: String
) : Serializable