package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ArticleViewRepository : JpaRepository<ArticleView, Long> {
    fun existsByUserAndArticle(user: User, article: Article): Boolean
    fun countByArticle(article: Article): Long
    fun findAllByUser(user: User): List<ArticleView>
    fun findFirstByUserAndArticle(user: User, article: Article): ArticleView?
}
