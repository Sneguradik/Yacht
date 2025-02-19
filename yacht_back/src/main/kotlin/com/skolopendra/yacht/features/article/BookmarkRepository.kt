package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface BookmarkRepository : PagingAndSortingRepository<Bookmark, Long> {
    fun deleteByUserAndArticle(user: User, article: Article): Long
    fun findByArticle(article: Article): List<Bookmark>
}