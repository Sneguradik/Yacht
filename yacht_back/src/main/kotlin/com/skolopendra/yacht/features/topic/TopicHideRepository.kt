package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository

interface TopicHideRepository : JpaRepository<TopicHide, TopicHideId> {
    fun deleteByUserAndTopic(user: User, topic: Topic)
    fun findAllByUser(user: User): List<TopicHide>
}
