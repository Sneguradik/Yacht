package com.skolopendra.yacht.features.event

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventBookmarkRepository : JpaRepository<EventBookmark, Long> {
    fun deleteByUserAndEvent(user: User, event: Event)
}