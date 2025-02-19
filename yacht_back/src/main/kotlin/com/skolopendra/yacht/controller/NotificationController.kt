package com.skolopendra.yacht.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.toResponse
import com.skolopendra.yacht.controller.common.Count
import com.skolopendra.yacht.entity.Notification
import com.skolopendra.yacht.entity.NotifyGroup
import com.skolopendra.yacht.entity.NotifyType
import com.skolopendra.yacht.entity.vo.NotificationVO
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.service.NotificationRepositoryCustom
import com.skolopendra.yacht.service.NotificationService
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RestController
@RequestMapping("/notifications")
class NotificationController(
        val service: NotificationService,
        val objectMapper: ObjectMapper,
        val notificationsService: NotificationRepositoryCustom
) {
    class NotificationDto(
            notification: Notification,
            val id: Long = notification.id,
            val type: String = notification.type,
            val body: Any,
            val createdAt: Long = notification.createdAt.time,
            val isRead: Boolean = notification.read
    )

    data class SettingDTO(
            val type: NotifyType,
            val active: Boolean = false
    )

    @GetMapping("count")
    fun countUnread(): Count {
        return Count(service.countUnread(currentUser()))
    }

//    @GetMapping
//    fun get(
//            @RequestParam("page", defaultValue = "0") page: Int,
//            @RequestParam("order") order: NotifyGroup?,
//            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter): PageResponse<GraphResult> {
//        val pageable = PageRequest.of(page, 10)
//        return service.getNotifications(currentUserIdOrNull(), hidden, pageable, order)
//    }

    @PostMapping("{id}/read")
    fun markRead(@PathVariable("id") notification: Notification) {
        service.markAsRead(notification)
    }

    @PostMapping("settings")
    fun settings(@Valid @RequestBody settings: List<SettingDTO>) {
        service.settings(settings, currentUser())
    }

    @GetMapping("settings")
    fun getSettings(): List<SettingDTO> {
        val result = service.getSettings()

        return result.map {
            SettingDTO(type = it.type!!, active = it.active)
        }
    }

    @GetMapping
    fun get(
            @RequestParam("page", defaultValue = "0") page: Int,
            @RequestParam("order") order: NotifyGroup?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter): PageResponse<NotificationVO> {
        val pageable = PageRequest.of(page, 10)
        return service.getNotificationsUsingJpa(currentUserIdOrNull(), hidden, pageable, order).toResponse()
    }
}
