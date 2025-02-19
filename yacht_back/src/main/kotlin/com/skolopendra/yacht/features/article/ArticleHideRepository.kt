package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository

interface ArticleHideRepository : JpaRepository<ArticleHide, ArticleHideId> {
    fun deleteByUserAndArticle(user: User, article: Article)
}