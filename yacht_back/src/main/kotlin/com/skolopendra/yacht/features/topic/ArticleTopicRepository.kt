package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.features.article.Article
import org.springframework.data.jpa.repository.JpaRepository

interface ArticleTopicRepository : JpaRepository<ArticleTopic, ArticleTopicId> {

    fun findAllByTopicAndRank(topic: Topic, rank: Short): List<ArticleTopic>

    fun countAllByTopicAndRank(topic: Topic, rank: Short): Long

    fun deleteAllByTopic(topic: Topic)

    fun findAllByTopic(topic: Topic): List<ArticleTopic>

    fun findFirstByArticleAndTopic(article: Article, topic: Topic): ArticleTopic?
    fun findAllByIdIn(ids: List<ArticleTopicId>): List<ArticleTopic>
    fun findAllByTopicIn(topics: List<Topic>): List<ArticleTopic>
}
