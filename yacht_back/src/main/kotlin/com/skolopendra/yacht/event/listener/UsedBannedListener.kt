package com.skolopendra.yacht.event.listener

import com.skolopendra.yacht.event.UserBannedEvent
import com.skolopendra.yacht.event.notification.BanNotification
import com.skolopendra.yacht.service.NotificationService
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Component

@Component
class UsedBannedListener(
        val service: NotificationService
) : ApplicationListener<UserBannedEvent> {
    companion object {
        const val BANNED = "account_banned"
        const val UNBANNED = "account_unbanned"
    }

    override fun onApplicationEvent(event: UserBannedEvent) {
        service.sendNotification(event.source, if (event.bannedStatus) BANNED else UNBANNED, BanNotification())
    }
}