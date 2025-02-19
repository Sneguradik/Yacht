package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.topic.ArticleTopic
import com.skolopendra.yacht.features.topic.Topic
import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp

@Repository
interface ArticleRepository : PagingAndSortingRepository<Article, Long> {
    fun findAllByAuthor(author: User): List<Article>
    fun countByAuthorAndPublicationStage(author: User, publicationStage: Publication.Stage): Long
    fun findAllByPinnedAndAuthor(pinned: Boolean, author: User): List<Article>
    fun findAllByPublicationStageAndPublishedAtBetweenAndAuthorIsIn(publicationStage: Publication.Stage, publishedAt: Timestamp, publishedAt2: Timestamp, author: List<User>): List<Article>
    fun findAllByPublicationStageAndPublishedAtAfter(stage: Publication.Stage, after: Timestamp): List<Article>
    fun findAllByPublicationStageAndPublishedAtAfterAndAuthorIn(stage: Publication.Stage, after: Timestamp, authors: List<User>): List<Article>
    fun findAllByAuthorAndPublicationStageAndPublishedAtAfter(author: User, stage: Publication.Stage, after: Timestamp): List<Article>
    @Modifying
    @Query("UPDATE Article a SET a.author = :master WHERE a.author = :slave")
    fun migrate(@Param("master") master: User, @Param("slave") slave: User)
    fun findFirstById(id: Long): Article?

    @Transactional
    @Modifying
    @Query("DELETE from Article WHERE id = :id")
    fun deleteByIdUsingQuery(id: Long)
}
