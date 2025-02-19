package com.skolopendra.yacht.entity.vo

import com.skolopendra.yacht.entity.Notification

class NotificationVO(notificationEl: Notification, bodyEl: String, hiddenEl: Boolean) {
    val id: Long = notificationEl.id
    val type: String = notificationEl.type
    val body: String = bodyEl
    val createdAt: Long = notificationEl.createdAt.time
    val isRead: Boolean = notificationEl.read
    val hidden: Boolean = hiddenEl
}
