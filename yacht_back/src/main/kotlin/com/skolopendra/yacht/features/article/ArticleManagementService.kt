package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.NotifyType
import com.skolopendra.yacht.entity.join.UserRoleService
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.event.notification.PostBody
import com.skolopendra.yacht.event.notification.ShortPostBody
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserId
import com.skolopendra.yacht.features.topic.TopicSubscriptionRepository
import com.skolopendra.yacht.features.user.UserRepository
import com.skolopendra.yacht.service.NotificationService
import com.skolopendra.yacht.service.RoleService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant
import javax.persistence.EntityNotFoundException

@Service
class ArticleManagementService(
        private val articles: ArticleRepository,
        private val notificationService: NotificationService,
        private val users: UserRepository,
        private val userRoleService: UserRoleService,
        private val roleService: RoleService,
        private val topicSubscriptionRepository: TopicSubscriptionRepository
) {
    companion object {
        const val NOTIFY_BLOCKED = "mod_post_blocked"
        const val NOTIFY_UNBLOCKED = "mod_post_unblocked"
        const val NOTIFY_PUBLISHED = "mod_post_published"
        const val NOTIFY_WITHDRAWN = "mod_post_withdrawn"
        const val NOTIFY_DELETED = "post_deleted"
        const val NOTIFY_MOD_DELETED = "mod_post_deleted"
        const val NOTIFY_SUBMITTED = "post_submitted"
        const val NOTIFY_REVIEWING = "post_reviewing"
        const val NOTIFY_DRAFTED = "post_drafted"
    }

    fun block(article: Article) {
        article.notBlocked()
        article.publicationStage = Publication.Stage.BLOCKED
        articles.save(article)
        notificationService.sendNotification(article.author, NotifyType.NOTIFY_BLOCKED.type, ShortPostBody(article))
    }

    fun unblock(article: Article) {
        if (article.publicationStage != Publication.Stage.BLOCKED)
            throw IllegalStateException("Not blocked")
        article.publicationStage = Publication.Stage.DRAFT
        articles.save(article)
        notificationService.sendNotification(article.author, NotifyType.NOTIFY_UNBLOCKED.type, ShortPostBody(article))
    }

    fun publish(article: Article) {
        article.notBlocked()
        if (article.publicationStage == Publication.Stage.PUBLISHED)
            throw IllegalStateException("Already published")
        article.publicationStage = Publication.Stage.PUBLISHED
        if (!article.isEdited!!)
            article.publishedAt = Timestamp.from(Instant.now())

        articles.save(article)
        notificationService.sendNotification(article.author, NotifyType.NOTIFY_PUBLISHED.type, ShortPostBody(article))

        val topics = article.topics.map {
            it.topic
        }
        if (article.author.roles.map { it.role?.name }.contains(Roles.CHIEF_EDITOR)) {
            notificationService.sendNotificationToAllUsers(topicSubscriptionRepository.findAllByTopicIn(topics).map { it.user }, NotifyType.NOTIFY_EDITOR_MESSAGE.type, ShortPostBody(article))
        }
    }

    fun withdraw(article: Article) {
        article.notBlocked()
        if (article.publicationStage == Publication.Stage.DRAFT)
            throw IllegalStateException("Already draft")
        article.publicationStage = Publication.Stage.DRAFT
        articles.save(article)
        notificationService.sendNotification(article.author, NotifyType.NOTIFY_DRAFTED.type, ShortPostBody(article))
    }

    fun submit(article: Article) {
        if (article.publicationStage != Publication.Stage.DRAFT)
            throw IllegalStateException("Not draft")
        article.publicationStage = Publication.Stage.REVIEWING
        article.publishedAt = Timestamp.from(Instant.now())
        articles.save(article)
        val reviewers = userRoleService.findUsersByRoles(listOf(Roles.CHIEF_EDITOR, Roles.SUPERUSER))
        reviewers.forEach {
            notificationService.sendNotification(it, NotifyType.NOTIFY_SUBMITTED.type, PostBody(article))
        }

        notificationService.sendNotification(article.author, NotifyType.NOTIFY_REVIEWING.type, ShortPostBody(article))
    }

    fun retract(article: Article) {
        article.notBlocked()
        if (article.publicationStage == Publication.Stage.DRAFT)
            throw IllegalStateException("Already draft")
        article.publicationStage = Publication.Stage.DRAFT
        articles.save(article)

        notificationService.sendNotification(article.author, NotifyType.NOTIFY_DRAFTED.type, ShortPostBody(article))
    }

    @Transactional
    fun delete(article: Article) {
        val body = ShortPostBody(article)
        val author = article.author
        val isOwner = author.id == currentUserId()
        articles.deleteByIdUsingQuery(article.id)
        if (isOwner)
            notificationService.sendNotification(author, NotifyType.NOTIFY_DELETED.type, body)
        else
            notificationService.sendNotification(author, NotifyType.NOTIFY_MOD_DELETED.type, body)
    }
}
