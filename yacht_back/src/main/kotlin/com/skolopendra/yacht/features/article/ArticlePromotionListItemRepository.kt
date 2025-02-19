package com.skolopendra.yacht.features.article

import org.springframework.data.jpa.repository.JpaRepository


interface ArticlePromotionListItemRepository : JpaRepository<ArticlePromotionListItem, ArticlePromotionListItemId> {
    fun deleteByArticleAndPromotionList(article: Article, promotionList: ArticlePromotionList)
    fun countByPromotionListId(promotionListId: String): Long
}