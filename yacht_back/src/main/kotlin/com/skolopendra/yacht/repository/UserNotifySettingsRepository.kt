package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.NotifyType
import com.skolopendra.yacht.entity.UserNotifySettings
import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserNotifySettingsRepository : JpaRepository<UserNotifySettings, Long> {
    fun findAllByUser(user: User): List<UserNotifySettings>
    fun findFirstByType(type: NotifyType): UserNotifySettings?
    fun findFirstByTypeAndUser(type: NotifyType, user: User): UserNotifySettings?
    fun findAllByUserAndActiveIsFalse(user: User): List<UserNotifySettings>
    fun findAllByUserAndActiveIsTrue(user: User): List<UserNotifySettings>
    fun deleteAllByUser(user: User)
}
