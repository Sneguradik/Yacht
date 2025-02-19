package com.skolopendra.yacht.event.listener

import com.skolopendra.yacht.event.UserSubscribedEvent
import com.skolopendra.yacht.event.notification.UserBody
import com.skolopendra.yacht.service.NotificationService
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Component

@Component
class UserSubscribedListener(
        val service: NotificationService
) : ApplicationListener<UserSubscribedEvent> {
    companion object {
        const val EVENT_TYPE = "new_subscriber"
    }

    override fun onApplicationEvent(event: UserSubscribedEvent) {
        service.sendNotification(event.source, EVENT_TYPE, UserBody(event.subscriber))
    }
}