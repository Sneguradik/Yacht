package com.skolopendra.yacht.features.article

import org.springframework.data.jpa.repository.JpaRepository

interface ArticleStatsRepository : JpaRepository<ArticleStats, Long> {
    fun findFirstByArticle(article: Article): ArticleStats?
}