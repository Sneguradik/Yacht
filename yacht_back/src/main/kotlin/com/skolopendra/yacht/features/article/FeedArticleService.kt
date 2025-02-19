package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.auth.currentUserOrNull
import com.skolopendra.yacht.features.topic.ArticleTopicRepository
import com.skolopendra.yacht.features.topic.TopicHideRepository
import com.skolopendra.yacht.features.topic.TopicSubscriptionRepository
import com.skolopendra.yacht.features.user.AuthorHideRepository
import com.skolopendra.yacht.features.user.AuthorSubscriptionRepository
import com.skolopendra.yacht.features.user.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import javax.persistence.EntityNotFoundException

@Service
class FeedArticleService(
    private val authorSubscriptionRepository: AuthorSubscriptionRepository,
    private val topicSubscriptionRepository: TopicSubscriptionRepository,
    private val topicHideRepository: TopicHideRepository,
    private val authorHideRepository: AuthorHideRepository,
    private val articleRepository: ArticleRepository,
    private val articleTopicRepository: ArticleTopicRepository,
    private val articleViewRepository: ArticleViewRepository,
    private val userRepository: UserRepository
) {
    fun getUnreadCount(filter: FeedUnreadFilter = FeedUnreadFilter.NONE, author: Long?): Long {
        val user = currentUserOrNull() ?: throw NoSuchElementException("Anonymous user")
        val viewedArticles = articleViewRepository.findAllByUser(user).map { it.article }
        return when(filter) {
            FeedUnreadFilter.SUB -> {
                val authorsHide = authorHideRepository.findAllByUser(user).map { it.author }
                val authors = authorSubscriptionRepository.findAllByUser(user).map { it.author }
                    .filter { !authorsHide.contains(it) }

                val topicsHide = topicHideRepository.findAllByUser(user).map { it.topic }
                val topics = topicSubscriptionRepository.findAllByUser(user).map { it.topic }.filter { !topicsHide.contains(it) }
                val articleTopics = articleTopicRepository.findAllByTopicIn(topics).map { it.article }.filter { !viewedArticles.contains(it) }
                articleRepository.findAllByPublicationStageAndPublishedAtAfterAndAuthorIn(
                    Publication.Stage.PUBLISHED,
                    user.lastLogin,
                    authors
                ).toMutableList().plus(articleTopics).filter { it.publishedAt != null && it.publishedAt!!.after(user.lastLogin) && !viewedArticles.contains(it)}.distinctBy { it.id }.size.toLong()
            }
            FeedUnreadFilter.MY_AUTHOR -> {
                val authorUser = userRepository.findByIdOrNull(author) ?: throw EntityNotFoundException("Author not found")
                articleRepository.findAllByAuthorAndPublicationStageAndPublishedAtAfter(authorUser, Publication.Stage.PUBLISHED, user.lastLogin).filter { !viewedArticles.contains(it) }.size.toLong()
            }
            else -> {
                articleRepository.findAllByPublicationStageAndPublishedAtAfter(Publication.Stage.PUBLISHED, user.lastLogin).filter { !viewedArticles.contains(it) }.size.toLong()
            }
        }
    }
}

enum class FeedUnreadFilter {
    NONE, SUB, MY_AUTHOR
}
