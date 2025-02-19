package com.skolopendra.yacht.features.article

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ArticleNonUniqueViewRepository : JpaRepository<ArticleNonUniqueView, Long> {

    fun findFirstByArticle(article: Article): ArticleNonUniqueView?

}