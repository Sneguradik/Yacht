package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ArticleVoteRepository : JpaRepository<ArticleVote, Long> {

    fun deleteByUserAndArticle(user: User, article: Article): Long
}