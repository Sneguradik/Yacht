package com.skolopendra.yacht.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.configuration.WebSocketConfig
import com.skolopendra.yacht.controller.NotificationController
import com.skolopendra.yacht.entity.*
import com.skolopendra.yacht.entity.join.UserRoleService
import com.skolopendra.yacht.entity.vo.NotificationVO
import com.skolopendra.yacht.event.notification.INotification
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRepository
import com.skolopendra.yacht.repository.NotificationRepository
import com.skolopendra.yacht.repository.UserNotifySettingsRepository
import org.jooq.DSLContext
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import javax.persistence.EntityNotFoundException

@Service
class NotificationService(
        private val notifications: NotificationRepository,
        private val objectMapper: ObjectMapper,
        private val users: UserRepository,
        private val simpMessagingTemplate: SimpMessagingTemplate,
        private val notificationRepositoryCustom: NotificationRepositoryCustom,
        private val userNotifySettingsRepository: UserNotifySettingsRepository,
        private val userRoleService: UserRoleService,
        private val dsl: DSLContext
) {
    companion object {
        val DEFAULT = selectTree {
            +"id"
            +"createdAt"
            +"type"
            +"body"
            +"isRead"
            +"hidden"
        }
    }
    // TODO:
    // Service update (article link)
    // Post blocked
    // Post unblocked
    // Post removed
    // Account banned

    fun sendNotification(target: User, type: String, body: INotification) {
        val notification = notifications.save(Notification(user = target, type = type, bodyJson = objectMapper.writeValueAsString(body)))
        simpMessagingTemplate.convertAndSendToUser(
                target.id.toString(),
                WebSocketConfig.TOPIC_USER_PREFIX,
                NotificationController.NotificationDto(notification, body = objectMapper.readTree(notification.bodyJson))
        )
    }

    fun sendNotificationToAllUsers(target: List<User>, type: String, body: INotification) {

        val notificationsArr = target.map {
            Notification(user = it, type = type, bodyJson = objectMapper.writeValueAsString(body))
        }.toList()

        notifications.saveAll(notificationsArr).forEach {
            simpMessagingTemplate.convertAndSendToUser(
                    it.user.id.toString(),
                    WebSocketConfig.TOPIC_USER_PREFIX,
                    NotificationController.NotificationDto(it, body = objectMapper.readTree(it.bodyJson))
            )
        }
    }

    fun broadcastNotification(roles: List<String>, type: String, body: INotification) {
        userRoleService.findUsersByRoles(roles).forEach {
            sendNotification(it, type, body)
        }
    }

    fun getNotifications(user: Long?, hidden: TriStateFilter, pageable: PageRequest, order: NotifyGroup?): PageResponse<GraphResult> {
        return notificationRepositoryCustom.graph(user, hidden.value).apply {
            notificationRepositoryCustom.applyQuery(query, user, order, hidden)
        }.fetchPage(DEFAULT, pageable).response()
    }

    fun markAsRead(notification: Notification) {
        notification.read = true
        notifications.save(notification)
    }

    fun countUnread(user: User): Number {
        val allUserNotifySettings = userNotifySettingsRepository.findAllByUserAndActiveIsFalse(user).map { it.type!! }

        val notifiesType = NotifyType.values().toMutableList()
        notifiesType.removeAll(allUserNotifySettings)

        return notifications.countByUserAndReadIsFalseAndTypeIn(user, notifiesType.map { it.type })
    }

    @Transactional
    fun settings(settings: List<NotificationController.SettingDTO>, user: User) {
        userNotifySettingsRepository.saveAll(settings.map {
            userNotifySettingsRepository.findFirstByTypeAndUser(it.type, user)?.apply {
                type = it.type
                active = it.active
            } ?: UserNotifySettings(type = it.type, user = user, active = it.active)
        })
    }

    fun getSettings(): List<UserNotifySettings> =
            userNotifySettingsRepository.findAllByUser(currentUser())

    fun getNotificationsUsingJpa(user: Long?, hidden: TriStateFilter, pageable: PageRequest, order: NotifyGroup?): Page<NotificationVO> {

        val existUser = users.findByIdOrNull(user) ?: throw EntityNotFoundException("User with id $user not found")
        if(existUser.isDeleted)
            throw NoSuchElementException("User not found")

        val notifySettings = NotifyType.values().toMutableList()
        val allUserNotifySettings = userNotifySettingsRepository.findAllByUserAndActiveIsFalse(existUser).map { it.type!! }

        when (hidden) {
            TriStateFilter.INCLUDE -> Unit
            else -> notifySettings.removeAll(allUserNotifySettings)
        }

        val activeNotifySettings = filterGroups(notifySettings.map { it.type }, order)
        val hiddenSettings = allUserNotifySettings.map { it.type }

        return when (order) {
            NotifyGroup.UNREAD -> this.notifications.findAllByUserAndReadIsFalseAndTypeInOrderByReadAscCreatedAtDesc(existUser, activeNotifySettings, pageable)
            else -> this.notifications.findAllByUserAndTypeInOrderByReadAscCreatedAtDesc(existUser, activeNotifySettings, pageable)
        }.map { NotificationVO(it, bodyEl = it.bodyJson, hiddenEl = hiddenSettings.contains(it.type)) }
    }

    private fun filterGroups(active: List<String>, order: NotifyGroup?): List<String> {
        return when (order) {
            NotifyGroup.COMMENTS_GROUP -> Notify.commentsTypesString.filter { active.contains(it) }
            NotifyGroup.PUBLICATIONS_GROUP -> Notify.notTypesString.filter { active.contains(it) }
            NotifyGroup.SYSTEM_GROUP -> Notify.systemTypesString.filter { active.contains(it) }
            else -> active
        }
    }
}
