package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.auth.currentUserOrNull
import org.springframework.orm.jpa.JpaSystemException
import org.springframework.stereotype.Service
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Service
class ArticleNonUniqueViewService(
        private val articleNonUniqueViewRepository: ArticleNonUniqueViewRepository,
        private val articleViewRepository: ArticleViewRepository
) {

    @PersistenceContext
    lateinit var entityManager: EntityManager

    fun markViewed(articleId: Long) {
        val articleRef = entityManager.getReference(Article::class.java, articleId)
        val article = articleNonUniqueViewRepository.findFirstByArticle(articleRef)
        articleNonUniqueViewRepository.save(article?.apply { viewsCount += 1 } ?: ArticleNonUniqueView(article = articleRef, viewsCount = 1))
        val user = currentUserOrNull()
        if(user != null && articleRef != null) {
            val userView = articleViewRepository.findFirstByUserAndArticle(user, articleRef)
            if(userView == null)
                articleViewRepository.save(ArticleView(user = user, article = articleRef, fingerprint = null))
        }
    }

    fun countByArticle(articleId: Long): Long {
        val articleRef = entityManager.getReference(Article::class.java, articleId)
        val article = articleNonUniqueViewRepository.findFirstByArticle(articleRef)
        return article?.viewsCount?.toLong() ?: 0L
    }
}
