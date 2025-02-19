package com.skolopendra.yacht.features.article.comment

import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByArticle(article: Article): List<Comment>
    fun countByArticle(article: Article): Long
    fun countByAuthorAndDeletedAtIsNull(user: User): Long
    fun countAllByCreatedAtBetweenAndAuthorIsIn(createdAt: Timestamp, createdAt2: Timestamp, author: List<User>): Int


    @Modifying
    @Query("UPDATE Comment c SET c.author = :master WHERE c.author = :slave")
    fun migrate(@Param("master") master: User, @Param("slave") slave: User)

    fun deleteAllByAuthor(user: User)
}
