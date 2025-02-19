package com.skolopendra.yacht.features.tag

import com.skolopendra.yacht.features.article.Article
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ArticleTagRepository : JpaRepository<ArticleTag, ArticleTagId> {
    fun countAllByArticle(article: Article): Long?
}