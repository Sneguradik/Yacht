package com.skolopendra.yacht.service

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.entity.FrontPageStory
import com.skolopendra.yacht.features.article.ArticleController
import com.skolopendra.yacht.features.article.ArticleSchemaService
import com.skolopendra.yacht.getReference
import com.skolopendra.yacht.jooq.Tables.ARTICLE
import com.skolopendra.yacht.jooq.Tables.FRONT_PAGE_STORY
import com.skolopendra.yacht.repository.FrontPageStoryRepository
import org.jooq.impl.DSL
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class FrontPageStoryService(
        val repository: FrontPageStoryRepository,
        val articles: ArticleSchemaService,
        val entityManager: EntityManager
) {
    fun create(articleId: Long): FrontPageStory {
        return repository.save(FrontPageStory(article = entityManager.getReference(articleId)))
    }

    fun delete(articleId: Long) {
        repository.delete(repository.findById(articleId).orElseThrow { NoSuchElementException() })
    }

    fun list(userId: Long?): List<GraphResult> {
        val query = articles.graph(userId).apply {
            query.addConditions(DSL.exists(
                    DSL.selectOne().from(FRONT_PAGE_STORY).where(FRONT_PAGE_STORY.ARTICLE_ID.eq(ARTICLE.ID))
            ))
        }
        return query.fetch(ArticleController.PREVIEW)
    }
}