package com.skolopendra.yacht.features.article

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ArticlePromotionListService(
        private val listItems: ArticlePromotionListItemRepository,
        private val lists: ArticlePromotionListRepository
) {
    fun add(article: Article, list: String): ArticlePromotionListItem {
        return listItems.save(ArticlePromotionListItem(article = article, promotionList = findOrCreate(list.lowercase())))
    }

    fun findOrCreate(name: String) =
            lists.findByIdOrNull(name) ?: lists.save(ArticlePromotionList(name))

    @Transactional
    fun remove(article: Article, list: ArticlePromotionList) {
        listItems.deleteByArticleAndPromotionList(article, list)
    }

    fun count(id: String): Long {
        return listItems.countByPromotionListId(id)
    }
}
