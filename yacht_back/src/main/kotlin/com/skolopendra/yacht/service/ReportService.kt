package com.skolopendra.yacht.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.skolopendra.lib.error.RateLimitException
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.configuration.YachtConfiguration
import com.skolopendra.yacht.entity.Report
import com.skolopendra.yacht.event.notification.ReportBody
import com.skolopendra.yacht.features.article.ArticleRepository
import com.skolopendra.yacht.features.article.comment.CommentRepository
import com.skolopendra.yacht.features.event.EventRepository
import com.skolopendra.yacht.features.job.JobRepository
import com.skolopendra.yacht.features.tag.TagRepository
import com.skolopendra.yacht.features.topic.TopicRepository
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRepository
import com.skolopendra.yacht.repository.ReportRepository
import org.springframework.stereotype.Service

@Service
class ReportService(
        private val reports: ReportRepository,
        private val notificationService: NotificationService,
        private val config: YachtConfiguration,
        private val articleRepository: ArticleRepository,
        private val userRepository: UserRepository,
        private val eventRepository: EventRepository,
        private val jobRepository: JobRepository,
        private val tagRepository: TagRepository,
        private val topicRepository: TopicRepository,
        private val commentRepository: CommentRepository,
        private val objectMapper: ObjectMapper
) {
    val baseUrl = if (config.baseUrl[config.baseUrl.length - 1] != '/')
        config.baseUrl + '/'
    else
        config.baseUrl

    companion object {
        const val NOTIFY_REPORT = "content_report"
    }

    data class Message(
            val message: String?,
            val entity: EntityMessage
    )

    data class EntityMessage(
            val name: String,
            val id: Long
    )

    fun fromMessage(type: ReportEntityType, entityId: Long): EntityMessage {

        return when (type) {
            ReportEntityType.ARTICLE -> EntityMessage(config.url.articles, articleRepository.findById(entityId).get().id)
            ReportEntityType.COMPANY -> EntityMessage(config.url.companies, userRepository.findById(entityId).get().id)
            ReportEntityType.EVENT -> EntityMessage(config.url.events, eventRepository.findById(entityId).get().id)
            ReportEntityType.JOB -> EntityMessage(config.url.jobs, jobRepository.findById(entityId).get().id)
            ReportEntityType.TAG -> EntityMessage(config.url.tags, tagRepository.findById(entityId).get().id)
            ReportEntityType.TOPIC -> EntityMessage(config.url.topics, topicRepository.findById(entityId).get().id)
            ReportEntityType.USER -> EntityMessage(config.url.users, userRepository.findById(entityId).get().id)
            ReportEntityType.COMMENT -> EntityMessage(config.url.comments, commentRepository.findById(entityId).get().id)
            else -> throw IllegalStateException("This entity doesn't exist")
        }
    }

    fun report(user: User, type: ReportEntityType, message: String?, id: Long): Report {
        val entity = this.fromMessage(type, id)

        val entityInfo = entityFromMessage(type, id)
        val lastReport = reports.findFirstByUserOrderByCreatedAtDesc(user)
        if (lastReport != null) {
            val dt = System.currentTimeMillis() - lastReport.createdAt.time
            if (dt < 1000 * 60 * 30)
                throw RateLimitException()
        }

        val result = reports.save(Report(reportObjectId = id, reportObjectType = type, message = objectMapper.writeValueAsString(Message(message, entity)), user = user))
        notificationService.broadcastNotification(listOf(Roles.SUPERUSER, Roles.CHIEF_EDITOR), NOTIFY_REPORT, ReportBody(result))
        sendNotificationToAuthor(entityInfo, result)

        return result
    }

    fun entityFromMessage(type: ReportEntityType, entityId: Long): Pair<ReportEntityType, Long> {

        return when (type) {
            ReportEntityType.ARTICLE -> Pair(ReportEntityType.ARTICLE, articleRepository.findById(entityId).get().id)
            ReportEntityType.COMPANY -> Pair(ReportEntityType.COMPANY, userRepository.findById(entityId).get().id)
            ReportEntityType.EVENT -> Pair(ReportEntityType.EVENT, eventRepository.findById(entityId).get().id)
            ReportEntityType.JOB -> Pair(ReportEntityType.JOB, jobRepository.findById(entityId).get().id)
            ReportEntityType.TAG -> Pair(ReportEntityType.TAG, tagRepository.findById(entityId).get().id)
            ReportEntityType.TOPIC -> Pair(ReportEntityType.TOPIC, topicRepository.findById(entityId).get().id)
            ReportEntityType.USER -> Pair(ReportEntityType.USER, userRepository.findById(entityId).get().id)
            ReportEntityType.COMMENT -> Pair(ReportEntityType.COMMENT, commentRepository.findById(entityId).get().id)
            else -> throw IllegalStateException("This entity doesn't exist")
        }
    }

    fun sendNotificationToAuthor(reportEntity: Pair<ReportEntityType, Long>, result: Report) {
        val author = when(reportEntity.first) {
            ReportEntityType.ARTICLE -> articleRepository.findById(reportEntity.second).get().author
            ReportEntityType.COMPANY -> userRepository.findById(reportEntity.second).get()
            ReportEntityType.EVENT -> eventRepository.findById(reportEntity.second).get().company
            ReportEntityType.JOB -> jobRepository.findById(reportEntity.second).get().company
            ReportEntityType.USER -> userRepository.findById(reportEntity.second).get()
            ReportEntityType.COMMENT -> commentRepository.findById(reportEntity.second).get().author
            else -> throw IllegalStateException("This entity doesn't exist")
        }

        notificationService.sendNotification(author, NOTIFY_REPORT, ReportBody(result))
    }

    enum class ReportEntityType {
        ARTICLE, COMPANY, EVENT, JOB, TAG, TOPIC, USER, COMMENT
    }
}
