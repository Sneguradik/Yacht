package com.skolopendra.yacht.features.event

import com.skolopendra.yacht.features.article.EventHideId
import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository

interface EventHideRepository : JpaRepository<EventHide, EventHideId> {
    fun deleteByUserAndEvent(user: User, event: Event)
}
