package com.skolopendra.yacht

import com.skolopendra.yacht.features.article.ArticleService
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
@EnableScheduling
class ArticleStatsUpdateTask(
        val articleService: ArticleService
) {
    @Scheduled(fixedRateString = "PT15M")
    fun run() {
        articleService.updateStats()
    }
}